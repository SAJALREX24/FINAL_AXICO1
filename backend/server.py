from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
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
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

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

class FeatureHighlight(BaseModel):
    icon: str = ""  # Icon name or URL
    title: str
    description: str

class RichContentSection(BaseModel):
    title: str
    description: str
    image: Optional[str] = None
    features: Optional[List[str]] = None

# Available payment methods
PAYMENT_METHODS = [
    "razorpay",      # Online payment (Cards, NetBanking)
    "upi",           # UPI Payment (GPay, PhonePe, Paytm)
    "cod",           # Cash on Delivery
    "bank_transfer", # Direct Bank Transfer
    "emi",           # EMI/Installments
    "pay_later"      # Pay Later option
]

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    price: float
    image: str
    images: Optional[List[str]] = None  # Gallery images
    original_price: Optional[float] = None  # MRP for discount display
    specifications: Optional[dict] = None
    key_features: Optional[List[str]] = None  # Checkmark features
    feature_highlights: Optional[List[dict]] = None  # Icon + title + description
    rich_content: Optional[List[dict]] = None  # Sections with images
    warranty_info: Optional[str] = None
    shipping_info: Optional[str] = None
    payment_methods: Optional[List[str]] = None  # Allowed payment methods for this product
    availability: bool = True
    likes_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    image: str
    images: Optional[List[str]] = None
    original_price: Optional[float] = None
    specifications: Optional[dict] = None
    key_features: Optional[List[str]] = None
    feature_highlights: Optional[List[dict]] = None
    rich_content: Optional[List[dict]] = None
    warranty_info: Optional[str] = None
    shipping_info: Optional[str] = None
    payment_methods: Optional[List[str]] = None
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
    images: Optional[List[str]] = []  # URLs of uploaded images
    video_url: Optional[str] = None   # URL of uploaded video
    approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str
    images: Optional[List[str]] = []
    video_url: Optional[str] = None

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

# ============= GOOGLE OAUTH ROUTES =============

