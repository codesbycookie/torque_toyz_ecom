'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApi } from '@/core/contexts/api.context';
import { useAuth } from '@/core/contexts/auth.context';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Search, ShoppingBag } from 'lucide-react';
import {
  WishlistSummaryHeader,
  WishlistControlsBar,
  WishlistBatchBar,
  WishlistGridCard,
  WishlistListCard,
  WishlistTableRow,
  WishlistEmptyState,
  WishlistSkeleton,
} from '@/modules/wishlist/wishlist.components';

export default function Wishlist() {
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const api = useApi();
  const { wishlist, cart } = api;

  // Reactive Wishlist Module
  const list = wishlist.list || [];
  const loading = wishlist.loading || {};

  // Filter & Layout Controls
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'table'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Selection & Batch Action State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isMovingAll, setIsMovingAll] = useState(false);
  const [addingProductIds, setAddingProductIds] = useState([]);

  // Fetch initial wishlist
  useEffect(() => {
    if (authenticated) {
      wishlist.fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  // Compute Categories available in Wishlist
  const categories = useMemo(() => {
    const cats = new Set();
    list.forEach((item) => {
      if (item.category?.name) {
        cats.add(item.category.name);
      }
    });
    return Array.from(cats);
  }, [list]);

  // Compute In-Stock count and Total Saved Value
  const { inStockCount, totalValue } = useMemo(() => {
    let inStock = 0;
    let total = 0;
    list.forEach((item) => {
      if (item.stock > 0) inStock += 1;
      total += Number(item.price || 0);
    });
    return { inStockCount: inStock, totalValue: total };
  }, [list]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...list];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category?.name === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'in_stock') {
      result = result.filter((p) => p.stock > 0);
    } else if (stockFilter === 'low_stock') {
      result = result.filter((p) => p.stock > 0 && p.stock <= 5);
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter((p) => p.stock <= 0);
    }

    // Sorting
    result.sort((a, b) => {
      const priceA = Number(a.price || 0);
      const priceB = Number(b.price || 0);

      switch (sortBy) {
        case 'price_low':
          return priceA - priceB;
        case 'price_high':
          return priceB - priceA;
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'rating_high': {
          const ratingA = a.reviews?.length
            ? a.reviews.reduce((s, r) => s + (r.rating || 0), 0) / a.reviews.length
            : 0;
          const ratingB = b.reviews?.length
            ? b.reviews.reduce((s, r) => s + (r.rating || 0), 0) / b.reviews.length
            : 0;
          return ratingB - ratingA;
        }
        case 'newest':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [list, search, categoryFilter, stockFilter, sortBy]);

  // Batch Selection Helpers
  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p._id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p._id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedProducts = useMemo(() => {
    return list.filter((p) => selectedIds.includes(p._id));
  }, [list, selectedIds]);

  const selectedTotalValue = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + Number(p.price || 0), 0);
  }, [selectedProducts]);

  // Single Actions
  const handleAddToCart = async (product) => {
    if (!authenticated) {
      toast.info("Please sign in to add items to your cart");
      navigate("/login");
      return;
    }

    if (product.stock <= 0) return;
    try {
      setAddingProductIds((prev) => [...prev, product._id]);
      await cart.addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error('Failed to add product to cart');
    } finally {
      setAddingProductIds((prev) => prev.filter((id) => id !== product._id));
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await wishlist.removeProduct(productId);
      setSelectedIds((prev) => prev.filter((id) => id !== productId));
    } catch {
      // Handled in module
    }
  };

  // Batch Operations
  const handleMoveSelectedToCart = async () => {
    if (!authenticated) {
      toast.info("Please sign in to add items to your cart");
      navigate("/login");
      return;
    }

    const inStockSelected = selectedProducts.filter((p) => p.stock > 0);

    if (inStockSelected.length === 0) {
      toast.error('None of the selected items are currently in stock');
      return;
    }

    try {
      setIsBatchProcessing(true);
      for (const prod of inStockSelected) {
        await cart.addToCart(prod);
        await wishlist.removeProduct(prod._id);
      }
      setSelectedIds([]);
      toast.success(
        `Moved ${inStockSelected.length} ${
          inStockSelected.length === 1 ? 'item' : 'items'
        } to cart!`
      );
    } catch {
      toast.error('Failed to move some items to cart');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsBatchProcessing(true);
      for (const id of selectedIds) {
        await wishlist.removeProduct(id);
      }
      setSelectedIds([]);
      toast.success('Removed selected items from wishlist');
    } catch {
      toast.error('Failed to remove selected items');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleMoveAllInStockToCart = async () => {
    if (!authenticated) {
      toast.info("Please sign in to add items to your cart");
      navigate("/login");
      return;
    }

    const inStockItems = list.filter((p) => p.stock > 0);
    if (inStockItems.length === 0) {
      toast.error('No in-stock items available to move');
      return;
    }

    try {
      setIsMovingAll(true);
      for (const prod of inStockItems) {
        await cart.addToCart(prod);
        await wishlist.removeProduct(prod._id);
      }
      setSelectedIds([]);
      toast.success(`Moved all ${inStockItems.length} in-stock items to cart!`);
    } catch {
      toast.error('Failed to move items to cart');
    } finally {
      setIsMovingAll(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      await wishlist.clear();
      setSelectedIds([]);
    } finally {
      setIsClearing(false);
    }
  };

  const isInitialLoading = loading?.global && list.length === 0;

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[85vh] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">Wishlist</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            You haven't signed in yet. Please log in to view your wishlist.
          </p>
          <Button onClick={() => navigate("/login")}>Log in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh]">
      {/* Header Banner */}
      <WishlistSummaryHeader
        totalCount={list.length}
        inStockCount={inStockCount}
        totalValue={totalValue}
        selectedCount={selectedIds.length}
        onMoveAllInStockToCart={handleMoveAllInStockToCart}
        isMovingAll={isMovingAll}
        onClearAll={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-xs font-medium"
                disabled={isClearing || list.length === 0}
              >
                <Trash2 className="size-3.5" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your entire wishlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will remove all {list.length} saved products from your wishlist. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear Wishlist
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      {/* Main Content Area */}
      {isInitialLoading ? (
        <WishlistSkeleton viewMode={viewMode} />
      ) : list.length === 0 ? (
        <WishlistEmptyState />
      ) : (
        <>
          {/* Filter, View Switcher & Controls */}
          <WishlistControlsBar
            search={search}
            onSearchChange={setSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={categories}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            allSelected={allFilteredSelected}
            onToggleSelectAll={handleToggleSelectAll}
            totalItems={filteredProducts.length}
          />

          {/* Filtered 0 items result state */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card">
              <Search className="size-8 text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-base">No matching products found</p>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                Try adjusting your search query or filters to find what you're looking for.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  setStockFilter('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            /* Views rendering */
            <>
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <WishlistGridCard
                      key={product._id}
                      product={product}
                      isSelected={selectedIds.includes(product._id)}
                      onToggleSelect={handleToggleSelect}
                      onAddToCart={handleAddToCart}
                      onRemove={handleRemoveItem}
                      isAddingToCart={addingProductIds.includes(product._id)}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <WishlistListCard
                      key={product._id}
                      product={product}
                      isSelected={selectedIds.includes(product._id)}
                      onToggleSelect={handleToggleSelect}
                      onAddToCart={handleAddToCart}
                      onRemove={handleRemoveItem}
                      isAddingToCart={addingProductIds.includes(product._id)}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'table' && (
                <div className="border rounded-xl overflow-hidden bg-card shadow-2xs">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-[40px] text-center">
                          <Checkbox
                            checked={allFilteredSelected}
                            onCheckedChange={handleToggleSelectAll}
                            className="size-4 rounded-[4px]"
                          />
                        </TableHead>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <WishlistTableRow
                          key={product._id}
                          product={product}
                          isSelected={selectedIds.includes(product._id)}
                          onToggleSelect={handleToggleSelect}
                          onAddToCart={handleAddToCart}
                          onRemove={handleRemoveItem}
                          isAddingToCart={addingProductIds.includes(product._id)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}

          {/* Floating Batch Action Bar */}
          <WishlistBatchBar
            selectedCount={selectedIds.length}
            selectedTotalValue={selectedTotalValue}
            onMoveSelectedToCart={handleMoveSelectedToCart}
            onRemoveSelected={handleRemoveSelected}
            onClearSelection={() => setSelectedIds([])}
            isProcessing={isBatchProcessing}
          />
        </>
      )}
    </div>
  );
}