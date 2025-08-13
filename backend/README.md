# FastAPI Inventory Management Backend

A modern REST API for inventory management built with FastAPI, SQLAlchemy, and SQLite.

## 🚀 Features

- **Full CRUD Operations**: Create, read, update, and delete inventory items
- **Advanced Filtering**: Search by name, SKU, or description
- **Category Management**: Filter items by category
- **Pagination**: Efficient pagination for large datasets
- **Data Validation**: Comprehensive input validation with Pydantic
- **SQLite Database**: Lightweight database with SQLAlchemy ORM
- **Auto Documentation**: Interactive API docs with Swagger UI
- **CORS Support**: Ready for React frontend integration
- **Error Handling**: Comprehensive error handling and validation

## 📋 Requirements

- Python 3.8+
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn

## 🛠️ Installation

1. **Create a virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Initialize the database**:
```bash
python init_db.py
```

4. **Run the server**:
```bash
python main.py
# Or with uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛣️ API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Inventory Management
- `GET /api/inventory` - Get inventory items (with pagination and filtering)
- `GET /api/inventory/{id}` - Get specific inventory item
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item

### Categories
- `GET /api/categories` - Get all available categories

### Utilities
- `GET /api/inventory/low-stock` - Get low stock items

## 📊 Data Model

### Inventory Item
```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "High-quality bluetooth headphones",
  "category": "electronics",
  "quantity": 25,
  "price": 99.99,
  "sku": "WH-001",
  "created_at": "2023-01-01T12:00:00Z",
  "updated_at": "2023-01-01T12:00:00Z"
}
```

### Categories
- `electronics`
- `clothing`
- `books`
- `home`
- `other`

## 🔍 Query Parameters

### GET /api/inventory
- `page`: Page number (default: 1)
- `size`: Items per page (default: 50, max: 100)
- `search`: Search in name, SKU, or description
- `category`: Filter by category

Example:
```
GET /api/inventory?page=1&size=20&search=headphones&category=electronics
```

## 📝 Sample Requests

### Create Item
```bash
curl -X POST "http://localhost:8000/api/inventory" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Wireless Mouse",
       "description": "Ergonomic wireless mouse",
       "category": "electronics",
       "quantity": 50,
       "price": 29.99,
       "sku": "WM-001"
     }'
```

### Update Item
```bash
curl -X PUT "http://localhost:8000/api/inventory/1" \
     -H "Content-Type: application/json" \
     -d '{
       "quantity": 30,
       "price": 89.99
     }'
```

### Search Items
```bash
curl "http://localhost:8000/api/inventory?search=wireless&category=electronics"
```

## 🗄️ Database

The application uses SQLite with the following schema:

```sql
CREATE TABLE inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

Configuration is handled in `config.py`:

- `DATABASE_URL`: SQLite database path
- `API_HOST`: Server host (default: 0.0.0.0)
- `API_PORT`: Server port (default: 8000)
- `DEBUG`: Debug mode toggle
- `CORS_ORIGINS`: Allowed CORS origins for frontend

## 🧪 Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Get all items
curl http://localhost:8000/api/inventory

# Get categories
curl http://localhost:8000/api/categories
```

## 🔄 Integration with React Frontend

The API is configured to work with the React frontend running on:
- http://localhost:3000
- http://localhost:3040
- http://localhost:3001

Update the `cors_origins` in `config.py` to match your frontend URL.

## 📁 Project Structure

```
backend/
├── main.py           # FastAPI application
├── config.py         # Configuration settings
├── database.py       # Database setup and session management
├── models.py         # SQLAlchemy models
├── schemas.py        # Pydantic schemas
├── crud.py           # CRUD operations
├── init_db.py        # Database initialization script
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

## 🚨 Error Handling

The API provides detailed error responses:

```json
{
  "detail": "Item with SKU 'WH-001' already exists",
  "error_code": "VALIDATION_ERROR"
}
```

## 🎯 Next Steps

- Add authentication and authorization
- Implement role-based access control
- Add inventory audit logging
- Implement real-time notifications
- Add bulk operations
- Implement data export functionality
