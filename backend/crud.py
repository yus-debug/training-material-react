"""
CRUD operations for inventory items.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException

from models import InventoryItem, CategoryEnum
from schemas import InventoryItemCreate, InventoryItemUpdate


class InventoryCRUD:
    """CRUD operations for inventory items."""
    
    @staticmethod
    def get_item(db: Session, item_id: int) -> Optional[InventoryItem]:
        """Get a single inventory item by ID."""
        return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    
    @staticmethod
    def get_item_by_sku(db: Session, sku: str) -> Optional[InventoryItem]:
        """Get a single inventory item by SKU."""
        return db.query(InventoryItem).filter(InventoryItem.sku == sku.upper()).first()
    
    @staticmethod
    def get_items(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[CategoryEnum] = None
    ) -> tuple[List[InventoryItem], int]:
        """
        Get inventory items with optional filtering and pagination.
        Returns (items, total_count).
        """
        query = db.query(InventoryItem)
        
        # Apply filters
        filters = []
        if search:
            search_filter = or_(
                InventoryItem.name.ilike(f"%{search}%"),
                InventoryItem.sku.ilike(f"%{search}%"),
                InventoryItem.description.ilike(f"%{search}%")
            )
            filters.append(search_filter)
        
        if category:
            filters.append(InventoryItem.category == category)
        
        if filters:
            query = query.filter(and_(*filters))
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination and ordering
        items = query.order_by(InventoryItem.created_at.desc()).offset(skip).limit(limit).all()
        
        return items, total
    
    @staticmethod
    def create_item(db: Session, item: InventoryItemCreate) -> InventoryItem:
        """Create a new inventory item."""
        # Check if SKU already exists
        existing_item = InventoryCRUD.get_item_by_sku(db, item.sku)
        if existing_item:
            raise HTTPException(
                status_code=400,
                detail=f"Item with SKU '{item.sku}' already exists"
            )
        
        db_item = InventoryItem(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def update_item(
        db: Session,
        item_id: int,
        item_update: InventoryItemUpdate
    ) -> Optional[InventoryItem]:
        """Update an existing inventory item."""
        db_item = InventoryCRUD.get_item(db, item_id)
        if not db_item:
            return None
        
        # Check if SKU conflicts with another item
        if item_update.sku and item_update.sku != db_item.sku:
            existing_item = InventoryCRUD.get_item_by_sku(db, item_update.sku)
            if existing_item and existing_item.id != item_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Item with SKU '{item_update.sku}' already exists"
                )
        
        # Update only provided fields
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def delete_item(db: Session, item_id: int) -> bool:
        """Delete an inventory item."""
        db_item = InventoryCRUD.get_item(db, item_id)
        if not db_item:
            return False
        
        db.delete(db_item)
        db.commit()
        return True
    
    @staticmethod
    def get_categories(db: Session) -> List[str]:
        """Get all unique categories."""
        return [category.value for category in CategoryEnum]
    
    @staticmethod
    def get_low_stock_items(db: Session, threshold: int = 10) -> List[InventoryItem]:
        """Get items with low stock."""
        return db.query(InventoryItem).filter(InventoryItem.quantity <= threshold).all()


# Create a singleton instance
inventory_crud = InventoryCRUD()
