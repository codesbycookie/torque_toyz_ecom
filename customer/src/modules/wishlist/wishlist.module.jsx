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

  const removeProduct = async (productId) => {
    try {
      updateProductWishlistState(productId, false);
      const res = await crud.removeProduct(productId, {
        __options: { toast: false },
      });
      await fetchAll();
      toast.success("Removed from wishlist");
      return res;
    } catch (err) {
      updateProductWishlistState(productId, true);
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

  const isWishlisted = (productId) =>
    useWishlistStore.getState().list.some((p) => p._id === productId);

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