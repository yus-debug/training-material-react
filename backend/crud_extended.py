"""
Extended CRUD operations for the full inventory management system.
"""
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, func, case
from fastapi import HTTPException

from models import (
    Customer, Supplier, Order, OrderItem, PurchaseOrder, PurchaseOrderItem,
    StockMovement, InventoryItem, AuditLog, OrderStatusEnum, StockMovementTypeEnum
)
from schemas_extended import (
    CustomerCreate, CustomerUpdate, SupplierCreate, SupplierUpdate,
    OrderCreate, OrderUpdate, PurchaseOrderCreate, PurchaseOrderUpdate,
    StockMovementCreate
)


class CustomerCRUD:
    """CRUD operations for customers."""
    
    @staticmethod
    def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
        """Get a single customer by ID."""
        return db.query(Customer).filter(Customer.id == customer_id).first()
    
    @staticmethod
    def get_customer_by_email(db: Session, email: str) -> Optional[Customer]:
        """Get a customer by email."""
        return db.query(Customer).filter(Customer.email == email).first()
    
    @staticmethod
    def get_customers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Tuple[List[Customer], int]:
        """Get customers with optional filtering and pagination."""
        query = db.query(Customer)
        
        filters = []
        if search:
            search_filter = or_(
                Customer.first_name.ilike(f"%{search}%"),
                Customer.last_name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
                func.concat(Customer.first_name, ' ', Customer.last_name).ilike(f"%{search}%")
            )
            filters.append(search_filter)
        
        if is_active is not None:
            filters.append(Customer.is_active == is_active)
        
        if filters:
            query = query.filter(and_(*filters))
        
        total = query.count()
        customers = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
        
        return customers, total
    
    @staticmethod
    def create_customer(db: Session, customer: CustomerCreate) -> Customer:
        """Create a new customer."""
        existing_customer = CustomerCRUD.get_customer_by_email(db, customer.email)
        if existing_customer:
            raise HTTPException(
                status_code=400,
                detail=f"Customer with email '{customer.email}' already exists"
            )
        
        db_customer = Customer(**customer.dict())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    
    @staticmethod
    def update_customer(
        db: Session,
        customer_id: int,
        customer_update: CustomerUpdate
    ) -> Optional[Customer]:
        """Update an existing customer."""
        db_customer = CustomerCRUD.get_customer(db, customer_id)
        if not db_customer:
            return None
        
        # Check if email conflicts with another customer
        if customer_update.email and customer_update.email != db_customer.email:
            existing_customer = CustomerCRUD.get_customer_by_email(db, customer_update.email)
            if existing_customer and existing_customer.id != customer_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Customer with email '{customer_update.email}' already exists"
                )
        
        update_data = customer_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_customer, field, value)
        
        db.commit()
        db.refresh(db_customer)
        return db_customer
    
    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> bool:
        """Delete a customer (soft delete by setting is_active=False)."""
        db_customer = CustomerCRUD.get_customer(db, customer_id)
        if not db_customer:
            return False
        
        # Check if customer has orders
        order_count = db.query(Order).filter(Order.customer_id == customer_id).count()
        if order_count > 0:
            # Soft delete - don't actually delete if has orders
            db_customer.is_active = False
            db.commit()
        else:
            # Hard delete if no orders
            db.delete(db_customer)
            db.commit()
        
        return True


