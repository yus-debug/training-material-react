// apps/web/app/customers/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {Container,Typography,Button,TextField,Box,Snackbar,Pagination,} from '@mui/material';
import Alert from '@mui/material/Alert';           
import type { AlertColor } from '@mui/material/Alert';
import { Add, Download } from '@mui/icons-material';
import { CustomerTable } from '../../components/CustomerTable';
import { CustomerForm } from '../../components/CustomerForm';
import { useCustomers, type SortBy, type SortDir } from '../../hooks/useCustomers';
import { useDebounce } from '../../hooks/useDebounce';

export default function CustomersPage() {
  const {
    customers, loading, error, total,
    fetchCustomers, createCustomer, updateCustomer, deleteCustomer
  } = useCustomers();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // sorting
  const [orderBy, setOrderBy] = useState<SortBy>('name');
  const [order, setOrder] = useState<SortDir>('asc');

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCustomers({
      page,
      size: pageSize,
      search: debouncedSearchTerm,
      sort_by: orderBy,
      sort_dir: order,
    });
    //react-hooks/exhaustive-deps
  }, [page, debouncedSearchTerm, orderBy, order]);

  const handleCreateCustomer = async (data: any) => {
    try {
      await createCustomer(data);
      showNotification('Customer created successfully', 'success');
      setFormOpen(false);
      fetchCustomers({ page, size: pageSize, search: debouncedSearchTerm, sort_by: orderBy, sort_dir: order });
    } catch {
      showNotification('Failed to create customer', 'error');
    }
  };

  const handleEditCustomer = async (data: any) => {
    if (!editingCustomer) return;
    try {
      await updateCustomer(editingCustomer.id, data);
      showNotification('Customer updated successfully', 'success');
      setEditingCustomer(null);
    } catch {
      showNotification('Failed to update customer', 'error');
    }
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.full_name}?`)) return;
    try {
      await deleteCustomer(customer.id);
      showNotification('Customer deleted successfully', 'success');
    } catch {
      showNotification('Failed to delete customer', 'error');
    }
  };

  const handleRequestSort = (property: SortBy) => {
    if (orderBy === property) {
      setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(property);
      setOrder('asc');
    }
  };

  const showNotification = (message: string, severity: AlertColor) => {
    setNotification({ open: true, message, severity });
  };

  const exportToCSV = () => {
    const header = 'Name,Email,Phone,City\n';
    const rows = customers.map(c =>
      `${c.full_name || `${c.first_name} ${c.last_name}`},${c.email},${c.phone || ''},${c.city || ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
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
          <Button startIcon={<Download />} onClick={exportToCSV} disabled={customers.length === 0}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CustomerTable
        customers={customers}
        onEdit={setEditingCustomer}
        onDelete={handleDeleteCustomer}
        onView={(customer) => console.log('View customer:', customer)}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
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
        initialData={editingCustomer ?? undefined}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        loading={loading}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(s => ({ ...s, open: false }))}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Container>
  );
}
