"""
Database initialization script with sample data.
"""
from datetime import datetime
from sqlalchemy.orm import Session

from database import SessionLocal, create_tables
from models import InventoryItem, CategoryEnum


def create_sample_data():
    """Create sample inventory data."""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_count = db.query(InventoryItem).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} items. Skipping sample data creation.")
            return
        
        # Sample inventory items
        sample_items = [
            InventoryItem(
                name="Wireless Headphones",
                description="High-quality bluetooth headphones with noise cancellation",
                category=CategoryEnum.ELECTRONICS,
                quantity=25,
                price=99.99,
                sku="WH-001"
            ),
            InventoryItem(
                name="Cotton T-Shirt",
                description="Comfortable 100% cotton t-shirt in various colors",
                category=CategoryEnum.CLOTHING,
                quantity=50,
                price=19.99,
                sku="TS-002"
            ),
            InventoryItem(
                name="Python Programming Book",
                description="Comprehensive guide to Python programming for beginners",
                category=CategoryEnum.BOOKS,
                quantity=15,
                price=29.99,
                sku="PB-003"
            ),
            InventoryItem(
                name="Coffee Mug",
                description="Ceramic coffee mug with inspirational quotes",
                category=CategoryEnum.HOME,
                quantity=30,
                price=12.99,
                sku="CM-004"
            ),
            InventoryItem(
                name="Smartphone Case",
                description="Protective case for latest smartphone models",
                category=CategoryEnum.ELECTRONICS,
                quantity=75,
                price=24.99,
                sku="SC-005"
            ),
            InventoryItem(
                name="Desk Lamp",
                description="LED desk lamp with adjustable brightness",
                category=CategoryEnum.HOME,
                quantity=20,
                price=39.99,
                sku="DL-006"
            ),
            InventoryItem(
                name="Running Shoes",
                description="Lightweight running shoes for athletes",
                category=CategoryEnum.CLOTHING,
                quantity=35,
                price=79.99,
                sku="RS-007"
            ),
            InventoryItem(
                name="Notebook",
                description="High-quality notebook for writing and sketching",
                category=CategoryEnum.OTHER,
                quantity=100,
                price=8.99,
                sku="NB-008"
            )
        ]
        
        # Add items to database
        for item in sample_items:
            db.add(item)
        
        db.commit()
        print(f"✅ Created {len(sample_items)} sample inventory items")
        
        # Display created items
        print("\n📦 Sample inventory items:")
        for item in sample_items:
            print(f"  - {item.name} ({item.sku}): {item.quantity} units @ ${item.price}")
    
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    
    finally:
        db.close()


def init_database():
    """Initialize the database with tables and sample data."""
    print("🔧 Initializing database...")
    
    # Create tables
    create_tables()
    print("✅ Database tables created")
    
    # Create sample data
    create_sample_data()
    
    print("🎉 Database initialization completed!")


if __name__ == "__main__":
    init_database()