class SupplierCRUD:
    """CRUD operations for suppliers."""
    
    @staticmethod
    def get_supplier(db: Session, supplier_id: int) -> Optional[Supplier]:
        """Get a single supplier by ID."""
        return db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    @staticmethod
    def get_supplier_by_email(db: Session, email: str) -> Optional[Supplier]:
        """Get a supplier by email."""
        return db.query(Supplier).filter(Supplier.email == email).first()
    
    @staticmethod
    def get_suppliers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Tuple[List[Supplier], int]:
        """Get suppliers with optional filtering and pagination."""
        query = db.query(Supplier)
        
        filters = []
        if search:
            search_filter = or_(
                Supplier.name.ilike(f"%{search}%"),
                Supplier.contact_person.ilike(f"%{search}%"),
                Supplier.email.ilike(f"%{search}%")
            )
            filters.append(search_filter)
        
        if is_active is not None:
            filters.append(Supplier.is_active == is_active)
        
        if filters:
            query = query.filter(and_(*filters))
        
        total = query.count()
        suppliers = query.order_by(Supplier.created_at.desc()).offset(skip).limit(limit).all()
        
        return suppliers, total
    
    @staticmethod
    def create_supplier(db: Session, supplier: SupplierCreate) -> Supplier:
        """Create a new supplier."""
        existing_supplier = SupplierCRUD.get_supplier_by_email(db, supplier.email)
        if existing_supplier:
            raise HTTPException(
                status_code=400,
                detail=f"Supplier with email '{supplier.email}' already exists"
            )
        
        db_supplier = Supplier(**supplier.dict())
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
    
    @staticmethod
    def update_supplier(
        db: Session,
        supplier_id: int,
        supplier_update: SupplierUpdate
    ) -> Optional[Supplier]:
        """Update an existing supplier."""
        db_supplier = SupplierCRUD.get_supplier(db, supplier_id)
        if not db_supplier:
            return None
        
        # Check if email conflicts with another supplier
        if supplier_update.email and supplier_update.email != db_supplier.email:
            existing_supplier = SupplierCRUD.get_supplier_by_email(db, supplier_update.email)
            if existing_supplier and existing_supplier.id != supplier_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Supplier with email '{supplier_update.email}' already exists"
                )
        
        update_data = supplier_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_supplier, field, value)
        
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
    
    @staticmethod
    def delete_supplier(db: Session, supplier_id: int) -> bool:
        """Delete a supplier (soft delete by setting is_active=False)."""
        db_supplier = SupplierCRUD.get_supplier(db, supplier_id)
        if not db_supplier:
            return False
        
        # Check if supplier has items or purchase orders
        item_count = db.query(InventoryItem).filter(InventoryItem.supplier_id == supplier_id).count()
        po_count = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id).count()
        
        if item_count > 0 or po_count > 0:
            # Soft delete
            db_supplier.is_active = False
            db.commit()
        else:
            # Hard delete if no references
            db.delete(db_supplier)
            db.commit()
        
        return True


