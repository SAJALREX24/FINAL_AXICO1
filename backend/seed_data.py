"""
Seed data script for Alaxico Medical Equipment E-Commerce Platform
This script populates the database with Alaxico's real product catalog
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import bcrypt
import os

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "medequip_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Alaxico Real Products
ALAXICO_PRODUCTS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Alaxico Compressor Nebulizer for Kids and Adults",
        "description": "Breathe Easy, Live Fully with the Alaxico Compressor Nebulizer - your trusted companion for fast and efficient respiratory therapy. This compact, lightweight nebulizer delivers effective treatment for cough, cold, high fever, asthma, and COPD - anytime, anywhere. Designed for both kids and adults, it features low noise operation (less than 55dB), one-button ease of use, and comes with masks for the whole family. The advanced 4μm particle size ensures deep lung penetration for maximum relief, while the 0.2 ml/min nebulization rate provides quick and efficient treatment sessions.",
        "category": "Respiratory Care",
        "price": 1499,
        "original_price": 2499,
        "image": "https://customer-assets.emergentagent.com/job_init-point/artifacts/zs61d4n7_M1.jpeg",
        "images": [
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/5c06fm9w_M2.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/9z30f70g_M3.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/ak1oqyib_M4.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/1ndqt31f_M5.jpeg"
        ],
        "key_features": [
            "Low Noise Operation (< 55dB)",
            "Portable & Compact Design",
            "One Button Easy to Use",
            "For Kids and Adults",
            "4μm Optimal Particle Size",
            "0.2 ml/min Nebulization Rate",
            "Includes Adult & Child Masks",
            "3 Year Warranty"
        ],
        "feature_highlights": [
            {"icon": "volume", "title": "Low Noise", "description": "Ultra-quiet operation for comfortable treatment sessions"},
            {"icon": "zap", "title": "Fast Relief", "description": "Effective treatment for cough, cold, asthma & COPD"},
            {"icon": "timer", "title": "Quick Treatment", "description": "0.2 ml/min nebulization rate for efficient therapy"},
            {"icon": "shield", "title": "3 Year Warranty", "description": "2 Year Replacement + 1 Year Free Repairing"}
        ],
        "warranty_info": "3 Year Warranty - Includes 2 Year Replacement and 1 Year Free Repairing. Register your warranty at alaxico.com",
        "shipping_info": "Free delivery across India. Same day dispatch for orders before 2 PM.",
        "payment_methods": ["razorpay", "upi", "cod", "bank_transfer", "pay_later"],
        "availability": True,
        "specifications": {
            "Brand": "Alaxico",
            "Model": "Piston Compressor Nebulizer",
            "Type": "Compressor Nebulizer",
            "Particle Size": "4μm (MMAD)",
            "Nebulization Rate": "0.2 ml/min",
            "Noise Level": "< 55dB",
            "Power": "AC 230V, 50Hz",
            "Suitable For": "Kids and Adults",
            "Includes": "Main Unit, Adult Mask, Child Mask, Air Filter, Medicine Chamber, Air Tube, Mouthpiece",
            "Warranty": "3 Years",
            "stockQuantity": 100,
            "featured": True
        },
        "rating": 4.8,
        "reviews_count": 156,
        "likes_count": 89,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Alaxico 3-in-1 Steamer cum Vaporizer",
        "description": "Experience the power of steam therapy with the Alaxico 3-in-1 Steamer cum Vaporizer - your complete solution for respiratory wellness and facial care. This versatile device comes with 3 interchangeable attachments: Facial Unit for skin care and relaxation, Nasal Unit A for targeted nasal steam therapy, and Nasal Unit B for gentle inhalation. Perfect for relieving allergies, cold symptoms, nasal congestion, sore throat, and coughing. The premium quality plastic body ensures safety with shock-proof design, while the 350ml capacity provides long steam sessions. Simply fill with tap water, plug in, and enjoy therapeutic steam within a minute!",
        "category": "Respiratory Care",
        "price": 449,
        "original_price": 799,
        "image": "https://customer-assets.emergentagent.com/job_init-point/artifacts/hrsaqcp6_N3.jpeg",
        "images": [
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/viy436f8_N1.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/oiu22l9k_N2.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/k515pajk_N4.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/72ebhwih_N5.jpeg"
        ],
        "key_features": [
            "3-in-1 Design (Facial + 2 Nasal Units)",
            "Relieves Allergies & Cold Symptoms",
            "Removes Mucus from Nasal Passage",
            "Reduces Throat Soreness & Inflammation",
            "Steam Vapour Within a Minute",
            "350ml Large Capacity",
            "Shock-Proof Plastic Body",
            "1 Year Replacement Warranty"
        ],
        "feature_highlights": [
            {"icon": "zap", "title": "3-in-1 Design", "description": "Facial Unit + Nasal Unit A + Nasal Unit B included"},
            {"icon": "thermometer", "title": "Quick Steam", "description": "Produces therapeutic steam vapour within a minute"},
            {"icon": "shield", "title": "Safe Design", "description": "Shock-proof plastic body for complete safety"},
            {"icon": "award", "title": "1 Year Warranty", "description": "Full replacement warranty - register at alaxico.com"}
        ],
        "warranty_info": "1 Year Replacement Warranty - Register your warranty at alaxico.com for hassle-free experience",
        "shipping_info": "Free delivery across India. Same day dispatch for orders before 2 PM.",
        "payment_methods": ["razorpay", "upi", "cod", "bank_transfer", "pay_later"],
        "availability": True,
        "specifications": {
            "Brand": "Alaxico",
            "Model": "3-in-1 Steamer Vaporizer",
            "Type": "Steam Vaporizer",
            "Capacity": "350ml",
            "Steam Time": "Within 1 minute",
            "Material": "Premium Shock-Proof Plastic",
            "Power": "AC 230V, 50Hz",
            "Attachments": "Facial Unit, Nasal Unit A, Nasal Unit B",
            "Suitable For": "All Ages",
            "Uses": "Cold, Cough, Allergies, Nasal Congestion, Facial Steam, Throat Relief",
            "Warranty": "1 Year Replacement",
            "stockQuantity": 150,
            "featured": True
        },
        "rating": 4.6,
        "reviews_count": 234,
        "likes_count": 127,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Alaxico Premium Non Woven Surgeon Cap (Pack of 100)",
        "description": "Protecting Healthcare Professionals, Ensuring Safety! The Alaxico Premium Non Woven Surgeon Cap delivers reliable protection with ultimate comfort. Made from high-quality non-woven fabric, these disposable caps are designed specifically for healthcare professionals including surgeons, doctors, nurses, and medical staff. The lightweight and breathable material ensures all-day comfort during long procedures, while the elastic band provides a secure, universal fit for all head sizes. Safe, hygienic, and easy to wear - trust Alaxico for quality medical supplies you can rely on.",
        "category": "Surgical Supplies",
        "price": 299,
        "original_price": 499,
        "image": "https://customer-assets.emergentagent.com/job_init-point/artifacts/dd2kq9ca_P1.jpeg",
        "images": [
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/98ycmb6i_P2.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/o8t53q0v_P3.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/g41g5sqr_P4.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/9jn44ej2_P5.jpeg"
        ],
        "key_features": [
            "Premium Non Woven Fabric",
            "Lightweight & Breathable",
            "Safe & Hygienic",
            "Soft Fit & Easy Wear",
            "Universal Size - Fits All",
            "Elastic Band for Secure Fit",
            "Disposable - Single Use",
            "Pack of 100 Pieces"
        ],
        "feature_highlights": [
            {"icon": "zap", "title": "Lightweight", "description": "Ultra-light non woven fabric for all-day comfort"},
            {"icon": "shield", "title": "Safe & Hygienic", "description": "Protects against contamination in medical settings"},
            {"icon": "check", "title": "Universal Fit", "description": "Elastic band fits all head sizes comfortably"},
            {"icon": "award", "title": "Premium Quality", "description": "Trusted by healthcare professionals across India"}
        ],
        "warranty_info": "Quality assured - Contact us for any manufacturing defects",
        "shipping_info": "Free delivery across India on orders above ₹500. Same day dispatch for orders before 2 PM.",
        "payment_methods": ["razorpay", "upi", "cod", "bank_transfer", "pay_later"],
        "availability": True,
        "specifications": {
            "Brand": "Alaxico",
            "Product Type": "Surgeon Cap / Bouffant Cap",
            "Material": "Premium Non Woven Fabric",
            "Color": "Blue",
            "Size": "Universal / Free Size",
            "Closure": "Elastic Band",
            "Usage": "Disposable - Single Use",
            "Pack Size": "100 Pieces",
            "Ideal For": "Surgeons, Doctors, Nurses, Medical Staff, Labs, Clinics",
            "Applications": "Surgery, OT, Medical Procedures, Food Processing, Clean Rooms",
            "stockQuantity": 500,
            "featured": True
        },
        "rating": 4.7,
        "reviews_count": 89,
        "likes_count": 45,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Alaxico Rechargeable Blood Pressure Monitor",
        "description": "Monitor your health with the Alaxico Rechargeable Blood Pressure Monitor - featuring a built-in lithium battery with Type-C charging for hassle-free, eco-friendly operation. No more hunting for batteries! The large LCD screen with backlight display shows SYS, DIA, and Pulse readings in large fonts - perfect for elders and those with poor eyesight. With portable design, automatic shutdown, and USB power supply options, this BP monitor is ideal for home and travel use. Measures Systolic pressure, Diastolic pressure, and Pulse rate accurately. Backed by our 3-year warranty with 2-year replacement and 1-year free repairing.",
        "category": "Diagnostic",
        "price": 1299,
        "original_price": 2199,
        "image": "https://customer-assets.emergentagent.com/job_init-point/artifacts/ef9olwgp_S1.jpeg",
        "images": [
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/vwa15qwx_S2.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/x0hom2z4_S3.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/o6ltvc6a_S4.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/k3jxdj9k_S5.jpeg"
        ],
        "key_features": [
            "Built-in Rechargeable Lithium Battery",
            "Type-C Charging Port - No Batteries Needed",
            "Large LCD Backlight Display",
            "Elder-Friendly Large Font Design",
            "Portable & Compact Design",
            "Automatic Shutdown Feature",
            "USB Power Supply Option",
            "3 Year Warranty"
        ],
        "feature_highlights": [
            {"icon": "zap", "title": "Rechargeable Battery", "description": "Built-in lithium battery with Type-C charging - environment friendly"},
            {"icon": "timer", "title": "Large LCD Display", "description": "Big screen with large fonts - easy for elders to read"},
            {"icon": "check", "title": "Accurate Readings", "description": "Measures SYS, DIA and Pulse with high precision"},
            {"icon": "shield", "title": "3 Year Warranty", "description": "2 Year Replacement + 1 Year Free Repairing"}
        ],
        "warranty_info": "3 Year Warranty - Includes 2 Year Replacement and 1 Year Free Repairing. No extra cost on repairing. Register your warranty at alaxico.com",
        "shipping_info": "Free delivery across India. Same day dispatch for orders before 2 PM.",
        "payment_methods": ["razorpay", "upi", "cod", "bank_transfer", "pay_later"],
        "availability": True,
        "specifications": {
            "Brand": "Alaxico",
            "Model": "ACMP Rechargeable BP Monitor",
            "Type": "Digital Arm Blood Pressure Monitor",
            "Display": "Large LCD with LED Backlight",
            "Measurements": "Systolic (SYS), Diastolic (DIA), Pulse Rate (PUL)",
            "Units": "mmHg / kPa",
            "Power": "Built-in Lithium Battery (Rechargeable)",
            "Charging": "Type-C USB Port",
            "Memory": "Multiple user memory storage",
            "Cuff Size": "22-36 cm (fits most adults)",
            "Auto Shutdown": "Yes",
            "Includes": "Main Unit, Arm Cuff, USB-C Charging Cable, User Manual",
            "Warranty": "3 Years",
            "stockQuantity": 80,
            "featured": True
        },
        "rating": 4.9,
        "reviews_count": 312,
        "likes_count": 198,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Alaxico Hot Electric Gel Bag",
        "description": "Say goodbye to traditional hot water bags! The Alaxico Hot Electric Gel Bag provides instant pain relief with just 5-10 minutes of charging that lasts up to 120 minutes. Filled with special heat-retaining gel, this rechargeable heating pad is safe, secure, and hassle-free - no need to boil water or worry about scalding. Perfect for relieving joint pain, back pain, neck pain, menstrual cramps, muscular cramps, sports injuries, arthritis, headaches, and even works as a cozy bed warmer in winters. The attractive star design in vibrant purple makes it stylish yet functional. Ideal for both men and women - your trusted companion for pain relief anytime, anywhere!",
        "category": "Pain Relief",
        "price": 349,
        "original_price": 599,
        "image": "https://customer-assets.emergentagent.com/job_init-point/artifacts/iz0cj531_X2.jpeg",
        "images": [
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/blmz9pzk_X1.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/afunh4tt_X3.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/3omx9xoj_X4.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/ybjfvrnf_X5.jpeg"
        ],
        "key_features": [
            "5-10 Min Charge = 120 Min Heat",
            "Special Gel-Filled - No Water Needed",
            "Safe & Secure - No Scalding Risk",
            "Superfast Heating Technology",
            "Instant Pain Relief",
            "Unisex - For Men & Women",
            "Attractive Star Design",
            "Portable & Rechargeable"
        ],
        "feature_highlights": [
            {"icon": "zap", "title": "Quick Charge", "description": "Just 5-10 minutes charging provides up to 120 minutes of soothing warmth"},
            {"icon": "shield", "title": "Safe & Secure", "description": "No water filling, no boiling, no risk of scalding - completely safe"},
            {"icon": "thermometer", "title": "Instant Relief", "description": "Relieves joint pain, back pain, cramps, arthritis & muscle soreness"},
            {"icon": "award", "title": "Premium Quality", "description": "Durable gel pouch with attractive design - built to last"}
        ],
        "warranty_info": "Quality assured product. Contact us for any manufacturing defects.",
        "shipping_info": "Free delivery across India. Same day dispatch for orders before 2 PM.",
        "payment_methods": ["razorpay", "upi", "cod", "bank_transfer", "pay_later"],
        "availability": True,
        "specifications": {
            "Brand": "Alaxico",
            "Product Type": "Electric Hot Water Bag / Heating Pad",
            "Dimensions": "10 inch x 7.5 inch",
            "Material": "PVC with special heat-retaining gel",
            "Heating Time": "5-10 minutes",
            "Heat Duration": "Up to 120 minutes",
            "Power": "AC 230V, 50Hz",
            "Design": "Star Pattern - Purple/Pink",
            "Gender": "Unisex",
            "Uses": "Joint Pain, Back Pain, Menstrual Cramps, Neck Pain, Muscular Cramps, Arthritis, Headaches, Bed Warmer",
            "Safety": "Auto cut-off, No water filling required",
            "stockQuantity": 200,
            "featured": True
        },
        "rating": 4.5,
        "reviews_count": 178,
        "likes_count": 95,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Alaxico Premium Hot Water Bottle",
        "description": "Experience versatile and comfortable warmth with the Alaxico Premium Hot Water Bottle - your trusted companion for pain relief and cozy comfort. Featuring a large mouth design for easy and safe water filling, this classic rubber hot water bottle is perfect for relieving lower back pain, upper back pain, knee pain, elbow pain, neck pain, and abdominal discomfort. The easy open/close mechanism makes water injection safer and mess-free. Reusable and durable, this hot water bottle provides home comfort heating and warm relief anytime you need it. Great for cold winter nights, menstrual cramps, muscle aches, or simply staying cozy!",
        "category": "Pain Relief",
        "price": 249,
        "original_price": 449,
        "image": "https://customer-assets.emergentagent.com/job_init-point/artifacts/369nig01_V1.jpeg",
        "images": [
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/ucwdjm1t_V2.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/cs1d8f3p_V3.jpeg",
            "https://customer-assets.emergentagent.com/job_init-point/artifacts/4zyrhs0y_V4.jpeg"
        ],
        "key_features": [
            "Large Mouth Design - Easy Filling",
            "Easy to Open & Close",
            "Safe Water Injection",
            "Reusable & Durable",
            "Versatile Pain Relief",
            "Home Comfort Heating",
            "Premium Rubber Material",
            "Classic Ribbed Design"
        ],
        "feature_highlights": [
            {"icon": "zap", "title": "Easy Filling", "description": "Large mouth design makes water injection quick, easy and safe"},
            {"icon": "thermometer", "title": "Warm Relief", "description": "Perfect for back pain, neck pain, knee pain, cramps & more"},
            {"icon": "shield", "title": "Reusable & Durable", "description": "High-quality rubber construction for long-lasting use"},
            {"icon": "check", "title": "Versatile Use", "description": "Use on lower back, upper back, abdomen, arms, neck and more"}
        ],
        "warranty_info": "Quality assured product. Contact us for any manufacturing defects.",
        "shipping_info": "Free delivery across India. Same day dispatch for orders before 2 PM.",
        "payment_methods": ["razorpay", "upi", "cod", "bank_transfer", "pay_later"],
        "availability": True,
        "specifications": {
            "Brand": "Alaxico",
            "Product Type": "Hot Water Bottle / Bag",
            "Material": "Premium Quality Rubber",
            "Color": "Red",
            "Design": "Classic Ribbed Surface",
            "Opening": "Large Mouth with Secure Stopper",
            "Capacity": "2 Liters (Approx)",
            "Usage": "Lower Back Pain, Upper Back Pain, Knee Pain, Elbow Pain, Neck Pain, Abdominal Pain, Menstrual Cramps",
            "Feature": "Reusable, Durable, Safe Water Injection",
            "stockQuantity": 150,
            "featured": True
        },
        "rating": 4.4,
        "reviews_count": 145,
        "likes_count": 78,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

# Categories
CATEGORIES = [
    "Respiratory Care",
    "Diagnostic",
    "Surgical Supplies",
    "Pain Relief",
    "Patient Care",
    "First Aid"
]

# Default Users
DEFAULT_USERS = [
    {
        "id": str(uuid.uuid4()),
        "email": "admin@medequipmart.com",
        "password": bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode(),
        "name": "Admin User",
        "role": "admin",
        "is_verified": True,
        "verification_status": "verified",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "email": "hospital@example.com",
        "password": bcrypt.hashpw("demo123".encode(), bcrypt.gensalt()).decode(),
        "name": "City Hospital",
        "role": "user",
        "buyer_type": "hospital",
        "organization": "City General Hospital",
        "is_verified": True,
        "verification_status": "verified",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "email": "doctor@example.com",
        "password": bcrypt.hashpw("demo123".encode(), bcrypt.gensalt()).decode(),
        "name": "Dr. Sharma",
        "role": "user",
        "buyer_type": "doctor",
        "is_verified": True,
        "verification_status": "verified",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]


async def seed_database():
    """Main seeding function"""
    print("🚀 Starting Alaxico database seeding...")
    
    # Clear existing data
    await db.products.delete_many({})
    await db.categories.delete_many({})
    await db.users.delete_many({})
    await db.reviews.delete_many({})
    print("✅ Cleared existing data...")
    
    # Insert products
    await db.products.insert_many(ALAXICO_PRODUCTS)
    print(f"✅ Inserted {len(ALAXICO_PRODUCTS)} Alaxico products")
    
    # Insert categories
    category_docs = [{"id": str(uuid.uuid4()), "name": cat, "product_count": 0} for cat in CATEGORIES]
    await db.categories.insert_many(category_docs)
    print(f"✅ Inserted {len(CATEGORIES)} categories")
    
    # Insert users
    await db.users.insert_many(DEFAULT_USERS)
    print(f"✅ Inserted {len(DEFAULT_USERS)} users")
    
    print("\n" + "="*50)
    print("🎉 Alaxico Database Seeding Complete!")
    print("="*50)
    print("\n📦 Products Added:")
    for p in ALAXICO_PRODUCTS:
        print(f"   • {p['name'][:50]} - ₹{p['price']}")
    print("\n👤 Login Credentials:")
    print("   Admin: admin@medequipmart.com / admin123")
    print("   Hospital: hospital@example.com / demo123")
    print("   Doctor: doctor@example.com / demo123")
    print("="*50)


if __name__ == "__main__":
    asyncio.run(seed_database())