@api_router.post("/auth/google/session")
async def google_auth_session(request: Request, response: Response):
    """Exchange Google OAuth session_id for a session token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    # Fetch user data from Emergent Auth
    try:
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = auth_response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    if not email or not session_token:
        raise HTTPException(status_code=400, detail="Invalid auth data")
    
    # Check if user exists, create if not
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        # Update existing user with Google info
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}}
        )
        user_id = existing_user["id"]
        role = existing_user.get("role", "user")
    else:
        # Create new user
        user_id = str(uuid.uuid4())
        new_user = {
            "id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": "user",
            "verification_status": "unverified",
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
        role = "user"
    
    # Store session in database
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRATION_DAYS)
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=SESSION_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    # Also create a JWT token for compatibility with existing auth system
    jwt_token = create_token(user_id, role)
    
    # Get updated user data
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    
    return {
        "token": jwt_token,
        "session_token": session_token,
        "user": user
    }

@api_router.get("/auth/session/me")
async def get_session_user(request: Request):
    """Get current user from session cookie"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        # Try Authorization header as fallback
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session in database
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiration
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user = await db.users.find_one({"id": session["user_id"]}, {"_id": 0, "password": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user and clear session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Delete session from database
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}

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

@api_router.post("/products/{product_id}/like")
async def like_product(product_id: str, user: User = Depends(get_current_user)):
    """Toggle like on a product"""
    # Check if user already liked this product
    existing_like = await db.product_likes.find_one({
        "user_id": user.id,
        "product_id": product_id
    })
    
    if existing_like:
        # Unlike
        await db.product_likes.delete_one({"_id": existing_like["_id"]})
        await db.products.update_one(
            {"id": product_id},
            {"$inc": {"likes_count": -1}}
        )
        return {"liked": False, "message": "Product unliked"}
    else:
        # Like
        await db.product_likes.insert_one({
            "user_id": user.id,
            "product_id": product_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        await db.products.update_one(
            {"id": product_id},
            {"$inc": {"likes_count": 1}}
        )
        return {"liked": True, "message": "Product liked"}

@api_router.get("/products/{product_id}/liked")
async def check_product_liked(product_id: str, user: User = Depends(get_current_user)):
    """Check if user has liked a product"""
    existing_like = await db.product_likes.find_one({
        "user_id": user.id,
        "product_id": product_id
    })
    return {"liked": existing_like is not None}

@api_router.get("/products/{product_id}/related")
async def get_related_products(product_id: str, limit: int = 4):
    """Get related products based on category"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Find products in the same category, excluding current product
    related = await db.products.find(
        {"category": product["category"], "id": {"$ne": product_id}},
        {"_id": 0}
    ).limit(limit).to_list(limit)
    
    # If not enough, fill with products from other categories
    if len(related) < limit:
        additional = await db.products.find(
            {"id": {"$ne": product_id}, "id": {"$nin": [p["id"] for p in related]}},
            {"_id": 0}
        ).limit(limit - len(related)).to_list(limit - len(related))
        related.extend(additional)
    
    return related

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

@api_router.get("/cart/payment-methods")
async def get_cart_payment_methods(user: User = Depends(get_current_user)):
    """Get available payment methods based on cart items"""
    cart = await db.carts.find_one({"user_id": user.id}, {"_id": 0})
    if not cart or not cart.get("items"):
        return {"payment_methods": PAYMENT_METHODS}  # All methods available for empty cart
    
    # Get all products in cart
    product_ids = [item["product_id"] for item in cart.get("items", [])]
    products = await db.products.find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(100)
    
    # Find common payment methods across all products
    if not products:
        return {"payment_methods": PAYMENT_METHODS}
    
    # Start with all methods and intersect
    available_methods = set(PAYMENT_METHODS)
    for product in products:
        product_methods = product.get("payment_methods")
        if product_methods:
            available_methods = available_methods.intersection(set(product_methods))
    
    # If no common methods found (shouldn't happen), return all
    if not available_methods:
        available_methods = set(PAYMENT_METHODS)
    
    return {"payment_methods": list(available_methods)}

@api_router.get("/payment-methods")
async def get_all_payment_methods():
    """Get all available payment methods"""
    return {
        "payment_methods": [
            {"id": "razorpay", "name": "Card Payment", "description": "Pay via Debit/Credit Cards, NetBanking", "icon": "credit-card"},
            {"id": "upi", "name": "UPI Payment", "description": "GPay, PhonePe, Paytm, BHIM UPI", "icon": "smartphone"},
            {"id": "cod", "name": "Cash on Delivery", "description": "Pay when you receive", "icon": "banknote"},
            {"id": "bank_transfer", "name": "Bank Transfer", "description": "Direct bank transfer (NEFT/RTGS)", "icon": "building"},
            {"id": "emi", "name": "EMI", "description": "Easy monthly installments", "icon": "calendar"},
            {"id": "pay_later", "name": "Pay Later", "description": "Buy now, pay within 30 days", "icon": "clock"},
        ]
    }

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
        
        # Update order status to completed
        await db.orders.update_one(
            {"razorpay_order_id": verification.razorpay_order_id},
            {"$set": {
                "payment_status": "completed",
                "order_status": "completed",
                "razorpay_payment_id": verification.razorpay_payment_id
            }}
        )
        
        # Clear cart
        await db.carts.delete_one({"user_id": user.id})
        
        return {"message": "Payment verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Payment verification failed")

class CODOrderCreate(BaseModel):
    items: List[dict]
    total_amount: float
    delivery_address: dict
    payment_method: str

@api_router.post("/orders/create-cod-order")
async def create_cod_order(order_data: CODOrderCreate, user: User = Depends(get_current_user)):
    """Create order with Cash on Delivery or Bank Transfer"""
    if order_data.payment_method not in ["cod", "bank_transfer", "pay_later"]:
        raise HTTPException(status_code=400, detail="Invalid payment method")
    
    order_id = str(uuid.uuid4())
    
    order = {
        "id": order_id,
        "user_id": user.id,
        "items": order_data.items,
        "total_amount": order_data.total_amount,
        "delivery_address": order_data.delivery_address,
        "payment_method": order_data.payment_method,
        "payment_status": "completed",
        "order_status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order)
    
    # Clear cart
    await db.carts.delete_one({"user_id": user.id})
    
    return {
        "order_id": order_id,
        "message": f"Order placed successfully with {order_data.payment_method.upper()}",
        "payment_method": order_data.payment_method
    }

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

# ============= SALES DASHBOARD ROUTES =============

@api_router.get("/admin/dashboard/stats", dependencies=[Depends(get_admin_user)])
async def get_dashboard_stats():
    """Get comprehensive sales statistics for admin dashboard"""
    
    # Total revenue from completed orders
    orders = await db.orders.find({"payment_status": "paid"}, {"_id": 0}).to_list(1000)
    total_revenue = sum(order.get("total_amount", 0) for order in orders)
    
    # Order counts
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"payment_status": "pending"})
    completed_orders = await db.orders.count_documents({"payment_status": "paid"})
    
    # Product stats
    total_products = await db.products.count_documents({})
    low_stock_products = await db.products.count_documents({
        "specifications.stockQuantity": {"$exists": True, "$lte": 10}
    })
    out_of_stock = await db.products.count_documents({"availability": False})
    
    # User stats
    total_users = await db.users.count_documents({"role": "user"})
    verified_users = await db.users.count_documents({"verification_status": "verified"})
    
    # Bulk enquiries
    total_enquiries = await db.bulk_enquiries.count_documents({})
    pending_enquiries = await db.bulk_enquiries.count_documents({"status": "pending"})
    
    # Monthly revenue (last 6 months)
    monthly_revenue = []
    for i in range(5, -1, -1):
        month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_start = month_start - timedelta(days=i*30)
        month_end = month_start + timedelta(days=30)
        
        month_orders = await db.orders.find({
            "payment_status": "paid",
            "created_at": {
                "$gte": month_start.isoformat(),
                "$lt": month_end.isoformat()
            }
        }, {"_id": 0}).to_list(1000)
        
        revenue = sum(order.get("total_amount", 0) for order in month_orders)
        monthly_revenue.append({
            "month": month_start.strftime("%b %Y"),
            "revenue": revenue,
            "orders": len(month_orders)
        })
    
    # Top selling products
    product_sales = {}
    for order in orders:
        for item in order.get("items", []):
            pid = item.get("product_id")
            if pid:
                if pid not in product_sales:
                    product_sales[pid] = {"quantity": 0, "revenue": 0}
                product_sales[pid]["quantity"] += item.get("quantity", 1)
                product_sales[pid]["revenue"] += item.get("price", 0) * item.get("quantity", 1)
    
    top_products = []
    for pid, stats in sorted(product_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)[:5]:
        product = await db.products.find_one({"id": pid}, {"_id": 0, "name": 1, "category": 1, "price": 1})
        if product:
            top_products.append({
                **product,
                "total_sold": stats["quantity"],
                "total_revenue": stats["revenue"]
            })
    
    # Category-wise sales
    category_sales = {}
    for order in orders:
        for item in order.get("items", []):
            product = await db.products.find_one({"id": item.get("product_id")}, {"_id": 0, "category": 1})
            if product:
                cat = product.get("category", "Other")
                if cat not in category_sales:
                    category_sales[cat] = 0
                category_sales[cat] += item.get("price", 0) * item.get("quantity", 1)
    
    return {
        "revenue": {
            "total": total_revenue,
            "monthly": monthly_revenue
        },
        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "completed": completed_orders
        },
        "products": {
            "total": total_products,
            "low_stock": low_stock_products,
            "out_of_stock": out_of_stock
        },
        "users": {
            "total": total_users,
            "verified": verified_users
        },
        "enquiries": {
            "total": total_enquiries,
            "pending": pending_enquiries
        },
        "top_products": top_products,
        "category_sales": [{"category": k, "revenue": v} for k, v in category_sales.items()]
    }

@api_router.get("/admin/low-stock-alerts", dependencies=[Depends(get_admin_user)])
async def get_low_stock_alerts():
    """Get products with low stock (10 or less)"""
    
    # Products with explicit stock quantity <= 10
    low_stock = await db.products.find({
        "specifications.stockQuantity": {"$exists": True, "$lte": 10}
    }, {"_id": 0}).to_list(100)
    
    # Products marked as unavailable
    out_of_stock = await db.products.find({"availability": False}, {"_id": 0}).to_list(100)
    
    alerts = []
    for product in low_stock:
        stock = product.get("specifications", {}).get("stockQuantity", 0)
        alerts.append({
            "id": product["id"],
            "name": product["name"],
            "category": product["category"],
            "stock": stock,
            "status": "critical" if stock <= 5 else "low",
            "price": product["price"]
        })
    
    for product in out_of_stock:
        if not any(a["id"] == product["id"] for a in alerts):
            alerts.append({
                "id": product["id"],
                "name": product["name"],
                "category": product["category"],
                "stock": 0,
                "status": "out_of_stock",
                "price": product["price"]
            })
    
    # Sort by stock level
    alerts.sort(key=lambda x: x["stock"])
    
    return alerts

@api_router.put("/admin/products/{product_id}/stock", dependencies=[Depends(get_admin_user)])
async def update_product_stock(product_id: str, stock_update: dict):
    """Update product stock quantity"""
    new_stock = stock_update.get("stock_quantity")
    if new_stock is None:
        raise HTTPException(status_code=400, detail="stock_quantity is required")
    
    result = await db.products.update_one(
        {"id": product_id},
        {
            "$set": {
                "specifications.stockQuantity": new_stock,
                "availability": new_stock > 0
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Stock updated", "new_stock": new_stock}

# ============= EMI ROUTES =============

@api_router.get("/emi/calculate")
async def calculate_emi(amount: float, tenure_months: int = 12):
    """Calculate EMI options for a given amount"""
    
    if amount < 50000:
        raise HTTPException(status_code=400, detail="EMI available for purchases above ₹50,000")
    
    # Interest rates for different tenures
    interest_rates = {
        3: 0,      # No cost EMI for 3 months
        6: 12,     # 12% p.a. for 6 months
        9: 13,     # 13% p.a. for 9 months
        12: 14,    # 14% p.a. for 12 months
        18: 15,    # 15% p.a. for 18 months
        24: 16     # 16% p.a. for 24 months
    }
    
    emi_options = []
    for months, rate in interest_rates.items():
        monthly_rate = rate / 12 / 100
        
        if rate == 0:
            # No cost EMI
            emi = amount / months
            total_amount = amount
            interest_amount = 0
        else:
            # Standard EMI calculation: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
            if monthly_rate > 0:
                emi = amount * monthly_rate * pow(1 + monthly_rate, months) / (pow(1 + monthly_rate, months) - 1)
            else:
                emi = amount / months
            total_amount = emi * months
            interest_amount = total_amount - amount
        
        emi_options.append({
            "tenure_months": months,
            "interest_rate": rate,
            "monthly_emi": round(emi, 2),
            "total_amount": round(total_amount, 2),
            "interest_amount": round(interest_amount, 2),
            "is_no_cost": rate == 0
        })
    
    return {
        "principal_amount": amount,
        "emi_options": emi_options
    }

@api_router.get("/products/{product_id}/emi")
async def get_product_emi(product_id: str):
    """Get EMI options for a specific product"""
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    price = product["price"]
    
    if price < 50000:
        return {
            "product": product["name"],
            "price": price,
            "emi_available": False,
            "message": "EMI available for products above ₹50,000"
        }
    
    # Get EMI options
    emi_response = await calculate_emi(price)
    
    return {
        "product": product["name"],
        "price": price,
        "emi_available": True,
        "emi_options": emi_response["emi_options"]
    }

# ============= INVOICE ROUTES =============

@api_router.get("/orders/{order_id}/invoice")
async def generate_invoice(order_id: str, user: User = Depends(get_current_user)):
    """Generate PDF invoice for an order"""
    
    # Get order
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns this order or is admin
    if order["user_id"] != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get user details
    order_user = await db.users.find_one({"id": order["user_id"]}, {"_id": 0, "password": 0})
    
    # Create PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#1e40af'), alignment=TA_CENTER)
    header_style = ParagraphStyle('Header', parent=styles['Normal'], fontSize=12, textColor=colors.HexColor('#374151'))
    
    elements = []
    
    # Company Header
    elements.append(Paragraph("MedEquipMart", title_style))
    elements.append(Paragraph("Your Trusted Medical Equipment Partner", ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=10, textColor=colors.gray, alignment=TA_CENTER)))
    elements.append(Spacer(1, 20))
    
    # Invoice Title
    elements.append(Paragraph(f"<b>TAX INVOICE</b>", ParagraphStyle('InvoiceTitle', parent=styles['Heading2'], fontSize=16, alignment=TA_CENTER)))
    elements.append(Spacer(1, 10))
    
    # Invoice Details
    invoice_date = datetime.now(timezone.utc).strftime("%d-%m-%Y")
    invoice_data = [
        ["Invoice No:", f"INV-{order_id[:8].upper()}", "Invoice Date:", invoice_date],
        ["Order ID:", order_id[:12], "Payment Status:", order.get("payment_status", "Pending").upper()]
    ]
    
    invoice_table = Table(invoice_data, colWidths=[80, 150, 80, 150])
    invoice_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#374151')),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 20))
    
    # Customer Details
    elements.append(Paragraph("<b>Bill To:</b>", header_style))
    customer_name = order_user.get("name", "Customer") if order_user else "Customer"
    customer_email = order_user.get("email", "") if order_user else ""
    customer_phone = order_user.get("phone", "") if order_user else ""
    customer_org = order_user.get("organization_name", "") if order_user else ""
    
    elements.append(Paragraph(f"{customer_name}", styles['Normal']))
    if customer_org:
        elements.append(Paragraph(f"{customer_org}", styles['Normal']))
    elements.append(Paragraph(f"Email: {customer_email}", styles['Normal']))
    if customer_phone:
        elements.append(Paragraph(f"Phone: {customer_phone}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Items Table
    items_data = [["#", "Product", "HSN Code", "Qty", "Unit Price", "GST (18%)", "Amount"]]
    
    subtotal = 0
    total_gst = 0
    
    for idx, item in enumerate(order.get("items", []), 1):
        product = await db.products.find_one({"id": item.get("product_id")}, {"_id": 0})
        product_name = product.get("name", "Product") if product else item.get("name", "Product")
        quantity = item.get("quantity", 1)
        unit_price = item.get("price", 0)
        
        # Calculate GST (18%)
        base_price = unit_price / 1.18  # Price is inclusive of GST
        gst_amount = unit_price - base_price
        line_total = unit_price * quantity
        
        subtotal += base_price * quantity
        total_gst += gst_amount * quantity
        
        items_data.append([
            str(idx),
            product_name[:30] + "..." if len(product_name) > 30 else product_name,
            "9018",  # HSN code for medical equipment
            str(quantity),
            f"₹{base_price:,.2f}",
            f"₹{gst_amount * quantity:,.2f}",
            f"₹{line_total:,.2f}"
        ])
    
    items_table = Table(items_data, colWidths=[25, 150, 50, 35, 70, 70, 70])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 20))
    
    # Totals
    total_amount = order.get("total_amount", subtotal + total_gst)
    
    totals_data = [
        ["", "", "", "", "Subtotal:", f"₹{subtotal:,.2f}"],
        ["", "", "", "", "GST (18%):", f"₹{total_gst:,.2f}"],
        ["", "", "", "", "Total Amount:", f"₹{total_amount:,.2f}"],
    ]
    
    totals_table = Table(totals_data, colWidths=[25, 150, 50, 35, 100, 110])
    totals_table.setStyle(TableStyle([
        ('FONTNAME', (4, 0), (4, -1), 'Helvetica-Bold'),
        ('FONTNAME', (5, -1), (5, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (4, 0), (-1, -1), 'RIGHT'),
        ('LINEABOVE', (4, -1), (-1, -1), 1, colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (4, -1), (-1, -1), colors.HexColor('#1e40af')),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 30))
    
    # GST Details
    elements.append(Paragraph("<b>GST Details:</b>", header_style))
    elements.append(Paragraph("GSTIN: 27AABCM1234A1Z5 (Sample)", styles['Normal']))
    elements.append(Paragraph("Place of Supply: Maharashtra", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Footer
    elements.append(Paragraph("<b>Terms & Conditions:</b>", header_style))
    elements.append(Paragraph("1. Goods once sold will not be taken back.", styles['Normal']))
    elements.append(Paragraph("2. Warranty as per manufacturer's terms.", styles['Normal']))
    elements.append(Paragraph("3. Subject to Mumbai jurisdiction.", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph("Thank you for your business!", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=12, textColor=colors.HexColor('#1e40af'), alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    # Return PDF
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{order_id[:8]}.pdf"}
    )

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