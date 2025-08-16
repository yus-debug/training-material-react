'use client'

import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { InventoryForm, type InventoryFormData } from '@sample/ui'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import {
  fetchInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  setFilter,
  clearError,
  selectFilteredInventoryItems,
  selectInventoryLoading,
  selectInventoryError,
  selectInventoryFilter,
} from '../../store/slices/inventorySlice'

export default function InventoryPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectFilteredInventoryItems)
  const loading = useAppSelector(selectInventoryLoading)
  const error = useAppSelector(selectInventoryError)
  const filter = useAppSelector(selectInventoryFilter)

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  useEffect(() => {
    dispatch(fetchInventoryItems())
  }, [dispatch])

  const handleCreateItem = async (data: InventoryFormData) => {
    try {
      await dispatch(createInventoryItem(data)).unwrap()
      setFormOpen(false)
      setSnackbarMessage('Item created successfully')
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to create item:', err)
    }
  }

  const handleUpdateItem = async (data: InventoryFormData) => {
    if (!editingItem) return
    try {
      await dispatch(updateInventoryItem({ id: editingItem.id, data })).unwrap()
      setFormOpen(false)
      setEditingItem(null)
      setSnackbarMessage('Item updated successfully')
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to update item:', err)
    }
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return
    try {
      await dispatch(deleteInventoryItem(itemToDelete)).unwrap()
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
      setSnackbarMessage('Item deleted successfully')
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  const handleEdit = (id: string) => {
    const item = items.find(it => it.id === id)
    if (item) {
      setEditingItem(item)
      setFormOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'quantity', headerName: 'Quantity', type: 'number', width: 100 },
    {
      field: 'price',
      headerName: 'Price',
      type: 'number',
      width: 100,
      // Local typing so TS knows `value` is a number-like
      valueFormatter: (value: any) => `$${Number(value ?? 0).toFixed(2)}`,
      // If your DataGrid passes params object instead of raw value in your version,
      // use this instead:
      // valueFormatter: (params: any) => `$${Number(params?.value ?? 0).toFixed(2)}`,
    },
    { field: 'description', headerName: 'Description', width: 300 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: ({ id }) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(id as string)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(id as string)}
        />,
      ],
    },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Inventory Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingItem(null)
              setFormOpen(true)
            }}
          >
            Add Item
          </Button>
        </Stack>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Search"
                value={filter.search}
                onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
                placeholder="Search by name or SKU..."
                sx={{ minWidth: 300 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filter.category}
                  label="Category"
                  onChange={(e) => dispatch(setFilter({ category: e.target.value }))}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing</MenuItem>
                  <MenuItem value="books">Books</MenuItem>
                  <MenuItem value="home">Home &amp; Garden</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* DataGrid */}
        <Card>
          <DataGrid
            rows={items}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            sx={{ border: 0 }}
            disableRowSelectionOnClick
          />
        </Card>

        {/* Form Dialog */}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogContent>
            <InventoryForm
              initialData={editingItem}
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
              submitLabel={editingItem ? 'Update' : 'Create'}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this item? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteItem} color="error" variant="contained" disabled={loading}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />

        {error && (
          <Alert severity="error" onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}
      </Stack>
    </Container>
  )
}
