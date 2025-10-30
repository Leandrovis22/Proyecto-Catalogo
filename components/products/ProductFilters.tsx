'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ProductFiltersProps {
  categories: string[];
  onFilterChange: (filters: {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

export default function ProductFilters({ categories, onFilterChange }: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleApplyFilters = () => {
    onFilterChange({ search, category, minPrice, maxPrice });
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({ search: '', category: '', minPrice: '', maxPrice: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="flex-1"
        />
        <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? <X size={16} /> : <Filter size={16} />}
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Precio mínimo"
            />
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Precio máximo"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="success" onClick={handleApplyFilters}>
              Aplicar filtros
            </Button>
            <Button variant="danger" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}