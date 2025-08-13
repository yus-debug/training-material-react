# Task 8: Implement Customer Management

**Difficulty: ⭐⭐⭐⭐ (Advanced)**  
**Time: 3-4 hours**  
**Prerequisites: Tasks 1-7 completed**

## 🎯 Learning Goals

- Master full CRUD operations in React
- Learn modal dialogs and form management
- Practice optimistic updates and error handling
- Understand table operations (sorting, filtering, pagination)
- Learn user feedback patterns (notifications, confirmations)

## 📋 Task Description

Create a complete customer management system with table view, add/edit/delete functionality, and advanced filtering.

## 🏗️ What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Management                       │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Search customers...] [+ Add Customer] [Export CSV]      │
├─────────────────────────────────────────────────────────────┤
│ Name ↑         │ Email              │ City     │ Orders │ │ │
├─────────────────────────────────────────────────────────────┤
│ Alice Cooper   │ alice@email.com    │ LA       │ 3      │●│ │
│ Bob Smith      │ bob@email.com      │ Chicago  │ 1      │●│ │
│ Carol Johnson  │ carol@email.com    │ Miami    │ 2      │●│ │
└─────────────────────────────────────────────────────────────┘
│ Showing 1-10 of 25 customers     [← 1 2 3 4 5 →]           │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files to Create/Modify

- `apps/web/app/customers/page.tsx` (new file)
- `apps/web/components/CustomerTable.tsx` (new file)
- `apps/web/components/CustomerForm.tsx` (new file)
- `apps/web/components/CustomerDialog.tsx` (new file)
- `apps/web/components/ConfirmDialog.tsx` (new file)
- `apps/web/hooks/useCustomers.ts` (new file)

## ✅ Requirements

- [ ] Display customers in sortable, filterable table
- [ ] Search functionality across name and email
- [ ] Add customer with form validation
- [ ] Edit customer with pre-filled form
- [ ] Delete customer with confirmation dialog
- [ ] Pagination for large customer lists
- [ ] Success/error notifications
- [ ] Export customer list to CSV
- [ ] View customer order history

## 💡 Hints & Guidance

### Step 1: Create Custom Hook for Customer Operations

