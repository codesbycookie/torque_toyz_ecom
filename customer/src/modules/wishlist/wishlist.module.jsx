import { toast } from "sonner";
import { useWishlistStore } from "./wishlist.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { apiRequest } from "@/core/api/api.request";

export const useWishlistModule = () => {
  const { wishlist, products } = apiurls;

  const crud = createCrud({
    entity: "Wishlist",
    urls: wishlist,
    store: useWishlistStore.getState(),
    getRole: () => null,
  });

  // Fetch full product details from an array of IDs
  const fetchProductsByIds = async (ids = []) => {
    if (!ids.length) return [];

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const url =
            typeof products.getOne?.url === "function"
              ? products.getOne.url(id)
              : `${import.meta.env.VITE_BASE_URL}/products/${id}`;

          const res = await apiRequest("get", url);
          return res?.data || res;
        } catch {
          return null;
        }
      })
    );

    return results.filter(Boolean);
  };

  const normalizeAndLoad = async (res) => {
    if (!res) {
      useWishlistStore.getState().setCurrent(null);
      useWishlistStore.getState().set([]);
      return [];
    }

    const rawProducts = res.products || [];

    // If backend already sent full objects
    const areObjects =
      rawProducts.length > 0 &&
      typeof rawProducts[0] === "object" &&
      rawProducts[0]?._id;

    let list = [];

    if (areObjects) {
      list = rawProducts;
    } else {
      // Backend sent only IDs → fetch full products
      list = await fetchProductsByIds(rawProducts);
    }

    useWishlistStore.getState().setCurrent(res);
    useWishlistStore.getState().set(list);

    return list;
  };

  const fetchAll = async () => {
    let res = null;

    try {
      res = await crud.get({ __options: { toast: false, error: false } });
    } catch {
      res = null;
    }

    // apiRequest / createCrud may already unwrap .data
    const payload = res?.data || res;
    return normalizeAndLoad(payload);
  };

  const addProduct = async (productId) => {
    try {
      await crud.addProduct(
        { product: productId },
        { __options: { toast: false } }
      );
      await fetchAll();
      toast.success("Added to wishlist");
    } catch (err) {
      throw err;
    }
  };

  const removeProduct = async (productId) => {
    try {
      await crud.removeProduct(productId, {
        __options: { toast: false },
      });
      await fetchAll();
      toast.success("Removed from wishlist");
    } catch (err) {
      throw err;
    }
  };

  const clear = async () => {
    try {
      await crud.clear({ __options: { toast: false } });
      useWishlistStore.getState().setCurrent(null);
      useWishlistStore.getState().set([]);
      toast.success("Wishlist cleared");
    } catch (err) {
      throw err;
    }
  };

  const toggle = async (product, isWishlisted) => {
    if (!product?._id) return;

    if (isWishlisted) {
      await removeProduct(product._id);
    } else {
      await addProduct(product._id);
    }
  };

  const isWishlisted = (productId) => {
    return useWishlistStore
      .getState()
      .list.some((p) => p._id === productId);
  };

  return {
    useStore: useWishlistStore,
    fetchAll,
    addProduct,
    removeProduct,
    clear,
    toggle,
    isWishlisted,
  };
};