class OrderCRUD:
    """CRUD operations for orders."""
    
    @staticmethod
    def generate_order_number(db: Session) -> str:
        """Generate a unique order number."""
        today = datetime.now().strftime("%Y%m%d")
        count = db.query(Order).filter(
            Order.order_number.like(f"ORD-{today}-%")
        ).count()
        return f"ORD-{today}-{count + 1:04d}"
    
    @staticmethod
    def get_order(db: Session, order_id: int) -> Optional[Order]:
        """Get a single order by ID with related data."""
        return db.query(Order).options(
            joinedload(Order.customer),
            joinedload(Order.order_items).joinedload(OrderItem.inventory_item)
        ).filter(Order.id == order_id).first()
    
    @staticmethod
    def get_orders(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: Optional[OrderStatusEnum] = None,
        customer_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Tuple[List[Order], int]:
        """Get orders with optional filtering and pagination."""
        query = db.query(Order).options(
            joinedload(Order.customer),
            joinedload(Order.order_items)
        )
        
        filters = []
        if status:
            filters.append(Order.status == status)
        if customer_id:
            filters.append(Order.customer_id == customer_id)
        if date_from:
            filters.append(Order.order_date >= date_from)
        if date_to:
            filters.append(Order.order_date <= date_to)
        
        if filters:
            query = query.filter(and_(*filters))
        
        total = query.count()
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
        
        return orders, total
    
    @staticmethod
    def create_order(db: Session, order: OrderCreate) -> Order:
        """Create a new order with items."""
        # Verify customer exists
        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Generate order number
        order_number = OrderCRUD.generate_order_number(db)
        
        # Calculate totals
        subtotal = Decimal('0.00')
        order_items_data = []
        
        for item in order.items:
            # Verify inventory item exists and has enough stock
            inventory_item = db.query(InventoryItem).filter(
                InventoryItem.id == item.inventory_item_id
            ).first()
            if not inventory_item:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Inventory item {item.inventory_item_id} not found"
                )
            
            if inventory_item.quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for item {inventory_item.name}. Available: {inventory_item.quantity}, Requested: {item.quantity}"
                )
            
            total_price = item.unit_price * item.quantity
            subtotal += total_price
            
            order_items_data.append({
                'inventory_item_id': item.inventory_item_id,
                'quantity': item.quantity,
                'unit_price': item.unit_price,
                'total_price': total_price,
                'inventory_item': inventory_item
            })
        
        # Calculate tax and total
        tax_rate = order.tax_rate or Decimal('0.0')
        tax_amount = subtotal * tax_rate
        shipping_cost = order.shipping_cost or Decimal('0.0')
        total_amount = subtotal + tax_amount + shipping_cost
        
        # Create order
        order_dict = order.dict(exclude={'items', 'tax_rate'})
        db_order = Order(
            **order_dict,
            order_number=order_number,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount
        )
        db.add(db_order)
        db.flush()  # Get the order ID
        
        # Create order items and update inventory
        for item_data in order_items_data:
            db_order_item = OrderItem(
                order_id=db_order.id,
                inventory_item_id=item_data['inventory_item_id'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                total_price=item_data['total_price']
            )
            db.add(db_order_item)
            
            # Update inventory quantity
            inventory_item = item_data['inventory_item']
            StockMovementCRUD.create_movement(
                db=db,
                inventory_item_id=inventory_item.id,
                movement_type=StockMovementTypeEnum.OUT,
                quantity=-item_data['quantity'],
                reference_type='order',
                reference_id=db_order.id,
                notes=f"Sold via order {order_number}"
            )
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def update_order(
        db: Session,
        order_id: int,
        order_update: OrderUpdate
    ) -> Optional[Order]:
        """Update an existing order."""
        db_order = OrderCRUD.get_order(db, order_id)
        if not db_order:
            return None
        
        update_data = order_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_order, field, value)
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def cancel_order(db: Session, order_id: int) -> Optional[Order]:
        """Cancel an order and restore inventory."""
        db_order = OrderCRUD.get_order(db, order_id)
        if not db_order:
            return None
        
        if db_order.status in [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED]:
            raise HTTPException(
                status_code=400,
                detail="Cannot cancel shipped or delivered orders"
            )
        
        # Restore inventory for each item
        for order_item in db_order.order_items:
            StockMovementCRUD.create_movement(
                db=db,
                inventory_item_id=order_item.inventory_item_id,
                movement_type=StockMovementTypeEnum.RETURN,
                quantity=order_item.quantity,
                reference_type='order_cancellation',
                reference_id=order_id,
                notes=f"Order {db_order.order_number} cancelled"
            )
        
        db_order.status = OrderStatusEnum.CANCELLED
        db.commit()
        db.refresh(db_order)
        return db_order


