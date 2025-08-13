# Inventory Management API - Postman Collection

This folder contains comprehensive Postman collections to test every API endpoint in the Inventory Management system.

## 📁 Files

- **`Inventory_Management_API.postman_collection.json`** - Complete API collection with 41 requests
- **`Inventory_Management_API.postman_environment.json`** - Environment variables for local development
- **`README.md`** - This documentation file

## 🚀 Quick Start

### 1. Import into Postman
1. Open Postman
2. Click **Import** → **Choose Files**
3. Select both `.json` files from this folder
4. Click **Import**

### 2. Set Environment
1. In Postman, click the environment dropdown (top right)
2. Select **"Inventory Management - Local Development"**
3. Ensure the backend server is running on `http://localhost:8000`

### 3. Run Tests
- **Individual requests**: Click any request and hit **Send**
- **Full collection**: Click collection → **Run collection**
- **Folder by folder**: Expand folders and run specific API groups

## 📋 Collection Structure

### 🏥 Health & System (2 requests)
- Health Check
- API Documentation Access

### 📦 Inventory Management (8 requests)
- Get All Items (with pagination & search)
- Search Items by name/SKU/category
- Get Single Item by ID
- Create New Item
- Update Existing Item
- Delete Item
- Get Categories List
- Get Low Stock Items

### 👥 Customer Management (6 requests)
- Get All Customers (with search & filtering)
- Search Customers by name/email
- Get Single Customer
- Create New Customer
- Update Customer
- Delete Customer (soft delete if has orders)

### 🏭 Supplier Management (6 requests)
- Get All Suppliers (with search & filtering)
- Search Suppliers
- Get Single Supplier
- Create New Supplier
- Update Supplier
- Delete Supplier (soft delete if has items)

### 📋 Order Management (6 requests)
- Get All Orders (with filtering by status/customer)
- Filter Orders by Status/Customer
- Get Single Order (with items)
- Create New Order (automatically updates inventory)
- Update Order Status
- Cancel Order (restores inventory)

### 📊 Stock Management (5 requests)
- Get All Stock Movements (with filtering)
- Filter Stock Movements by item/type
- Create Manual Stock Adjustment
- Get Current Stock Levels
- Get Low Stock Items Only

### 📈 Reports & Analytics (4 requests)
- Get Inventory Valuation Report
- Get Sales Summary (all time)
- Get Sales Summary by Date Range
- Get Dashboard Summary (KPIs & alerts)

### 🧪 Test Scenarios (4 requests)
- Complete Order Flow Test
- Bulk Stock Adjustment Test
- Error Handling - Invalid Customer
- Error Handling - Insufficient Stock

## 🔧 Environment Variables

The environment includes these pre-configured variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:8000` | API base URL |
| `customerId` | `1` | Sample customer ID for testing |
| `supplierId` | `1` | Sample supplier ID for testing |
| `orderId` | `1` | Sample order ID for testing |
| `inventoryItemId` | `1` | Sample inventory item ID for testing |

**Note**: Variables are automatically updated when you create new records through the API.

## ✅ Automated Tests

Each request includes automated tests that verify:
- ✅ Response status codes (200, 201, 204)
- ✅ Response time < 2000ms
- ✅ Auto-extraction of IDs from creation responses
- ✅ JSON response validation

## 🎯 Sample Test Workflows

### Complete Order Processing Flow
1. **Get Customers** → Verify customer exists
2. **Get Inventory** → Check available stock
3. **Create Order** → Place order with items
4. **Get Stock Movements** → Verify inventory was updated
5. **Update Order Status** → Mark as processing/shipped
6. **Get Dashboard Summary** → View updated metrics

### Stock Management Flow
1. **Get Stock Levels** → Check current inventory
2. **Get Low Stock Items** → Identify items needing restock
3. **Create Stock Movement** → Manual adjustment
4. **Get Inventory Valuation** → Check updated values

### Error Handling Tests
1. **Invalid Customer Order** → Test error responses
2. **Insufficient Stock Order** → Test stock validation
3. **Non-existent Resource** → Test 404 handling

## 🚨 Prerequisites

Ensure the following before running tests:

1. **Backend Server Running**: `python main.py` in `/backend` directory
2. **Database Initialized**: Run `python init_extended_db.py` for sample data
3. **Virtual Environment Active**: `source venv/bin/activate`
4. **All Dependencies Installed**: `pip install -r requirements.txt`

## 📊 Expected Test Results

With the sample data, you should see:
- **8 Inventory Items** (various categories)
- **5 Customers** (with complete address info)
- **3 Suppliers** (with contact details)
- **3 Orders** (different statuses)
- **Multiple Stock Movements** (from order processing)

## 🐛 Troubleshooting

**Issue**: Empty responses from customer/supplier endpoints
**Solution**: Check if the extended routes are loaded properly in `main.py`

**Issue**: Database errors
**Solution**: Ensure database is initialized with `python init_extended_db.py`

**Issue**: Connection refused
**Solution**: Verify backend server is running on port 8000

## 📖 API Documentation

For detailed API documentation, visit: `http://localhost:8000/docs` (when server is running)

## 🔄 Updating the Collection

To add new endpoints or modify existing ones:
1. Make changes in Postman
2. Export the collection: **Collection → Export → Collection v2.1**
3. Replace the `.json` file in this folder
4. Update this README if needed

---

**Happy Testing! 🚀**

The collection covers every aspect of the inventory management system from basic CRUD operations to complex business workflows with automatic inventory updates.
