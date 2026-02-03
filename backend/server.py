from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import razorpay
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client
razorpay_client = razorpay.Client(auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET']))

# JWT configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

# Session configuration for Google OAuth
SESSION_EXPIRATION_DAYS = 7

# Security
security = HTTPBearer(auto_error=False)  # Allow optional auth for Google OAuth

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str = "user"  # user or admin
    verification_status: str = "unverified"  # unverified, pending, verified
    buyer_type: Optional[str] = None  # Hospital, Clinic, Doctor, Distributor
    organization_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    price: float
    image: str
    specifications: Optional[dict] = None
    availability: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    image: str
    specifications: Optional[dict] = None
    availability: bool = True

class CartItem(BaseModel):
    product_id: str
    quantity: int

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[dict]
    total_amount: float
    payment_status: str = "pending"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    delivery_address: dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[dict]
    total_amount: float
    delivery_address: dict

class BulkEnquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    buyer_type: str
    quantity: int
    organization_name: str
    contact_details: dict
    message: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BulkEnquiryCreate(BaseModel):
    product_id: str
    buyer_type: str
    quantity: int
    organization_name: str
    contact_details: dict
    message: Optional[str] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    rating: int
    comment: str
    approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

class VerificationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    buyer_type: str
    organization_name: str
    documents: dict
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VerificationRequestCreate(BaseModel):
    buyer_type: str
    organization_name: str
    documents: dict

# ============= AUTH UTILS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def get_admin_user(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    hashed_password = hash_password(password)
    
    user = User(**user_dict)
    doc = user.model_dump()
    doc["password"] = hashed_password
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.role)
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_doc.pop("password")
    if isinstance(user_doc["created_at"], str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    user = User(**user_doc)
    token = create_token(user.id, user.role)
    return {"token": token, "user": user}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user

# ============= PRODUCT ROUTES =============

@api_router.get("/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct("category")
    return categories

@api_router.post("/admin/products", dependencies=[Depends(get_admin_user)])
async def create_product(product_data: ProductCreate):
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/admin/products/{product_id}", dependencies=[Depends(get_admin_user)])
async def update_product(product_id: str, product_data: ProductCreate):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated"}

@api_router.delete("/admin/products/{product_id}", dependencies=[Depends(get_admin_user)])
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ============= CART ROUTES =============

@api_router.get("/cart")
async def get_cart(user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user.id}, {"_id": 0})
    if not cart:
        return {"items": []}
    
    # Populate product details
    items_with_details = []
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            items_with_details.append({
                **item,
                "product": product
            })
    
    return {"items": items_with_details}

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user.id}, {"_id": 0})
    
    if not cart:
        cart = Cart(user_id=user.id, items=[item.model_dump()])
        doc = cart.model_dump()
        doc["updated_at"] = doc["updated_at"].isoformat()
        await db.carts.insert_one(doc)
    else:
        # Update quantity if product exists, else add new item
        items = cart.get("items", [])
        found = False
        for i in items:
            if i["product_id"] == item.product_id:
                i["quantity"] += item.quantity
                found = True
                break
        if not found:
            items.append(item.model_dump())
        
        await db.carts.update_one(
            {"user_id": user.id},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": "Item added to cart"}

@api_router.put("/cart/update")
async def update_cart(item: CartItem, user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user.id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    for i in items:
        if i["product_id"] == item.product_id:
            i["quantity"] = item.quantity
            break
    
    await db.carts.update_one(
        {"user_id": user.id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Cart updated"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user.id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [i for i in cart.get("items", []) if i["product_id"] != product_id]
    
    await db.carts.update_one(
        {"user_id": user.id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Item removed"}

# ============= ORDER ROUTES =============

@api_router.post("/orders/create-razorpay-order")
async def create_razorpay_order(order_data: OrderCreate, user: User = Depends(get_current_user)):
    # Create Razorpay order
    razorpay_order = razorpay_client.order.create({
        "amount": int(order_data.total_amount * 100),  # Convert to paise
        "currency": "INR",
        "payment_capture": 1
    })
    
    # Save order to database
    order = Order(
        user_id=user.id,
        items=order_data.items,
        total_amount=order_data.total_amount,
        razorpay_order_id=razorpay_order["id"],
        delivery_address=order_data.delivery_address
    )
    
    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.orders.insert_one(doc)
    
    return {
        "order_id": order.id,
        "razorpay_order_id": razorpay_order["id"],
        "amount": razorpay_order["amount"],
        "currency": razorpay_order["currency"]
    }

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@api_router.post("/orders/verify-payment")
async def verify_payment(verification: PaymentVerification, user: User = Depends(get_current_user)):
    try:
        # Verify signature
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": verification.razorpay_order_id,
            "razorpay_payment_id": verification.razorpay_payment_id,
            "razorpay_signature": verification.razorpay_signature
        })
        
        # Update order status
        await db.orders.update_one(
            {"razorpay_order_id": verification.razorpay_order_id},
            {"$set": {
                "payment_status": "completed",
                "razorpay_payment_id": verification.razorpay_payment_id
            }}
        )
        
        # Clear cart
        await db.carts.delete_one({"user_id": user.id})
        
        return {"message": "Payment verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.get("/orders/my-orders")
async def get_my_orders(user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user.id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/admin/orders", dependencies=[Depends(get_admin_user)])
async def get_all_orders():
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

# ============= BULK ENQUIRY ROUTES =============

@api_router.post("/bulk-enquiries")
async def create_bulk_enquiry(enquiry_data: BulkEnquiryCreate, user: User = Depends(get_current_user)):
    enquiry = BulkEnquiry(user_id=user.id, **enquiry_data.model_dump())
    doc = enquiry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.bulk_enquiries.insert_one(doc)
    return enquiry

@api_router.get("/bulk-enquiries/my-enquiries")
async def get_my_enquiries(user: User = Depends(get_current_user)):
    enquiries = await db.bulk_enquiries.find({"user_id": user.id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Populate product details
    for enquiry in enquiries:
        product = await db.products.find_one({"id": enquiry["product_id"]}, {"_id": 0})
        enquiry["product"] = product
    
    return enquiries

@api_router.get("/admin/bulk-enquiries", dependencies=[Depends(get_admin_user)])
async def get_all_bulk_enquiries():
    enquiries = await db.bulk_enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Populate product and user details
    for enquiry in enquiries:
        product = await db.products.find_one({"id": enquiry["product_id"]}, {"_id": 0})
        user = await db.users.find_one({"id": enquiry["user_id"]}, {"_id": 0, "password": 0})
        enquiry["product"] = product
        enquiry["user"] = user
    
    return enquiries

class EnquiryStatusUpdate(BaseModel):
    status: str

@api_router.put("/admin/bulk-enquiries/{enquiry_id}", dependencies=[Depends(get_admin_user)])
async def update_enquiry_status(enquiry_id: str, status_data: EnquiryStatusUpdate):
    result = await db.bulk_enquiries.update_one(
        {"id": enquiry_id},
        {"$set": {"status": status_data.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"message": "Status updated"}

# ============= REVIEW ROUTES =============

@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, user: User = Depends(get_current_user)):
    review = Review(user_id=user.id, **review_data.model_dump())
    doc = review.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.reviews.insert_one(doc)
    return review

@api_router.get("/reviews/product/{product_id}")
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find(
        {"product_id": product_id, "approved": True},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    # Populate user details
    for review in reviews:
        user = await db.users.find_one(
            {"id": review["user_id"]},
            {"_id": 0, "name": 1, "verification_status": 1, "buyer_type": 1}
        )
        review["user"] = user
    
    return reviews

@api_router.get("/reviews/featured")
async def get_featured_reviews():
    reviews = await db.reviews.find(
        {"approved": True, "rating": {"$gte": 4}},
        {"_id": 0}
    ).sort("created_at", -1).limit(6).to_list(6)
    
    # Populate user and product details
    for review in reviews:
        user = await db.users.find_one(
            {"id": review["user_id"]},
            {"_id": 0, "name": 1, "verification_status": 1, "buyer_type": 1}
        )
        product = await db.products.find_one(
            {"id": review["product_id"]},
            {"_id": 0, "name": 1}
        )
        review["user"] = user
        review["product"] = product
    
    return reviews

@api_router.get("/admin/reviews", dependencies=[Depends(get_admin_user)])
async def get_all_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for review in reviews:
        user = await db.users.find_one({"id": review["user_id"]}, {"_id": 0, "password": 0})
        product = await db.products.find_one({"id": review["product_id"]}, {"_id": 0})
        review["user"] = user
        review["product"] = product
    
    return reviews

class ReviewApproval(BaseModel):
    approved: bool

@api_router.put("/admin/reviews/{review_id}", dependencies=[Depends(get_admin_user)])
async def approve_review(review_id: str, approval: ReviewApproval):
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"approved": approval.approved}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review updated"}

# ============= VERIFICATION ROUTES =============

@api_router.post("/verification/submit")
async def submit_verification(verification_data: VerificationRequestCreate, user: User = Depends(get_current_user)):
    verification = VerificationRequest(user_id=user.id, **verification_data.model_dump())
    doc = verification.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.verification_requests.insert_one(doc)
    
    # Update user verification status to pending
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"verification_status": "pending"}}
    )
    
    return verification

@api_router.get("/verification/status")
async def get_verification_status(user: User = Depends(get_current_user)):
    verification = await db.verification_requests.find_one(
        {"user_id": user.id},
        {"_id": 0}
    )
    return verification or {"status": "not_submitted"}

@api_router.get("/admin/verifications", dependencies=[Depends(get_admin_user)])
async def get_all_verifications():
    verifications = await db.verification_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for verification in verifications:
        user = await db.users.find_one({"id": verification["user_id"]}, {"_id": 0, "password": 0})
        verification["user"] = user
    
    return verifications

class VerificationApproval(BaseModel):
    status: str  # approved or rejected

@api_router.put("/admin/verifications/{verification_id}", dependencies=[Depends(get_admin_user)])
async def approve_verification(verification_id: str, approval: VerificationApproval):
    verification = await db.verification_requests.find_one({"id": verification_id}, {"_id": 0})
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    # Update verification status
    await db.verification_requests.update_one(
        {"id": verification_id},
        {"$set": {"status": approval.status}}
    )
    
    # Update user verification status and buyer type
    user_update = {"verification_status": "verified" if approval.status == "approved" else "rejected"}
    if approval.status == "approved":
        user_update["buyer_type"] = verification["buyer_type"]
        user_update["organization_name"] = verification["organization_name"]
    
    await db.users.update_one(
        {"id": verification["user_id"]},
        {"$set": user_update}
    )
    
    return {"message": "Verification updated"}

# ============= CONFIG ROUTES =============

@api_router.get("/config")
async def get_config():
    return {
        "razorpay_key_id": os.environ["RAZORPAY_KEY_ID"],
        "whatsapp_number": os.environ["WHATSAPP_NUMBER"]
    }

# ============= INCLUDE ROUTER =============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()