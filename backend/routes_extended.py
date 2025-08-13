"""
Extended API routes for the full inventory management system.
"""
import math
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import OrderStatusEnum, StockMovementTypeEnum
from schemas_extended import (
    CustomerCreate, CustomerUpdate, CustomerResponse, PaginatedCustomersResponse,
    SupplierCreate, SupplierUpdate, SupplierResponse, PaginatedSuppliersResponse,
    OrderCreate, OrderUpdate, OrderResponse, PaginatedOrdersResponse,
    StockMovementCreate, StockMovementResponse, PaginatedStockMovementsResponse,
    StockLevelReport, SalesReport, InventoryValuation, DashboardSummary
)
from crud_extended import (
    customer_crud, supplier_crud, order_crud, stock_movement_crud, reports_crud
)
from crud import inventory_crud

# Create routers
customers_router = APIRouter(prefix="/api/customers", tags=["Customers"])
suppliers_router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])
orders_router = APIRouter(prefix="/api/orders", tags=["Orders"])
stock_router = APIRouter(prefix="/api/stock", tags=["Stock Management"])
reports_router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])
dashboard_router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


# Customer Routes
@customers_router.get(
    "/",
    response_model=PaginatedCustomersResponse,
    summary="Get customers",
    description="Get customers with optional filtering, searching, and pagination"
)
async def get_customers(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name or email"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """Get customers with filtering and pagination."""
    skip = (page - 1) * size
    
    customers, total = customer_crud.get_customers(
        db=db,
        skip=skip,
        limit=size,
        search=search,
        is_active=is_active
    )
    
    pages = math.ceil(total / size) if total > 0 else 1
    
    return PaginatedCustomersResponse(
        items=customers,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@customers_router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get customer",
    description="Get a specific customer by ID"
)
async def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a specific customer."""
    customer = customer_crud.get_customer(db=db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@customers_router.post(
    "/",
    response_model=CustomerResponse,
    status_code=201,
    summary="Create customer",
    description="Create a new customer"
)
async def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer."""
    return customer_crud.create_customer(db=db, customer=customer)


@customers_router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update customer",
    description="Update an existing customer"
)
async def update_customer(
    customer_id: int,
    customer_update: CustomerUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing customer."""
    updated_customer = customer_crud.update_customer(
        db=db, customer_id=customer_id, customer_update=customer_update
    )
    if not updated_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated_customer


@customers_router.delete(
    "/{customer_id}",
    status_code=204,
    summary="Delete customer",
    description="Delete a customer"
)
async def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer."""
    success = customer_crud.delete_customer(db=db, customer_id=customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")


# Supplier Routes
@suppliers_router.get(
    "/",
    response_model=PaginatedSuppliersResponse,
    summary="Get suppliers",
    description="Get suppliers with optional filtering, searching, and pagination"
)
async def get_suppliers(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name, contact, or email"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """Get suppliers with filtering and pagination."""
    skip = (page - 1) * size
    
    suppliers, total = supplier_crud.get_suppliers(
        db=db,
        skip=skip,
        limit=size,
        search=search,
        is_active=is_active
    )
    
    pages = math.ceil(total / size) if total > 0 else 1
    
    return PaginatedSuppliersResponse(
        items=suppliers,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@suppliers_router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Get supplier",
    description="Get a specific supplier by ID"
)
async def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Get a specific supplier."""
    supplier = supplier_crud.get_supplier(db=db, supplier_id=supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@suppliers_router.post(
    "/",
    response_model=SupplierResponse,
    status_code=201,
    summary="Create supplier",
    description="Create a new supplier"
)
async def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    """Create a new supplier."""
    return supplier_crud.create_supplier(db=db, supplier=supplier)


@suppliers_router.put(
    "/{supplier_id}",
    response_model=SupplierResponse,
    summary="Update supplier",
    description="Update an existing supplier"
)
async def update_supplier(
    supplier_id: int,
    supplier_update: SupplierUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing supplier."""
    updated_supplier = supplier_crud.update_supplier(
        db=db, supplier_id=supplier_id, supplier_update=supplier_update
    )
    if not updated_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return updated_supplier


@suppliers_router.delete(
    "/{supplier_id}",
    status_code=204,
    summary="Delete supplier",
    description="Delete a supplier"
)
async def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Delete a supplier."""
    success = supplier_crud.delete_supplier(db=db, supplier_id=supplier_id)
    if not success:
        raise HTTPException(status_code=404, detail="Supplier not found")


# Order Routes
@orders_router.get(
    "/",
    response_model=PaginatedOrdersResponse,
    summary="Get orders",
    description="Get orders with optional filtering and pagination"
)
async def get_orders(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Items per page"),
    status: Optional[OrderStatusEnum] = Query(None, description="Filter by status"),
    customer_id: Optional[int] = Query(None, description="Filter by customer"),
    date_from: Optional[datetime] = Query(None, description="Filter from date"),
    date_to: Optional[datetime] = Query(None, description="Filter to date"),
    db: Session = Depends(get_db)
):
    """Get orders with filtering and pagination."""
    skip = (page - 1) * size
    
    orders, total = order_crud.get_orders(
        db=db,
        skip=skip,
        limit=size,
        status=status,
        customer_id=customer_id,
        date_from=date_from,
        date_to=date_to
    )
    
    pages = math.ceil(total / size) if total > 0 else 1
    
    return PaginatedOrdersResponse(
        items=orders,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@orders_router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get order",
    description="Get a specific order by ID"
)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order."""
    order = order_crud.get_order(db=db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@orders_router.post(
    "/",
    response_model=OrderResponse,
    status_code=201,
    summary="Create order",
    description="Create a new order"
)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order."""
    return order_crud.create_order(db=db, order=order)


@orders_router.put(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Update order",
    description="Update an existing order"
)
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing order."""
    updated_order = order_crud.update_order(
        db=db, order_id=order_id, order_update=order_update
    )
    if not updated_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated_order


@orders_router.post(
    "/{order_id}/cancel",
    response_model=OrderResponse,
    summary="Cancel order",
    description="Cancel an order and restore inventory"
)
async def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel an order and restore inventory."""
    cancelled_order = order_crud.cancel_order(db=db, order_id=order_id)
    if not cancelled_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return cancelled_order


# Stock Movement Routes
@stock_router.get(
    "/movements",
    response_model=PaginatedStockMovementsResponse,
    summary="Get stock movements",
    description="Get stock movements with optional filtering and pagination"
)
async def get_stock_movements(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Items per page"),
    inventory_item_id: Optional[int] = Query(None, description="Filter by inventory item"),
    movement_type: Optional[StockMovementTypeEnum] = Query(None, description="Filter by movement type"),
    date_from: Optional[datetime] = Query(None, description="Filter from date"),
    date_to: Optional[datetime] = Query(None, description="Filter to date"),
    db: Session = Depends(get_db)
):
    """Get stock movements with filtering and pagination."""
    skip = (page - 1) * size
    
    movements, total = stock_movement_crud.get_stock_movements(
        db=db,
        skip=skip,
        limit=size,
        inventory_item_id=inventory_item_id,
        movement_type=movement_type,
        date_from=date_from,
        date_to=date_to
    )
    
    pages = math.ceil(total / size) if total > 0 else 1
    
    return PaginatedStockMovementsResponse(
        items=movements,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@stock_router.post(
    "/movements",
    response_model=StockMovementResponse,
    status_code=201,
    summary="Create stock movement",
    description="Create a manual stock adjustment"
)
async def create_stock_movement(
    movement: StockMovementCreate,
    db: Session = Depends(get_db)
):
    """Create a manual stock movement."""
    return stock_movement_crud.create_movement(
        db=db,
        inventory_item_id=movement.inventory_item_id,
        movement_type=movement.movement_type,
        quantity=movement.quantity,
        reference_type=movement.reference_type,
        reference_id=movement.reference_id,
        notes=movement.notes,
        unit_cost=movement.unit_cost,
        created_by=movement.created_by
    )


@stock_router.get(
    "/levels",
    response_model=List[StockLevelReport],
    summary="Get stock levels",
    description="Get current stock levels with status indicators"
)
async def get_stock_levels(
    low_stock_only: bool = Query(False, description="Show only low stock items"),
    db: Session = Depends(get_db)
):
    """Get current stock levels."""
    if low_stock_only:
        items = reports_crud.get_low_stock_items(db=db)
    else:
        items, _ = inventory_crud.get_items(db=db, skip=0, limit=1000)
    
    stock_levels = []
    for item in items:
        if item.quantity <= item.min_stock_level:
            status = "low"
        elif item.quantity >= item.max_stock_level:
            status = "high"
        else:
            status = "normal"
        
        stock_levels.append(StockLevelReport(
            inventory_item_id=item.id,
            item_name=item.name,
            sku=item.sku,
            current_quantity=item.quantity,
            min_stock_level=item.min_stock_level,
            max_stock_level=item.max_stock_level,
            status=status
        ))
    
    return stock_levels


# Reports Routes
@reports_router.get(
    "/inventory-valuation",
    response_model=InventoryValuation,
    summary="Get inventory valuation",
    description="Get current inventory valuation report"
)
async def get_inventory_valuation(db: Session = Depends(get_db)):
    """Get inventory valuation report."""
    valuation_data = reports_crud.get_inventory_valuation(db=db)
    
    return InventoryValuation(
        total_items=valuation_data['total_items'],
        total_quantity=valuation_data['total_quantity'],
        total_cost_value=valuation_data['total_cost_value'],
        total_retail_value=valuation_data['total_retail_value'],
        potential_profit=valuation_data['potential_profit'],
        categories_breakdown=[]  # TODO: Implement category breakdown
    )


@reports_router.get(
    "/sales-summary",
    response_model=SalesReport,
    summary="Get sales summary",
    description="Get sales summary for a specified period"
)
async def get_sales_summary(
    date_from: Optional[datetime] = Query(None, description="Start date"),
    date_to: Optional[datetime] = Query(None, description="End date"),
    db: Session = Depends(get_db)
):
    """Get sales summary report."""
    sales_data = reports_crud.get_sales_summary(
        db=db, date_from=date_from, date_to=date_to
    )
    
    period = "All time"
    if date_from and date_to:
        period = f"{date_from.strftime('%Y-%m-%d')} to {date_to.strftime('%Y-%m-%d')}"
    elif date_from:
        period = f"From {date_from.strftime('%Y-%m-%d')}"
    elif date_to:
        period = f"Until {date_to.strftime('%Y-%m-%d')}"
    
    return SalesReport(
        period=period,
        total_orders=sales_data['total_orders'],
        total_revenue=sales_data['total_revenue'],
        total_items_sold=sales_data['total_items_sold'],
        average_order_value=sales_data['average_order_value'],
        top_selling_items=[]  # TODO: Implement top selling items
    )


# Dashboard Routes
@dashboard_router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Get dashboard summary",
    description="Get dashboard summary with key metrics and recent activity"
)
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get dashboard summary."""
    # Get counts
    inventory_items, total_items = inventory_crud.get_items(db=db, skip=0, limit=1)
    customers, total_customers = customer_crud.get_customers(db=db, skip=0, limit=1)
    suppliers, total_suppliers = supplier_crud.get_suppliers(db=db, skip=0, limit=1)
    
    # Get pending orders
    pending_orders, total_pending = order_crud.get_orders(
        db=db, skip=0, limit=1, status=OrderStatusEnum.PENDING
    )
    
    # Get low stock items
    low_stock_items = reports_crud.get_low_stock_items(db=db)
    
    # Get inventory valuation
    valuation = reports_crud.get_inventory_valuation(db=db)
    
    # Get recent orders
    recent_orders, _ = order_crud.get_orders(db=db, skip=0, limit=5)
    
    # Get recent stock movements
    recent_movements, _ = stock_movement_crud.get_stock_movements(db=db, skip=0, limit=5)
    
    # Create alerts
    alerts = []
    if len(low_stock_items) > 0:
        alerts.append({
            "type": "warning",
            "message": f"{len(low_stock_items)} items have low stock levels",
            "action_url": "/api/stock/levels?low_stock_only=true"
        })
    
    return DashboardSummary(
        total_inventory_items=total_items,
        total_customers=total_customers,
        total_suppliers=total_suppliers,
        pending_orders=total_pending,
        low_stock_items=len(low_stock_items),
        total_inventory_value=valuation['total_retail_value'],
        recent_orders=recent_orders,
        recent_stock_movements=recent_movements,
        alerts=alerts
    )


# Create a list of all routers for easy import
extended_routers = [
    customers_router,
    suppliers_router,
    orders_router,
    stock_router,
    reports_router,
    dashboard_router
]
