// apps/web/app/inventory-list/page.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Box, Pagination, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '../../components/SearchBar';
import { InventoryList } from '../../components/InventoryList';
import { useDebounce } from '../../hooks/useDebounce';

//Smooth Load
function useSmoothSpinner(loading: boolean, showDelay = 150, minVisible = 250) {
  const [show, setShow] = useState(false);
  const sinceRef = useRef<number | null>(null);
  
  useEffect(() => {
    let showT: any, hideT: any;
    if (loading) {
      showT = setTimeout(() => { sinceRef.current = performance.now(); setShow(true); }, showDelay);
    } else {
      const elapsed = sinceRef.current != null ? performance.now() - sinceRef.current : 0;
      hideT = setTimeout(() => { sinceRef.current = null; setShow(false); }, Math.max(0, minVisible - elapsed));
    }
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  }, [loading, showDelay, minVisible]);
  return show;
}

// ctrl+K focus
function useHotkeyFocus(ref: React.RefObject<HTMLInputElement>, key = 'k') {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase?.() === key) {
        e.preventDefault(); ref.current?.focus(); ref.current?.select?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ref, key]);
}


type SortBy = 'name' | 'price' | 'quantity';
type SortDir = 'asc' | 'desc';

type InventoryItem = {
  id: string | number;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
};

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'other', label: 'Other' },
];

const LIMIT = 5;
const PREFS_KEY = 'inventorySearchPrefs_v1';
const HISTORY_KEY = 'inventorySearchHistory_v1';
const HISTORY_MAX = 10;

function InventoryListPageView() {
  // UI state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  // delay 1200
  const searchParams = useSearchParams();
  const debugDelay = searchParams.get('delay') ?? '';

  // debounce typing
  const debounced = useDebounce(searchTerm, 300);

  // loading + smoothed spinner
  const [loading, setLoading] = useState(false);
  const showSpinner = useSmoothSpinner(loading, 150, 250);

  // cancel in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  // load prefs & history once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<{searchTerm:string;category:string;sortBy:SortBy;sortDir:SortDir;page:number;}>;
        if (p.searchTerm) setSearchTerm(p.searchTerm);
        if (p.category)   setCategory(p.category);
        if (p.sortBy)     setSortBy(p.sortBy);
        if (p.sortDir)    setSortDir(p.sortDir);
        if (p.page && p.page > 0) setPage(p.page);
      }
    } catch {}
    try {
      const rawH = localStorage.getItem(HISTORY_KEY);
      if (rawH) {
        const arr = JSON.parse(rawH) as string[];
        if (Array.isArray(arr)) setHistory(arr.slice(0, HISTORY_MAX));
      }
    } catch {}
  }, []);

  // persist prefs
  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ searchTerm, category, sortBy, sortDir, page })); } catch {}
  }, [searchTerm, category, sortBy, sortDir, page]);

  // reset page 
  useEffect(() => { setPage(1); }, [debounced, category, sortBy, sortDir]);

  // build query string
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (debounced) p.set('search', debounced);
    if (category !== 'all') p.set('category', category);
    p.set('sortBy', sortBy);
    p.set('sortDir', sortDir);
    p.set('page', String(page));
    p.set('limit', String(LIMIT));
    if (debugDelay) p.set('delay', debugDelay);
    return p.toString();
  }, [debounced, category, sortBy, sortDir, page, debugDelay]);

  // fetch whenever query changes
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      setLoading(true);
      try {
        setError(null);
        const res = await fetch(`/api/inventory?${query}`, { cache: 'no-store', signal: ctrl.signal });
        if (!res.ok) throw new Error(`Failed to fetch inventory items (status ${res.status})`);
        const data = await res.json();
        if (ctrl.signal.aborted) return;

        const arr: InventoryItem[] = Array.isArray(data) ? data : (data.items ?? []);
        setItems(arr);
        setFilteredTotal(data.total ?? arr.length);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setItems([]); setFilteredTotal(0);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filteredTotal / LIMIT));

  // Cmd/Ctrl+K focuses search
  const searchRef = useRef<HTMLInputElement | null>(null);
  useHotkeyFocus(searchRef, 'k');

  // search history commit
  const commitSearch = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setHistory(prev => {
      const next = [v, ...prev.filter(x => x.toLowerCase() !== v.toLowerCase())].slice(0, HISTORY_MAX);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // clear filters
  const clearFilters = () => {
    setSearchTerm(''); setCategory('all'); setSortBy('name'); setSortDir('asc'); setPage(1);
    try { localStorage.removeItem(PREFS_KEY); } catch {}
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} aria-busy={showSpinner}>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory Search
      </Typography>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortByChange={setSortBy as any}
        onSortDirChange={setSortDir as any}
        onClear={clearFilters}
        history={history}
        onCommit={commitSearch}
        searchInputRef={searchRef}/>

      <Typography variant="body2" sx={{ mb: 1 }}>Page <b>{page}</b> of <b>{pageCount}</b> — {filteredTotal} result{filteredTotal === 1 ? '' : 's'}
        {debounced ? <> for "<b>{debounced}</b>"</> : null}
      </Typography>

      {typeof window !== 'undefined' && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Tip: Cmd/Ctrl+K focuses search{debugDelay ? ` • Debug delay: ${debugDelay}ms` : ''}
        </Typography>
      )}

      <InventoryList items={items} loading={showSpinner} error={error} searchTerm={debounced} />

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            color="primary"
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}/>
        </Box>
      )}
    </Container>
  );
}

export default dynamic(() => Promise.resolve(InventoryListPageView), { ssr: false });
