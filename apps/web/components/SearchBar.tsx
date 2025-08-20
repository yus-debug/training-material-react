import * as React from 'react';
import {
  Box, TextField, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, ToggleButton, ToggleButtonGroup, Button, Autocomplete,
} from '@mui/material';
import { Search as SearchIcon, ArrowUpward, ArrowDownward, Clear as ClearIcon } from '@mui/icons-material';

export type SortBy = 'name' | 'price' | 'quantity';
export type SortDir = 'asc' | 'desc';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;

  category: string;
  onCategoryChange: (value: string) => void;
  categories: { value: string; label: string }[];

  sortBy: SortBy;
  sortDir: SortDir;
  onSortByChange: (value: SortBy) => void;
  onSortDirChange: (value: SortDir) => void;

  onClear?: () => void;
  history?: string[];
  onCommit?: (value: string) => void;        
  searchInputRef?: React.Ref<HTMLInputElement>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  sortBy,
  sortDir,
  onSortByChange,
  onSortDirChange,
  onClear,
  history = [],
  onCommit,
  searchInputRef,
}) => {
  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onCommit?.((e.target as HTMLInputElement).value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* search with history */}
      <Autocomplete
        freeSolo
        options={history}
        inputValue={searchTerm}
        onInputChange={(_, v) => onSearchChange(v)}
        onChange={(_, v) => typeof v === 'string' && onCommit?.(v)}
        sx={{ flex: 1, minWidth: 280 }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search by name, SKU, or description..."
            onKeyDown={handleEnter}
            inputRef={searchInputRef}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Category</InputLabel>
        <Select value={category} label="Category" onChange={(e) => onCategoryChange(e.target.value as string)}>
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 160 }}>
        <InputLabel>Sort by</InputLabel>
        <Select value={sortBy} label="Sort by" onChange={(e) => onSortByChange(e.target.value as any)}>
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="price">Price</MenuItem>
          <MenuItem value="quantity">Quantity</MenuItem>
        </Select>
      </FormControl>

      <ToggleButtonGroup
        exclusive
        value={sortDir}
        onChange={(_, v) => v && onSortDirChange(v)}
        aria-label="sort direction"
        size="small"
      >
        <ToggleButton value="asc" aria-label="ascending" title="Ascending"><ArrowUpward fontSize="small" /></ToggleButton>
        <ToggleButton value="desc" aria-label="descending" title="Descending"><ArrowDownward fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>

      {onClear && (
        <Button variant="outlined" startIcon={<ClearIcon />} onClick={onClear}>
          Clear
        </Button>
      )}
    </Box>
  );
};

export default SearchBar;
