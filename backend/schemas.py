"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, validator
from models import CategoryEnum


class InventoryItemBase(BaseModel):
    """Base schema for inventory items."""
    name: str = Field(..., min_length=1, max_length=200, description="Item name")
    description: Optional[str] = Field(None, max_length=1000, description="Item description")
    category: CategoryEnum = Field(..., description="Item category")
    quantity: int = Field(..., ge=0, description="Item quantity")
    price: float = Field(..., gt=0, description="Item price")
    sku: str = Field(..., min_length=1, max_length=100, description="Stock keeping unit")
    
    @validator('price')
    def validate_price(cls, v):
        """Validate price to have at most 2 decimal places."""
        if round(v, 2) != v:
            raise ValueError('Price must have at most 2 decimal places')
        return v
    
    @validator('sku')
    def validate_sku(cls, v):
        """Validate SKU format."""
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('SKU must contain only alphanumeric characters, hyphens, and underscores')
        return v.upper()


class InventoryItemCreate(InventoryItemBase):
    """Schema for creating inventory items."""
    pass


class InventoryItemUpdate(BaseModel):
    """Schema for updating inventory items."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[CategoryEnum] = None
    quantity: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, gt=0)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    
    @validator('price')
    def validate_price(cls, v):
        """Validate price to have at most 2 decimal places."""
        if v is not None and round(v, 2) != v:
            raise ValueError('Price must have at most 2 decimal places')
        return v
    
    @validator('sku')
    def validate_sku(cls, v):
        """Validate SKU format."""
        if v is not None:
            if not v.replace('-', '').replace('_', '').isalnum():
                raise ValueError('SKU must contain only alphanumeric characters, hyphens, and underscores')
            return v.upper()
        return v


class InventoryItemResponse(InventoryItemBase):
    """Schema for inventory item responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InventoryItemsResponse(BaseModel):
    """Schema for paginated inventory items response."""
    items: list[InventoryItemResponse]
    total: int
    page: int
    size: int
    pages: int


class HealthResponse(BaseModel):
    """Schema for health check response."""
    status: str = "ok"
    timestamp: datetime
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    error_code: Optional[str] = None
