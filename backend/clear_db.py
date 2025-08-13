"""
Clear all items from the inventory database.
"""
from sqlalchemy.orm import Session
from database import SessionLocal
from models import InventoryItem


def clear_all_items():
    """Clear all inventory items from the database."""
    db = SessionLocal()
    
    try:
        # Get count before deletion
        count_before = db.query(InventoryItem).count()
        print(f"📊 Current items in database: {count_before}")
        
        if count_before == 0:
            print("✅ Database is already empty!")
            return
        
        # Confirm deletion
        print(f"🗑️  About to delete {count_before} items from the database...")
        
        # Delete all items
        deleted_count = db.query(InventoryItem).delete()
        db.commit()
        
        # Verify deletion
        count_after = db.query(InventoryItem).count()
        
        print(f"✅ Successfully deleted {deleted_count} items")
        print(f"📊 Items remaining: {count_after}")
        
        if count_after == 0:
            print("🎉 Database is now empty!")
        
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    print("🔧 Clearing all items from inventory database...")
    clear_all_items()
    print("✨ Operation completed!")
