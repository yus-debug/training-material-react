"""
SQLAlchemy models for the inventory management system.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum, ForeignKey, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base


class CategoryEnum(str, enum.Enum):
    """Enum for inventory categories."""
    ELECTRONICS = "electronics"
    CLOTHING = "clothing" 
    BOOKS = "books"
    HOME = "home"
    OTHER = "other"


class OrderStatusEnum(str, enum.Enum):
    """Enum for order statuses."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"


class StockMovementTypeEnum(str, enum.Enum):
    """Enum for stock movement types."""
    IN = "in"           # Stock received
    OUT = "out"         # Stock sold/used
    ADJUSTMENT = "adjustment"  # Manual adjustment
    TRANSFER = "transfer"      # Transfer between locations
    RETURN = "return"          # Customer return
    DAMAGE = "damage"          # Damaged/lost stock


class InventoryItem(Base):
    """SQLAlchemy model for inventory items."""
    
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(Enum(CategoryEnum), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    price = Column(Numeric(10, 2), nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=True)  # Purchase cost
    sku = Column(String(100), nullable=False, unique=True, index=True)
    barcode = Column(String(50), nullable=True, unique=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    min_stock_level = Column(Integer, default=10)  # Minimum stock alert level
    max_stock_level = Column(Integer, default=100)  # Maximum stock level
    location = Column(String(100), nullable=True)  # Storage location
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="items")
    order_items = relationship("OrderItem", back_populates="inventory_item")
    stock_movements = relationship("StockMovement", back_populates="inventory_item")
    
    def __repr__(self):
        return f"<InventoryItem(id={self.id}, name='{self.name}', sku='{self.sku}')>"


class Customer(Base):
    """SQLAlchemy model for customers."""
    
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(20), nullable=True)
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(50), default="USA")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    orders = relationship("Order", back_populates="customer")
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self):
        return f"<Customer(id={self.id}, name='{self.full_name}', email='{self.email}')>"


class Supplier(Base):
    """SQLAlchemy model for suppliers."""
    
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    contact_person = Column(String(100), nullable=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(20), nullable=True)
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(50), default="USA")
    tax_id = Column(String(50), nullable=True)
    payment_terms = Column(String(100), nullable=True)  # e.g., "Net 30"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    items = relationship("InventoryItem", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
    
    def __repr__(self):
        return f"<Supplier(id={self.id}, name='{self.name}', email='{self.email}')>"


class Order(Base):
    """SQLAlchemy model for customer orders."""
    
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(Enum(OrderStatusEnum), nullable=False, default=OrderStatusEnum.PENDING)
    order_date = Column(DateTime(timezone=True), server_default=func.now())
    required_date = Column(DateTime(timezone=True), nullable=True)
    shipped_date = Column(DateTime(timezone=True), nullable=True)
    subtotal = Column(Numeric(10, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0)
    shipping_cost = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    notes = Column(Text, nullable=True)
    
    # Shipping address (can be different from customer address)
    shipping_address_line1 = Column(String(200), nullable=True)
    shipping_address_line2 = Column(String(200), nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_state = Column(String(50), nullable=True)
    shipping_postal_code = Column(String(20), nullable=True)
    shipping_country = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order(id={self.id}, number='{self.order_number}', status='{self.status}')>"


class OrderItem(Base):
    """SQLAlchemy model for order line items."""
    
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    inventory_item = relationship("InventoryItem", back_populates="order_items")
    
    def __repr__(self):
        return f"<OrderItem(id={self.id}, order_id={self.order_id}, quantity={self.quantity})>"


class PurchaseOrder(Base):
    """SQLAlchemy model for purchase orders to suppliers."""
    
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    po_number = Column(String(50), unique=True, nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    status = Column(Enum(OrderStatusEnum), nullable=False, default=OrderStatusEnum.PENDING)
    order_date = Column(DateTime(timezone=True), server_default=func.now())
    expected_date = Column(DateTime(timezone=True), nullable=True)
    received_date = Column(DateTime(timezone=True), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchase_orders")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<PurchaseOrder(id={self.id}, number='{self.po_number}', status='{self.status}')>"


class PurchaseOrderItem(Base):
    """SQLAlchemy model for purchase order line items."""
    
    __tablename__ = "purchase_order_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    quantity_ordered = Column(Integer, nullable=False)
    quantity_received = Column(Integer, nullable=False, default=0)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    total_cost = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="purchase_order_items")
    inventory_item = relationship("InventoryItem")
    
    def __repr__(self):
        return f"<PurchaseOrderItem(id={self.id}, po_id={self.purchase_order_id}, quantity={self.quantity_ordered})>"


class StockMovement(Base):
    """SQLAlchemy model for tracking all stock movements."""
    
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    movement_type = Column(Enum(StockMovementTypeEnum), nullable=False)
    quantity = Column(Integer, nullable=False)  # Positive for IN, negative for OUT
    previous_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=True)
    reference_type = Column(String(50), nullable=True)  # 'order', 'purchase_order', 'adjustment', etc.
    reference_id = Column(Integer, nullable=True)  # ID of the related record
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(100), nullable=True)  # User who made the movement
    
    # Relationships
    inventory_item = relationship("InventoryItem", back_populates="stock_movements")
    
    def __repr__(self):
        return f"<StockMovement(id={self.id}, item_id={self.inventory_item_id}, type='{self.movement_type}', qty={self.quantity})>"


class AuditLog(Base):
    """SQLAlchemy model for audit trail."""
    
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    table_name = Column(String(50), nullable=False, index=True)
    record_id = Column(Integer, nullable=False)
    action = Column(String(20), nullable=False)  # 'CREATE', 'UPDATE', 'DELETE'
    old_values = Column(Text, nullable=True)  # JSON string of old values
    new_values = Column(Text, nullable=True)  # JSON string of new values
    user_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, table='{self.table_name}', action='{self.action}')>"