class StockMovementCRUD:
    """CRUD operations for stock movements."""
    
    @staticmethod
    def create_movement(
        db: Session,
        inventory_item_id: int,
        movement_type: StockMovementTypeEnum,
        quantity: int,
        reference_type: Optional[str] = None,
        reference_id: Optional[int] = None,
        notes: Optional[str] = None,
        unit_cost: Optional[Decimal] = None,
        created_by: Optional[str] = None
    ) -> StockMovement:
        """Create a stock movement and update inventory quantity."""
        # Get current inventory item
        inventory_item = db.query(InventoryItem).filter(
            InventoryItem.id == inventory_item_id
        ).first()
        if not inventory_item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        previous_quantity = inventory_item.quantity
        new_quantity = previous_quantity + quantity
        
        # Ensure quantity doesn't go negative
        if new_quantity < 0:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Current: {previous_quantity}, Requested change: {quantity}"
            )
        
        # Create stock movement record
        db_movement = StockMovement(
            inventory_item_id=inventory_item_id,
            movement_type=movement_type,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            unit_cost=unit_cost,
            reference_type=reference_type,
            reference_id=reference_id,
            notes=notes,
            created_by=created_by
        )
        db.add(db_movement)
        
        # Update inventory quantity
        inventory_item.quantity = new_quantity
        
        db.commit()
        db.refresh(db_movement)
        return db_movement
    
    @staticmethod
    def get_stock_movements(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        inventory_item_id: Optional[int] = None,
        movement_type: Optional[StockMovementTypeEnum] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Tuple[List[StockMovement], int]:
        """Get stock movements with optional filtering and pagination."""
        query = db.query(StockMovement).options(
            joinedload(StockMovement.inventory_item)
        )
        
        filters = []
        if inventory_item_id:
            filters.append(StockMovement.inventory_item_id == inventory_item_id)
        if movement_type:
            filters.append(StockMovement.movement_type == movement_type)
        if date_from:
            filters.append(StockMovement.created_at >= date_from)
        if date_to:
            filters.append(StockMovement.created_at <= date_to)
        
        if filters:
            query = query.filter(and_(*filters))
        
        total = query.count()
        movements = query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()
        
        return movements, total


class ReportsCRUD:
    """CRUD operations for reports and analytics."""
    
    @staticmethod
    def get_low_stock_items(db: Session, threshold: Optional[int] = None) -> List[InventoryItem]:
        """Get items with low stock levels."""
        if threshold is None:
            # Use each item's min_stock_level
            return db.query(InventoryItem).filter(
                InventoryItem.quantity <= InventoryItem.min_stock_level,
                InventoryItem.is_active == True
            ).all()
        else:
            # Use provided threshold
            return db.query(InventoryItem).filter(
                InventoryItem.quantity <= threshold,
                InventoryItem.is_active == True
            ).all()
    
    @staticmethod
    def get_inventory_valuation(db: Session) -> dict:
        """Get inventory valuation report."""
        result = db.query(
            func.count(InventoryItem.id).label('total_items'),
            func.sum(InventoryItem.quantity).label('total_quantity'),
            func.sum(InventoryItem.quantity * InventoryItem.cost_price).label('total_cost_value'),
            func.sum(InventoryItem.quantity * InventoryItem.price).label('total_retail_value')
        ).filter(InventoryItem.is_active == True).first()
        
        total_cost_value = result.total_cost_value or Decimal('0.00')
        total_retail_value = result.total_retail_value or Decimal('0.00')
        
        return {
            'total_items': result.total_items or 0,
            'total_quantity': result.total_quantity or 0,
            'total_cost_value': total_cost_value,
            'total_retail_value': total_retail_value,
            'potential_profit': total_retail_value - total_cost_value
        }
    
    @staticmethod
    def get_sales_summary(
        db: Session,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> dict:
        """Get sales summary for a period."""
        query = db.query(Order).filter(
            Order.status.in_([OrderStatusEnum.DELIVERED, OrderStatusEnum.SHIPPED])
        )
        
        if date_from:
            query = query.filter(Order.order_date >= date_from)
        if date_to:
            query = query.filter(Order.order_date <= date_to)
        
        orders = query.all()
        
        total_orders = len(orders)
        total_revenue = sum(order.total_amount for order in orders)
        total_items_sold = sum(
            sum(item.quantity for item in order.order_items) 
            for order in orders
        )
        average_order_value = total_revenue / total_orders if total_orders > 0 else Decimal('0.00')
        
        return {
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'total_items_sold': total_items_sold,
            'average_order_value': average_order_value
        }


# Create singleton instances
customer_crud = CustomerCRUD()
supplier_crud = SupplierCRUD()
order_crud = OrderCRUD()
stock_movement_crud = StockMovementCRUD()
reports_crud = ReportsCRUD()
