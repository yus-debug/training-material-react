/**
 * API configuration for the application
 */

// Use FastAPI backend URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  inventory: `${API_BASE_URL}/api/inventory`,
  categories: `${API_BASE_URL}/api/categories`,
  health: `${API_BASE_URL}/health`,
} as const
