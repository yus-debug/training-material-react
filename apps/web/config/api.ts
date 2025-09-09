// Use FastAPI backend URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export const API_ENDPOINTS = {
  fetchInventory:`${API_BASE_URL}/api/inventory`,
  fetchCustomers:`${API_BASE_URL}/api/customers`,
  fetchOrder:`${API_BASE_URL}/api/orders?page=1&size=50&status=pending`,
  fetchLowStock:`${API_BASE_URL}/api/inventory/low-stock?threshold=20`,
  categories: `${API_BASE_URL}/api/categories`,
  health: `${API_BASE_URL}/health`,
} as const