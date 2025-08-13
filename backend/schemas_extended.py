"""
Extended Pydantic schemas for the full inventory management system.
"""
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, validator, EmailStr
from models import OrderStatusEnum, StockMovementTypeEnum, CategoryEnum


# Customer Schemas
class CustomerBase(BaseModel):
    """Base schema for customers."""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    address_line1: Optional[str] = Field(None, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(default="USA", max_length=50)
    is_active: bool = Field(default=True)


class CustomerCreate(CustomerBase):
    """Schema for creating customers."""
    pass


class CustomerUpdate(BaseModel):
    """Schema for updating customers."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address_line1: Optional[str] = Field(None, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class CustomerResponse(CustomerBase):
    """Schema for customer responses."""
    id: int
    full_name: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Supplier Schemas
class SupplierBase(BaseModel):
    """Base schema for suppliers."""
    name: str = Field(..., min_length=1, max_length=200)
    contact_person: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    address_line1: Optional[str] = Field(None, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(default="USA", max_length=50)
    tax_id: Optional[str] = Field(None, max_length=50)
    payment_terms: Optional[str] = Field(None, max_length=100)
    is_active: bool = Field(default=True)


class SupplierCreate(SupplierBase):
    """Schema for creating suppliers."""
    pass


class SupplierUpdate(BaseModel):
    """Schema for updating suppliers."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    contact_person: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address_line1: Optional[str] = Field(None, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=50)
    tax_id: Optional[str] = Field(None, max_length=50)
    payment_terms: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None


class SupplierResponse(SupplierBase):
    """Schema for supplier responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Order Item Schemas
class OrderItemBase(BaseModel):
    """Base schema for order items."""
    inventory_item_id: int
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., gt=0)


class OrderItemCreate(OrderItemBase):
    """Schema for creating order items."""
    pass


class OrderItemResponse(OrderItemBase):
    """Schema for order item responses."""
    id: int
    total_price: Decimal
    inventory_item: Optional[dict] = None  # Will be populated with item details
    created_at: datetime
    
    class Config:
        from_attributes = True


# Order Schemas
class OrderBase(BaseModel):
    """Base schema for orders."""
    customer_id: int
    required_date: Optional[datetime] = None
    notes: Optional[str] = None
    shipping_address_line1: Optional[str] = Field(None, max_length=200)
    shipping_address_line2: Optional[str] = Field(None, max_length=200)
    shipping_city: Optional[str] = Field(None, max_length=100)
    shipping_state: Optional[str] = Field(None, max_length=50)
    shipping_postal_code: Optional[str] = Field(None, max_length=20)
    shipping_country: Optional[str] = Field(None, max_length=50)
    tax_rate: Optional[Decimal] = Field(default=Decimal('0.0'), ge=0, le=1)
    shipping_cost: Optional[Decimal] = Field(default=Decimal('0.0'), ge=0)


class OrderCreate(OrderBase):
    """Schema for creating orders."""
    items: List[OrderItemCreate] = Field(..., min_items=1)


class OrderUpdate(BaseModel):
    """Schema for updating orders."""
    status: Optional[OrderStatusEnum] = None
    required_date: Optional[datetime] = None
    shipped_date: Optional[datetime] = None
    notes: Optional[str] = None
    shipping_address_line1: Optional[str] = Field(None, max_length=200)
    shipping_address_line2: Optional[str] = Field(None, max_length=200)
    shipping_city: Optional[str] = Field(None, max_length=100)
    shipping_state: Optional[str] = Field(None, max_length=50)
    shipping_postal_code: Optional[str] = Field(None, max_length=20)
    shipping_country: Optional[str] = Field(None, max_length=50)


class OrderResponse(OrderBase):
    """Schema for order responses."""
    id: int
    order_number: str
    status: OrderStatusEnum
    order_date: datetime
    shipped_date: Optional[datetime]
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    customer: Optional[CustomerResponse] = None
    order_items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Stock Movement Schemas
class StockMovementBase(BaseModel):
    """Base schema for stock movements."""
    inventory_item_id: int
    movement_type: StockMovementTypeEnum
    quantity: int  # Can be positive or negative
    unit_cost: Optional[Decimal] = Field(None, gt=0)
    reference_type: Optional[str] = Field(None, max_length=50)
    reference_id: Optional[int] = None
    notes: Optional[str] = None
    created_by: Optional[str] = Field(None, max_length=100)


class StockMovementCreate(StockMovementBase):
    """Schema for creating stock movements."""
    pass


class StockMovementResponse(StockMovementBase):
    """Schema for stock movement responses."""
    id: int
    previous_quantity: int
    new_quantity: int
    inventory_item: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Purchase Order Schemas
class PurchaseOrderItemBase(BaseModel):
    """Base schema for purchase order items."""
    inventory_item_id: int
    quantity_ordered: int = Field(..., gt=0)
    unit_cost: Decimal = Field(..., gt=0)


class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    """Schema for creating purchase order items."""
    pass


class PurchaseOrderItemResponse(PurchaseOrderItemBase):
    """Schema for purchase order item responses."""
    id: int
    quantity_received: int
    total_cost: Decimal
    inventory_item: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class PurchaseOrderBase(BaseModel):
    """Base schema for purchase orders."""
    supplier_id: int
    expected_date: Optional[datetime] = None
    notes: Optional[str] = None


class PurchaseOrderCreate(PurchaseOrderBase):
    """Schema for creating purchase orders."""
    items: List[PurchaseOrderItemCreate] = Field(..., min_items=1)


class PurchaseOrderUpdate(BaseModel):
    """Schema for updating purchase orders."""
    status: Optional[OrderStatusEnum] = None
    expected_date: Optional[datetime] = None
    received_date: Optional[datetime] = None
    notes: Optional[str] = None


class PurchaseOrderResponse(PurchaseOrderBase):
    """Schema for purchase order responses."""
    id: int
    po_number: str
    status: OrderStatusEnum
    order_date: datetime
    received_date: Optional[datetime]
    total_amount: Decimal
    supplier: Optional[SupplierResponse] = None
    purchase_order_items: List[PurchaseOrderItemResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Analytics and Reports Schemas
class StockLevelReport(BaseModel):
    """Schema for stock level reports."""
    inventory_item_id: int
    item_name: str
    sku: str
    current_quantity: int
    min_stock_level: int
    max_stock_level: int
    status: str  # 'low', 'normal', 'high'
    days_of_stock: Optional[int] = None


class SalesReport(BaseModel):
    """Schema for sales reports."""
    period: str
    total_orders: int
    total_revenue: Decimal
    total_items_sold: int
    average_order_value: Decimal
    top_selling_items: List[dict]


class InventoryValuation(BaseModel):
    """Schema for inventory valuation."""
    total_items: int
    total_quantity: int
    total_cost_value: Decimal
    total_retail_value: Decimal
    potential_profit: Decimal
    categories_breakdown: List[dict]


# Audit Log Schema
class AuditLogResponse(BaseModel):
    """Schema for audit log responses."""
    id: int
    table_name: str
    record_id: int
    action: str
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Paginated Response Schemas
class PaginatedCustomersResponse(BaseModel):
    """Schema for paginated customers response."""
    items: List[CustomerResponse]
    total: int
    page: int
    size: int
    pages: int


class PaginatedSuppliersResponse(BaseModel):
    """Schema for paginated suppliers response."""
    items: List[SupplierResponse]
    total: int
    page: int
    size: int
    pages: int


class PaginatedOrdersResponse(BaseModel):
    """Schema for paginated orders response."""
    items: List[OrderResponse]
    total: int
    page: int
    size: int
    pages: int


class PaginatedStockMovementsResponse(BaseModel):
    """Schema for paginated stock movements response."""
    items: List[StockMovementResponse]
    total: int
    page: int
    size: int
    pages: int


class PaginatedPurchaseOrdersResponse(BaseModel):
    """Schema for paginated purchase orders response."""
    items: List[PurchaseOrderResponse]
    total: int
    page: int
    size: int
    pages: int


# Dashboard Summary Schema
class DashboardSummary(BaseModel):
    """Schema for dashboard summary."""
    total_inventory_items: int
    total_customers: int
    total_suppliers: int
    pending_orders: int
    low_stock_items: int
    total_inventory_value: Decimal
    recent_orders: List[OrderResponse]
    recent_stock_movements: List[StockMovementResponse]
    alerts: List[dict]
