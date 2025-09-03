// apps/web/app/products/page.tsx
'use client';

import * as React from 'react';
import {Container, Box, Typography, Button,Table, TableHead, TableRow, TableCell, TableBody,Dialog, DialogTitle, DialogContent, DialogActions,TextField, IconButton, Alert, Snackbar,MenuItem} from '@mui/material';
import type { AlertColor } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';


type Product = {
  id: number;
  name: string;
  sku: string;
  category: 'electronics' | 'clothing' | 'books' | 'home' | 'other';
  description?: string | null;
  price: number;
  quantity: number;
};

const CATEGORIES = ['electronics', 'clothing', 'books', 'home', 'other'] as const;

const API = {
  list: 'http://localhost:8000/api/inventory',
  one: (id: number | string) => `http://localhost:8000/api/inventory/${id}`,
};

export default function ProductsPage() {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // snackbar
  const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const toast = (message: string, severity: AlertColor = 'success') =>
    setSnack({ open: true, message, severity });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [category, setCategory] = React.useState<Product['category']>('other');
  const [price, setPrice] = React.useState<string>('0');
  const [quantity, setQuantity] = React.useState<string>('0');
  const [description, setDescription] = React.useState('');

  // load products
  const load = async () => {
    try {
      setError(null);
      const res = await fetch(API.list);
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const data = await res.json();
      setRows(data.items ?? data ?? []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load products');
      toast('Failed to load products', 'error');
    }
  };
  
  React.useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setName(''); setSku(''); setCategory('other'); setPrice('0'); setQuantity('0'); setDescription('');
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name); setSku(p.sku);
    setCategory(p.category ?? 'other');
    setPrice(String(p.price ?? 0));
    setQuantity(String(p.quantity ?? 0));
    setDescription(p.description ?? '');
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const bodyFromForm = () => ({
    name: name.trim(),
    sku: sku.trim(),
    category,
    description: description.trim() || null,
    price: Number(price) || 0,
    quantity: Number(quantity) || 0,
  });

  const save = async () => {
    try {
      setError(null);
      const body = bodyFromForm();

      if (editing) {
        const res = await fetch(API.one(editing.id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
        const updated = await res.json();
        setRows(prev => prev.map(r => (r.id === editing.id ? updated : r)));
        toast('Product updated', 'success');
      } else {
        const res = await fetch(API.list, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Create failed (${res.status})`);
        const created = await res.json();
        setRows(prev => [created, ...prev]);
        toast('Product created', 'success');
      }
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Save failed');
      toast('Save failed', 'error');
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      setError(null);
      const res = await fetch(API.one(p.id), { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setRows(prev => prev.filter(r => r.id !== p.id));
      toast('Product deleted', 'success');
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
      toast('Delete failed', 'error');
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          New Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.sku}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell align="right">${Number(p.price).toFixed(2)}</TableCell>
              <TableCell align="right">{p.quantity}</TableCell>
              <TableCell align="center">
                <IconButton size="small" onClick={() => openEdit(p)}><Edit /></IconButton>
                <IconButton size="small" color="error" onClick={() => remove(p)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={6} align="center">No products</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 1 }}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} fullWidth />
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Product['category'])}
              fullWidth
            >
              {CATEGORIES.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
              inputProps={{ step: '0.01' }}
            />
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
              inputProps={{ step: '1', min: 0 }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: '1 / -1' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={save} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ boxShadow: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
