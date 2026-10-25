import { toast } from "sonner";
import { useWishlistStore } from "./wishlist.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import {
  syncProductWishlistState,
  updateProductWishlistState,
} from "./wishlist.helpers";

export const useWishlistModule = () => {
  const { wishlist } = apiurls;

  const crud = createCrud({
    entity: "Wishlist",
    urls: wishlist,
    store: useWishlistStore.getState(),
    getRole: () => null,
  });

  const list = useWishlistStore((s) => s.list || []);
  const current = useWishlistStore((s) => s.current);
  const loading = useWishlistStore((s) => s.loading);

  const fetchAll = async () => {
    let res = null;
    try {
      res = await crud.get({ __options: { toast: false, error: false } });
    } catch {
      res = null;
    }
    const productList = res?.products || [];

    useWishlistStore.getState().setCurrent(res || null);
    useWishlistStore.getState().set(productList);
    syncProductWishlistState(productList);
    return productList;
  };

  const addProduct = async (productId) => {
    try {
      updateProductWishlistState(productId, true);
      const res = await crud.addProduct(
        { product: productId },
        { __options: { toast: false } }
      );
      await fetchAll();
      toast.success("Added to wishlist");
      return res;
    } catch (err) {
      updateProductWishlistState(productId, false);
      throw err;
    }
  };

  const removeProduct = async (productId, options = {}) => {
    const cleanId = String(productId?._id || productId?.id || productId || "");
    try {
      updateProductWishlistState(cleanId, false);
      const currentList = useWishlistStore.getState().list || [];
      useWishlistStore.getState().set(
        currentList.filter((p) => String(p._id || p.id || p) !== cleanId)
      );
      const res = await crud.removeProduct(cleanId, {
        __options: { toast: false },
      });
      await fetchAll();
      if (!options?.silent) {
        toast.success("Removed from wishlist");
      }
      return res;
    } catch (err) {
      updateProductWishlistState(cleanId, true);
      await fetchAll();
      throw err;
    }
  };

  const clear = async () => {
    try {
      const res = await crud.clear({ __options: { toast: false } });
      useWishlistStore.getState().setCurrent(res || null);
      useWishlistStore.getState().set(res?.products || []);
      syncProductWishlistState([]);
      toast.success("Wishlist cleared");
      return res;
    } catch (err) {
      throw err;
    }
  };

  const toggle = (product, isWishlisted) =>
    isWishlisted ? removeProduct(product._id) : addProduct(product._id);

  const isWishlisted = (productId) => {
    const cleanId = String(productId?._id || productId?.id || productId || "");
    if (!cleanId) return false;
    return (useWishlistStore.getState().list || []).some(
      (p) => String(p._id || p.id || p) === cleanId
    );
  };

  return {
    crud,
    list,
    current,
    loading,
    fetchAll,
    addProduct,
    removeProduct,
    clear,
    toggle,
    isWishlisted,
  };
};