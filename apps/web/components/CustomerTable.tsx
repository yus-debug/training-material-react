// apps/web/components/CustomerTable.tsx
import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,IconButton, Menu, MenuItem, TableSortLabel, Chip} from '@mui/material';
import { MoreVert, Edit, Delete, Visibility } from '@mui/icons-material';
import type { SortBy, SortDir } from '../hooks/useCustomers';

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

  // NEW: sorting props
  orderBy: SortBy;
  order: SortDir;
  onRequestSort: (property: SortBy) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onEdit,
  onDelete,
  onView,
  orderBy,
  order,
  onRequestSort,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

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
    if (action === 'edit') onEdit(selectedCustomer);
    if (action === 'delete') onDelete(selectedCustomer);
    if (action === 'view') onView(selectedCustomer);
    handleMenuClose();
  };


  const sortedCustomers = React.useMemo(() => {
    const arr = [...customers];
    if (orderBy === 'name') {
      arr.sort((a, b) => {
        const an = (a.full_name || `${a.first_name} ${a.last_name}`).toLowerCase();
        const bn = (b.full_name || `${b.first_name} ${b.last_name}`).toLowerCase();
        return an.localeCompare(bn) * (order === 'asc' ? 1 : -1);
      });
    } else if (orderBy === 'created_at') {
      arr.sort((a, b) => {
        const ad = new Date(a.created_at).getTime();
        const bd = new Date(b.created_at).getTime();
        return (ad - bd) * (order === 'asc' ? 1 : -1);
      });
    }
    return arr;
  }, [customers, orderBy, order]);


  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={orderBy === 'name' ? order : false}>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => onRequestSort('name')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedCustomers.map((customer) => (
            <TableRow key={customer.id} hover>
              <TableCell>
                {customer.full_name || `${customer.first_name} ${customer.last_name}`}
              </TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone || '-'}</TableCell>
              <TableCell>{customer.city || '-'}</TableCell>
              <TableCell>
                <Chip label="Active" color="success" size="small" />
              </TableCell>
              <TableCell align="center">
                <IconButton onClick={(e) => handleMenuOpen(e, customer)} size="small">
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
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
