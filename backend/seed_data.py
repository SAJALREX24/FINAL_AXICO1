import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Starting database seeding...")
    
    # Clear existing data
    await db.products.delete_many({})
    await db.users.delete_many({})
    await db.reviews.delete_many({})
    
    print("Cleared existing data...")
    
    # Sample medical products
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Digital Blood Pressure Monitor",
            "description": "Automatic upper arm blood pressure monitor with large LCD display. Clinically validated for accuracy with irregular heartbeat detection.",
            "category": "Diagnostic Equipment",
            "price": 2499,
            "image": "https://images.unsplash.com/photo-1615485736576-6a6a5c3a0b8f?w=500&q=80",
            "specifications": {
                "Type": "Digital Automatic",
                "Cuff Size": "22-42 cm",
                "Memory": "90 readings",
                "Accuracy": "±3 mmHg"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pulse Oximeter",
            "description": "Fingertip pulse oximeter with SpO2 and pulse rate monitoring. LED display with 6 display modes. Battery operated with auto power-off.",
            "category": "Patient Monitoring",
            "price": 1299,
            "image": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&q=80",
            "specifications": {
                "Display": "LED",
                "SpO2 Range": "70-100%",
                "Pulse Rate": "30-250 bpm",
                "Battery": "2x AAA"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Digital Thermometer",
            "description": "Fast and accurate digital thermometer with flexible tip. Oral, rectal, and underarm measurement. Fever alarm and memory recall.",
            "category": "Diagnostic Equipment",
            "price": 299,
            "image": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&q=80",
            "specifications": {
                "Measurement Time": "8-10 seconds",
                "Accuracy": "±0.1°C",
                "Memory": "Last reading",
                "Waterproof": "Yes"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hospital Bed - Manual 3 Crank",
            "description": "Heavy-duty manual hospital bed with 3-crank adjustment. Adjustable height, backrest, and leg rest. Includes side rails and IV pole attachment.",
            "category": "Hospital Furniture",
            "price": 25000,
            "image": "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500&q=80",
            "specifications": {
                "Material": "Steel Frame",
                "Weight Capacity": "200 kg",
                "Size": "2100x900x500 mm",
                "Adjustments": "3 Functions"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Stethoscope - Cardiology",
            "description": "Professional cardiology stethoscope with superior acoustic performance. Dual-sided chestpiece for adult and pediatric use.",
            "category": "Diagnostic Equipment",
            "price": 4999,
            "image": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&q=80",
            "specifications": {
                "Type": "Dual Head",
                "Tube Length": "69 cm",
                "Diaphragm": "Tunable",
                "Warranty": "2 Years"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Wheelchair - Folding",
            "description": "Lightweight folding wheelchair with comfortable padded seat and armrests. Easy to transport and store. Puncture-proof tires.",
            "category": "Hospital Furniture",
            "price": 8500,
            "image": "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=500&q=80",
            "specifications": {
                "Weight Capacity": "120 kg",
                "Seat Width": "45 cm",
                "Material": "Aluminum Frame",
                "Wheel Size": "24 inch rear"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Surgical Scissors Set",
            "description": "Premium quality stainless steel surgical scissors set. Includes straight and curved scissors. Autoclavable and corrosion resistant.",
            "category": "Surgical Instruments",
            "price": 1899,
            "image": "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=500&q=80",
            "specifications": {
                "Material": "Stainless Steel",
                "Pieces": "5 pieces",
                "Sterilizable": "Yes",
                "Grade": "Medical Grade"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "ECG Machine - 12 Lead",
            "description": "Digital 12-lead ECG machine with high-resolution display. Automatic interpretation and analysis. Thermal printer included.",
            "category": "Diagnostic Equipment",
            "price": 65000,
            "image": "https://images.unsplash.com/photo-1631815588091-d62d5a25cdca?w=500&q=80",
            "specifications": {
                "Leads": "12 Lead",
                "Display": "10 inch color",
                "Storage": "10000 records",
                "Printer": "Thermal"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Nebulizer Machine",
            "description": "Compact nebulizer for respiratory therapy. Quiet operation with adjustable flow rate. Comes with mask and mouthpiece.",
            "category": "Patient Monitoring",
            "price": 2199,
            "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
            "specifications": {
                "Type": "Compressor",
                "Particle Size": "0.5-10 μm",
                "Flow Rate": "6-8 L/min",
                "Noise Level": "<60 dB"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Glucometer with 50 Test Strips",
            "description": "Blood glucose monitoring system with fast results. No coding required. Includes lancets and carrying case.",
            "category": "Diagnostic Equipment",
            "price": 899,
            "image": "https://images.unsplash.com/photo-1615485736576-6a6a5c3a0b8f?w=500&q=80",
            "specifications": {
                "Test Time": "5 seconds",
                "Sample Size": "0.5 μL",
                "Memory": "450 readings",
                "Strips Included": "50"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Examination Table",
            "description": "Adjustable examination table with padded surface. Height adjustable with paper roll holder. Easy-to-clean vinyl covering.",
            "category": "Hospital Furniture",
            "price": 15000,
            "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&q=80",
            "specifications": {
                "Length": "180 cm",
                "Width": "60 cm",
                "Height Range": "60-90 cm",
                "Weight Capacity": "180 kg"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Surgical Forceps Set",
            "description": "Professional surgical forceps set with various types. Made from high-grade stainless steel. Autoclavable.",
            "category": "Surgical Instruments",
            "price": 3499,
            "image": "https://images.unsplash.com/photo-1615485737220-d9ba2c2c6d0e?w=500&q=80",
            "specifications": {
                "Material": "Surgical Steel",
                "Pieces": "8 pieces",
                "Types": "Tissue, Artery, Hemostatic",
                "Length": "12-20 cm"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Centrifuge Machine",
            "description": "Laboratory centrifuge with digital display. Variable speed control and timer. Safety lid lock mechanism.",
            "category": "Lab Equipment",
            "price": 35000,
            "image": "https://images.unsplash.com/photo-1582560419145-85f70b2f2c37?w=500&q=80",
            "specifications": {
                "Max Speed": "4000 RPM",
                "Capacity": "12 tubes x 15ml",
                "Timer": "0-99 minutes",
                "Display": "Digital LED"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Autoclave Sterilizer",
            "description": "High-pressure steam sterilizer for medical instruments. Digital control panel with multiple cycle options.",
            "category": "Lab Equipment",
            "price": 45000,
            "image": "https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=500&q=80",
            "specifications": {
                "Capacity": "18 Liters",
                "Temperature": "121-134°C",
                "Pressure": "0.22 MPa",
                "Cycles": "3 preset"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Patient Monitor - Multi-Parameter",
            "description": "Advanced patient monitor tracking ECG, SpO2, NIBP, temperature, and respiration. Large color display with alarm system.",
            "category": "Patient Monitoring",
            "price": 125000,
            "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80",
            "specifications": {
                "Parameters": "5 Parameters",
                "Display": "12.1 inch TFT",
                "Battery": "Built-in rechargeable",
                "Storage": "720 hours trend"
            },
            "availability": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert products
    await db.products.insert_many(products)
    print(f"Inserted {len(products)} products...")
    
    # Create admin user
    admin_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@medequipmart.com",
        "name": "Admin User",
        "phone": "+919876543210",
        "password": admin_password,
        "role": "admin",
        "verification_status": "verified",
        "buyer_type": "Hospital",
        "organization_name": "MedEquipMart Admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    print("Created admin user (admin@medequipmart.com / admin123)...")
    
    # Create sample verified users
    demo_password = bcrypt.hashpw("demo123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    demo_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "hospital@example.com",
            "name": "Dr. Rajesh Kumar",
            "phone": "+919876543211",
            "password": demo_password,
            "role": "user",
            "verification_status": "verified",
            "buyer_type": "Hospital",
            "organization_name": "City General Hospital",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "clinic@example.com",
            "name": "Dr. Priya Sharma",
            "phone": "+919876543212",
            "password": demo_password,
            "role": "user",
            "verification_status": "verified",
            "buyer_type": "Clinic",
            "organization_name": "HealthCare Clinic",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor@example.com",
            "name": "Dr. Amit Patel",
            "phone": "+919876543213",
            "password": demo_password,
            "role": "user",
            "verification_status": "verified",
            "buyer_type": "Doctor",
            "organization_name": "Private Practice",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.users.insert_many(demo_users)
    print(f"Created {len(demo_users)} demo users (password: demo123)...")
    
    # Create sample reviews
    sample_reviews = [
        {
            "id": str(uuid.uuid4()),
            "user_id": demo_users[0]["id"],
            "product_id": products[0]["id"],
            "rating": 5,
            "comment": "Excellent blood pressure monitor. Very accurate and easy to use. Highly recommend for hospital use.",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": demo_users[1]["id"],
            "product_id": products[1]["id"],
            "rating": 5,
            "comment": "Great pulse oximeter! Fast readings and very reliable. Perfect for our clinic.",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": demo_users[2]["id"],
            "product_id": products[4]["id"],
            "rating": 5,
            "comment": "Professional quality stethoscope with excellent acoustic clarity. Worth the investment.",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": demo_users[0]["id"],
            "product_id": products[7]["id"],
            "rating": 5,
            "comment": "The 12-lead ECG machine is fantastic. Clear readings and easy to operate. Great for our cardiology department.",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": demo_users[1]["id"],
            "product_id": products[3]["id"],
            "rating": 4,
            "comment": "Good quality hospital bed. Sturdy and functional. Manual cranks work smoothly.",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": demo_users[2]["id"],
            "product_id": products[2]["id"],
            "rating": 5,
            "comment": "Fast and accurate thermometer. Battery life is good. Essential for every medical practice.",
            "approved": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.reviews.insert_many(sample_reviews)
    print(f"Created {len(sample_reviews)} sample reviews...")
    
    print("\n✅ Database seeding completed successfully!")
    print("\nLogin Credentials:")
    print("==================")
    print("Admin: admin@medequipmart.com / admin123")
    print("Hospital User: hospital@example.com / demo123")
    print("Clinic User: clinic@example.com / demo123")
    print("Doctor User: doctor@example.com / demo123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
