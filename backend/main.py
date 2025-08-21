"""
FastAPI main application for inventory management system.
"""
from datetime import datetime
from typing import Optional, List
import math

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from config import settings
from database import get_db, create_tables
from models import CategoryEnum
from schemas import (
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
    InventoryItemsResponse,
    HealthResponse,
    ErrorResponse
)
from crud import inventory_crud

# Import extended routes
from routes_extended import extended_routers

# Create FastAPI app
app = FastAPI(
    title="Inventory Management API",
    description="A comprehensive inventory management system with enterprise features",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include extended routers
for router in extended_routers:
    app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    create_tables()
    print(f"🚀 FastAPI server starting on {settings.api_host}:{settings.api_port}")
    print(f"📚 API documentation available at: http://{settings.api_host}:{settings.api_port}/docs")


# Health check endpoint
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(),
        version="1.0.0"
    )


# Inventory endpoints
@app.get(
    "/api/inventory",
    response_model=InventoryItemsResponse,
    tags=["Inventory"],
    summary="Get inventory items",
    description="Get inventory items with optional filtering, searching, and pagination"
)
async def get_inventory_items(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name, SKU, or description"),
    category: Optional[CategoryEnum] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Get inventory items with filtering and pagination."""
    skip = (page - 1) * size
    
    items, total = inventory_crud.get_items(
        db=db,
        skip=skip,
        limit=size,
        search=search,
        category=category
    )
    
    pages = math.ceil(total / size) if total > 0 else 1
    
    return InventoryItemsResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@app.get(
    "/api/inventory/low-stock",
    response_model=List[InventoryItemResponse],
    tags=["Inventory"],
    summary="Get low stock items",
    description="Get items with low stock levels"
)
async def get_low_stock_items(
    threshold: int = Query(10, ge=0, description="Stock threshold"),
    db: Session = Depends(get_db)
):
    """Get items with low stock."""
    return inventory_crud.get_low_stock_items(db=db, threshold=threshold)

@app.get(
    "/api/inventory/{item_id}",
    response_model=InventoryItemResponse,
    tags=["Inventory"],
    summary="Get inventory item",
    description="Get a specific inventory item by ID"
)
async def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific inventory item."""
    item = inventory_crud.get_item(db=db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.post(
    "/api/inventory",
    response_model=InventoryItemResponse,
    status_code=201,
    tags=["Inventory"],
    summary="Create inventory item",
    description="Create a new inventory item"
)
async def create_inventory_item(
    item: InventoryItemCreate,
    db: Session = Depends(get_db)
):
    """Create a new inventory item."""
    try:
        return inventory_crud.create_item(db=db, item=item)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put(
    "/api/inventory/{item_id}",
    response_model=InventoryItemResponse,
    tags=["Inventory"],
    summary="Update inventory item",
    description="Update an existing inventory item"
)
async def update_inventory_item(
    item_id: int,
    item_update: InventoryItemUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing inventory item."""
    try:
        updated_item = inventory_crud.update_item(db=db, item_id=item_id, item_update=item_update)
        if not updated_item:
            raise HTTPException(status_code=404, detail="Item not found")
        return updated_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete(
    "/api/inventory/{item_id}",
    status_code=204,
    tags=["Inventory"],
    summary="Delete inventory item",
    description="Delete an inventory item"
)
async def delete_inventory_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Delete an inventory item."""
    success = inventory_crud.delete_item(db=db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")


@app.get(
    "/api/categories",
    response_model=List[str],
    tags=["Inventory"],
    summary="Get categories",
    description="Get all available inventory categories"
)
async def get_categories(db: Session = Depends(get_db)):
    """Get all available categories."""
    return inventory_crud.get_categories(db=db)


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors."""
    return {"detail": "Resource not found", "error_code": "NOT_FOUND"}


@app.exception_handler(422)
async def validation_exception_handler(request, exc):
    """Handle validation errors."""
    return {"detail": "Validation error", "error_code": "VALIDATION_ERROR", "errors": exc.detail}


@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    """Handle internal server errors."""
    return {"detail": "Internal server error", "error_code": "INTERNAL_ERROR"}


if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting FastAPI server on http://0.0.0.0:{settings.api_port}")
    print(f"📚 API documentation: http://localhost:{settings.api_port}/docs")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.api_port,
        reload=settings.debug,
        log_level="info"
    )