```tsx
// apps/web/hooks/useCustomers.ts
import { useState, useEffect } from 'react';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  full_name: string;
  created_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async (params: {
    page?: number;
    size?: number;
    search?: string;
  } = {}) => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.size) searchParams.append('size', params.size.toString());
      if (params.search) searchParams.append('search', params.search);

      const response = await fetch(
        `http://localhost:8000/api/customers?${searchParams.toString()}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      setCustomers(data.items || data);
      setTotal(data.total || data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'full_name' | 'created_at'>) => {
    try {
      const response = await fetch('http://localhost:8000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) throw new Error('Failed to create customer');
      
      const newCustomer = await response.json();
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      throw err;
    }
  };

  const updateCustomer = async (id: number, customerData: Partial<Customer>) => {
    try {
      const response = await fetch(`http://localhost:8000/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) throw new Error('Failed to update customer');
      
      const updatedCustomer = await response.json();
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? updatedCustomer : customer
        )
      );
      return updatedCustomer;
    } catch (err) {
      throw err;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/customers/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete customer');
      
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    total,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
};
```

### Step 2: Create Customer Form Component

```tsx
// apps/web/components/CustomerForm.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('USA')
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  initialData?: Partial<CustomerFormData>;
  title: string;
  loading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
  loading = false
}) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address_line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA'
    }
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address_line1"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    error={!!errors.address_line1}
                    helperText={errors.address_line1?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="postal_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Postal Code"
                    fullWidth
                    error={!!errors.postal_code}
                    helperText={errors.postal_code?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
```

### Step 3: Create Customer Table Component

```tsx
// apps/web/components/CustomerTable.tsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  TableSortLabel,
  Chip
} from '@mui/material';
import { MoreVert, Edit, Delete, Visibility } from '@mui/icons-material';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  full_name: string;
  created_at: string;
}

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onView: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onEdit,
  onDelete,
  onView
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleAction = (action: 'edit' | 'delete' | 'view') => {
    if (!selectedCustomer) return;
    
    switch (action) {
      case 'edit':
        onEdit(selectedCustomer);
        break;
      case 'delete':
        onDelete(selectedCustomer);
        break;
      case 'view':
        onView(selectedCustomer);
        break;
    }
    handleMenuClose();
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel>Name</TableSortLabel>
            </TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} hover>
              <TableCell>
                {customer.full_name || `${customer.first_name} ${customer.last_name}`}
              </TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone || '-'}</TableCell>
              <TableCell>{customer.city || '-'}</TableCell>
              <TableCell>
                <Chip 
                  label="Active" 
                  color="success" 
                  size="small" 
                />
              </TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={(e) => handleMenuOpen(e, customer)}
                  size="small"
                >
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};
```

### Step 4: Create Main Customers Page

```tsx
// apps/web/app/customers/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  Snackbar,
  Pagination
} from '@mui/material';
import { Add, Download } from '@mui/icons-material';
import { CustomerTable } from '../../components/CustomerTable';
import { CustomerForm } from '../../components/CustomerForm';
import { useCustomers } from '../../hooks/useCustomers';
import { useDebounce } from '../../hooks/useDebounce';

export default function CustomersPage() {
  const {
    customers,
    loading,
    error,
    total,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    fetchCustomers({
      page,
      size: pageSize,
      search: debouncedSearchTerm
    });
  }, [page, debouncedSearchTerm]);

  const handleCreateCustomer = async (data: any) => {
    try {
      await createCustomer(data);
      showNotification('Customer created successfully', 'success');
      setFormOpen(false);
    } catch (error) {
      showNotification('Failed to create customer', 'error');
    }
  };

  const handleEditCustomer = async (data: any) => {
    if (!editingCustomer) return;
    
    try {
      await updateCustomer(editingCustomer.id, data);
      showNotification('Customer updated successfully', 'success');
      setEditingCustomer(null);
    } catch (error) {
      showNotification('Failed to update customer', 'error');
    }
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (window.confirm(`Are you sure you want to delete ${customer.full_name}?`)) {
      try {
        await deleteCustomer(customer.id);
        showNotification('Customer deleted successfully', 'success');
      } catch (error) {
        showNotification('Failed to delete customer', 'error');
      }
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const exportToCSV = () => {
    const csvContent = customers.map(customer => 
      `${customer.full_name},${customer.email},${customer.phone || ''},${customer.city || ''}`
    ).join('\n');
    
    const blob = new Blob([`Name,Email,Phone,City\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Customer Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<Download />}
            onClick={exportToCSV}
            disabled={customers.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomerTable
        customers={customers}
        onEdit={setEditingCustomer}
        onDelete={handleDeleteCustomer}
        onView={(customer) => console.log('View customer:', customer)}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>

      <CustomerForm
        open={formOpen || !!editingCustomer}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={editingCustomer ? handleEditCustomer : handleCreateCustomer}
        initialData={editingCustomer}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        loading={loading}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
```

## ✨ Bonus Challenges

- [ ] Add bulk actions (delete multiple customers)
- [ ] Implement advanced filtering (by city, date range)
- [ ] Add customer order history view
- [ ] Create customer import from CSV
- [ ] Add customer activity timeline
- [ ] Implement optimistic updates

## ✅ How to Test

1. Navigate to customers page
2. Add new customer with form validation
3. Edit existing customer
4. Delete customer with confirmation
5. Test search functionality
6. Test pagination
7. Export customer list to CSV

## 🎉 Completion Criteria

Your customer management is complete when:
- ✅ Table displays customers with proper formatting
- ✅ Add/Edit forms work with validation
- ✅ Delete confirmation prevents accidental deletions
- ✅ Search filters customers in real-time
- ✅ Pagination works for large datasets
- ✅ Success/error notifications provide feedback
- ✅ CSV export functionality works

---

**← Previous: [Task 7 - Charts & Visualization](./task-07-charts.md)**  
**Next Step: [Task 9 - Categories Management](./task-09-categories.md) →**
