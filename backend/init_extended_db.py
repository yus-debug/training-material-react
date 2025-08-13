"""
Initialize the extended database with sample data for all entities.
"""
import os
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import (
    Base, InventoryItem, Customer, Supplier, Order, OrderItem,
    StockMovement, CategoryEnum, OrderStatusEnum, StockMovementTypeEnum
)


def init_extended_database():
    """Initialize database with comprehensive sample data."""
    print("🔧 Initializing extended database...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_customers = db.query(Customer).count()
        if existing_customers > 0:
            print("ℹ️ Database already contains data, skipping initialization")
            return
        
        # Create suppliers first
        suppliers_data = [
            {
                "name": "Tech Solutions Inc",
                "contact_person": "John Smith",
                "email": "john@techsolutions.com",
                "phone": "+1-555-0101",
                "address_line1": "123 Tech Street",
                "city": "San Francisco",
                "state": "CA",
                "postal_code": "94102",
                "tax_id": "TAX-123456",
                "payment_terms": "Net 30"
            },
            {
                "name": "Fashion Wholesale Co",
                "contact_person": "Sarah Johnson",
                "email": "sarah@fashionwholesale.com",
                "phone": "+1-555-0102",
                "address_line1": "456 Fashion Ave",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001",
                "tax_id": "TAX-789012",
                "payment_terms": "Net 15"
            },
            {
                "name": "Home & Garden Supply",
                "contact_person": "Mike Wilson",
                "email": "mike@homeandgarden.com",
                "phone": "+1-555-0103",
                "address_line1": "789 Garden Blvd",
                "city": "Austin",
                "state": "TX",
                "postal_code": "73301",
                "tax_id": "TAX-345678",
                "payment_terms": "Net 30"
            }
        ]
        
        suppliers = []
        for supplier_data in suppliers_data:
            supplier = Supplier(**supplier_data)
            db.add(supplier)
            suppliers.append(supplier)
        
        db.flush()  # Get supplier IDs
        print(f"✅ Created {len(suppliers)} suppliers")
        
        # Create enhanced inventory items
        inventory_items_data = [
            {
                "name": "Wireless Headphones",
                "description": "High-quality bluetooth headphones with noise cancellation",
                "category": CategoryEnum.ELECTRONICS,
                "quantity": 25,
                "price": Decimal("99.99"),
                "cost_price": Decimal("45.00"),
                "sku": "WH-001",
                "barcode": "1234567890123",
                "supplier_id": suppliers[0].id,
                "min_stock_level": 10,
                "max_stock_level": 100,
                "location": "A1-B2"
            },
            {
                "name": "Cotton T-Shirt",
                "description": "Comfortable 100% cotton t-shirt in various colors",
                "category": CategoryEnum.CLOTHING,
                "quantity": 50,
                "price": Decimal("19.99"),
                "cost_price": Decimal("8.50"),
                "sku": "TS-002",
                "barcode": "1234567890124",
                "supplier_id": suppliers[1].id,
                "min_stock_level": 20,
                "max_stock_level": 200,
                "location": "B1-C3"
            },
            {
                "name": "Python Programming Book",
                "description": "Comprehensive guide to Python programming for beginners",
                "category": CategoryEnum.BOOKS,
                "quantity": 15,
                "price": Decimal("29.99"),
                "cost_price": Decimal("15.00"),
                "sku": "PB-003",
                "barcode": "1234567890125",
                "supplier_id": None,
                "min_stock_level": 5,
                "max_stock_level": 50,
                "location": "C1-D1"
            },
            {
                "name": "Coffee Mug",
                "description": "Ceramic coffee mug with inspirational quotes",
                "category": CategoryEnum.HOME,
                "quantity": 30,
                "price": Decimal("12.99"),
                "cost_price": Decimal("5.50"),
                "sku": "CM-004",
                "barcode": "1234567890126",
                "supplier_id": suppliers[2].id,
                "min_stock_level": 15,
                "max_stock_level": 100,
                "location": "D1-E2"
            },
            {
                "name": "Smartphone Case",
                "description": "Protective case for latest smartphone models",
                "category": CategoryEnum.ELECTRONICS,
                "quantity": 75,
                "price": Decimal("24.99"),
                "cost_price": Decimal("10.00"),
                "sku": "SC-005",
                "barcode": "1234567890127",
                "supplier_id": suppliers[0].id,
                "min_stock_level": 25,
                "max_stock_level": 150,
                "location": "A2-B1"
            },
            {
                "name": "Desk Lamp",
                "description": "LED desk lamp with adjustable brightness",
                "category": CategoryEnum.HOME,
                "quantity": 20,
                "price": Decimal("39.99"),
                "cost_price": Decimal("18.00"),
                "sku": "DL-006",
                "barcode": "1234567890128",
                "supplier_id": suppliers[2].id,
                "min_stock_level": 8,
                "max_stock_level": 50,
                "location": "E1-F1"
            },
            {
                "name": "Running Shoes",
                "description": "Lightweight running shoes for athletes",
                "category": CategoryEnum.CLOTHING,
                "quantity": 35,
                "price": Decimal("79.99"),
                "cost_price": Decimal("35.00"),
                "sku": "RS-007",
                "barcode": "1234567890129",
                "supplier_id": suppliers[1].id,
                "min_stock_level": 15,
                "max_stock_level": 80,
                "location": "B2-C1"
            },
            {
                "name": "Notebook",
                "description": "High-quality notebook for writing and sketching",
                "category": CategoryEnum.OTHER,
                "quantity": 100,
                "price": Decimal("8.99"),
                "cost_price": Decimal("3.50"),
                "sku": "NB-008",
                "barcode": "1234567890130",
                "supplier_id": None,
                "min_stock_level": 50,
                "max_stock_level": 300,
                "location": "F1-G1"
            }
        ]
        
        inventory_items = []
        for item_data in inventory_items_data:
            item = InventoryItem(**item_data)
            db.add(item)
            inventory_items.append(item)
        
        db.flush()  # Get item IDs
        print(f"✅ Created {len(inventory_items)} inventory items")
        
        # Create customers
        customers_data = [
            {
                "first_name": "Alice",
                "last_name": "Cooper",
                "email": "alice.cooper@email.com",
                "phone": "+1-555-1001",
                "address_line1": "123 Main Street",
                "city": "Los Angeles",
                "state": "CA",
                "postal_code": "90210"
            },
            {
                "first_name": "Bob",
                "last_name": "Smith",
                "email": "bob.smith@email.com",
                "phone": "+1-555-1002",
                "address_line1": "456 Oak Avenue",
                "city": "Chicago",
                "state": "IL",
                "postal_code": "60601"
            },
            {
                "first_name": "Carol",
                "last_name": "Johnson",
                "email": "carol.johnson@email.com",
                "phone": "+1-555-1003",
                "address_line1": "789 Pine Road",
                "city": "Miami",
                "state": "FL",
                "postal_code": "33101"
            },
            {
                "first_name": "David",
                "last_name": "Brown",
                "email": "david.brown@email.com",
                "phone": "+1-555-1004",
                "address_line1": "321 Elm Street",
                "city": "Seattle",
                "state": "WA",
                "postal_code": "98101"
            },
            {
                "first_name": "Emma",
                "last_name": "Davis",
                "email": "emma.davis@email.com",
                "phone": "+1-555-1005",
                "address_line1": "654 Maple Drive",
                "city": "Denver",
                "state": "CO",
                "postal_code": "80201"
            }
        ]
        
        customers = []
        for customer_data in customers_data:
            customer = Customer(**customer_data)
            db.add(customer)
            customers.append(customer)
        
        db.flush()  # Get customer IDs
        print(f"✅ Created {len(customers)} customers")
        
        # Create sample orders
        orders_data = [
            {
                "customer_id": customers[0].id,
                "status": OrderStatusEnum.DELIVERED,
                "order_date": datetime.now() - timedelta(days=10),
                "shipped_date": datetime.now() - timedelta(days=8),
                "shipping_address_line1": "123 Main Street",
                "shipping_city": "Los Angeles",
                "shipping_state": "CA",
                "shipping_postal_code": "90210",
                "notes": "Rush delivery requested",
                "items": [
                    {"inventory_item_id": inventory_items[0].id, "quantity": 2, "unit_price": Decimal("99.99")},
                    {"inventory_item_id": inventory_items[1].id, "quantity": 1, "unit_price": Decimal("19.99")}
                ]
            },
            {
                "customer_id": customers[1].id,
                "status": OrderStatusEnum.PROCESSING,
                "order_date": datetime.now() - timedelta(days=5),
                "shipping_address_line1": "456 Oak Avenue",
                "shipping_city": "Chicago",
                "shipping_state": "IL",
                "shipping_postal_code": "60601",
                "items": [
                    {"inventory_item_id": inventory_items[4].id, "quantity": 1, "unit_price": Decimal("24.99")},
                    {"inventory_item_id": inventory_items[3].id, "quantity": 3, "unit_price": Decimal("12.99")}
                ]
            },
            {
                "customer_id": customers[2].id,
                "status": OrderStatusEnum.PENDING,
                "order_date": datetime.now() - timedelta(days=2),
                "shipping_address_line1": "789 Pine Road",
                "shipping_city": "Miami",
                "shipping_state": "FL",
                "shipping_postal_code": "33101",
                "items": [
                    {"inventory_item_id": inventory_items[6].id, "quantity": 1, "unit_price": Decimal("79.99")},
                    {"inventory_item_id": inventory_items[7].id, "quantity": 5, "unit_price": Decimal("8.99")}
                ]
            }
        ]
        
        orders = []
        for order_data in orders_data:
            items_data = order_data.pop("items")
            
            # Generate order number
            today = order_data["order_date"].strftime("%Y%m%d")
            order_count = len(orders) + 1
            order_number = f"ORD-{today}-{order_count:04d}"
            
            # Calculate totals
            subtotal = sum(item["quantity"] * item["unit_price"] for item in items_data)
            tax_amount = subtotal * Decimal("0.08")  # 8% tax
            shipping_cost = Decimal("9.99") if subtotal < 100 else Decimal("0.00")
            total_amount = subtotal + tax_amount + shipping_cost
            
            order = Order(
                **order_data,
                order_number=order_number,
                subtotal=subtotal,
                tax_amount=tax_amount,
                shipping_cost=shipping_cost,
                total_amount=total_amount
            )
            db.add(order)
            db.flush()  # Get order ID
            
            # Create order items
            for item_data in items_data:
                order_item = OrderItem(
                    order_id=order.id,
                    inventory_item_id=item_data["inventory_item_id"],
                    quantity=item_data["quantity"],
                    unit_price=item_data["unit_price"],
                    total_price=item_data["quantity"] * item_data["unit_price"]
                )
                db.add(order_item)
                
                # Create stock movement for delivered orders
                if order.status == OrderStatusEnum.DELIVERED:
                    inventory_item = next(item for item in inventory_items if item.id == item_data["inventory_item_id"])
                    movement = StockMovement(
                        inventory_item_id=item_data["inventory_item_id"],
                        movement_type=StockMovementTypeEnum.OUT,
                        quantity=-item_data["quantity"],
                        previous_quantity=inventory_item.quantity + item_data["quantity"],
                        new_quantity=inventory_item.quantity,
                        reference_type="order",
                        reference_id=order.id,
                        notes=f"Sold via order {order_number}"
                    )
                    db.add(movement)
            
            orders.append(order)
        
        print(f"✅ Created {len(orders)} sample orders")
        
        # Create some additional stock movements
        stock_movements_data = [
            {
                "inventory_item_id": inventory_items[2].id,
                "movement_type": StockMovementTypeEnum.IN,
                "quantity": 10,
                "previous_quantity": 5,
                "new_quantity": 15,
                "reference_type": "purchase",
                "notes": "Restocking from supplier",
                "created_by": "admin"
            },
            {
                "inventory_item_id": inventory_items[5].id,
                "movement_type": StockMovementTypeEnum.ADJUSTMENT,
                "quantity": -2,
                "previous_quantity": 22,
                "new_quantity": 20,
                "reference_type": "adjustment",
                "notes": "Inventory adjustment - damaged items",
                "created_by": "admin"
            }
        ]
        
        for movement_data in stock_movements_data:
            movement = StockMovement(**movement_data)
            db.add(movement)
        
        print(f"✅ Created {len(stock_movements_data)} stock movements")
        
        db.commit()
        print("🎉 Extended database initialization completed!")
        
        # Print summary
        print("\n📊 Database Summary:")
        print(f"   • Suppliers: {len(suppliers)}")
        print(f"   • Customers: {len(customers)}")
        print(f"   • Inventory Items: {len(inventory_items)}")
        print(f"   • Orders: {len(orders)}")
        print(f"   • Stock Movements: {len(stock_movements_data) + sum(len(o['items']) for o in orders_data if orders[orders_data.index(o)].status == OrderStatusEnum.DELIVERED)}")
        
        print("\n🔗 API Endpoints Available:")
        print("   • Customers: http://localhost:8000/api/customers")
        print("   • Suppliers: http://localhost:8000/api/suppliers")
        print("   • Orders: http://localhost:8000/api/orders")
        print("   • Stock Movements: http://localhost:8000/api/stock/movements")
        print("   • Stock Levels: http://localhost:8000/api/stock/levels")
        print("   • Reports: http://localhost:8000/api/reports/*")
        print("   • Dashboard: http://localhost:8000/api/dashboard/summary")
        print("   • API Docs: http://localhost:8000/docs")
        
    except Exception as e:
        db.rollback()
        print(f"❌ An error occurred: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_extended_database()
