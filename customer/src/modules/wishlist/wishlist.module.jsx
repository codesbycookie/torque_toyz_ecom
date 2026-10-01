import { toast } from "sonner";
import { useWishlistStore } from "./wishlist.store";
import { useProductStore } from "@/modules/product/product.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";

// The wishlist endpoints (`get`, `addProduct`, `removeProduct`, `clear`) don't
// match the crud factory's special-cased keys (getAll/create/edit/delete), so
// none of createCrud's automatic store syncing (SET_KEYS/ADD_KEYS/etc.)
// kicks in for them. We drive the store manually here instead, the same way
// product.module.jsx does for `getBySlug`/`getFeatured`.

// The backend model is ONE wishlist document per user:
//   { _id, user, products: [<populated Product docs>], createdAt, updatedAt }
// GET /wishlists returns that single document (or null for a user who has
// never added anything). We store the raw doc as `current`, and mirror its
// populated `products` array into `list` so ProductGrid/ProductCard —
// which expect an array of product objects — work unmodified.
export const useWishlistModule = () => {
  const { wishlist } = apiurls;

  const crud = createCrud({
    entity: "Wishlist",
    urls: wishlist,
    store: useWishlistStore.getState(),
    getRole: () => null,
  });

  const syncProductWishlistState = (wishlistProductList) => {
    const wishlistedIds = new Set((wishlistProductList || []).map((p) => p._id || p));
    const productStore = useProductStore.getState();

    if (productStore.list?.length) {
      const updatedList = productStore.list.map((p) => ({
        ...p,
        is_in_wishlist: wishlistedIds.has(p._id),
      }));
      productStore.set(updatedList);
    }

    if (productStore.current) {
      productStore.setCurrent({
        ...productStore.current,
        is_in_wishlist: wishlistedIds.has(productStore.current._id),
      });
    }
  };

  const updateProductWishlistState = (productId, isInWishlist) => {
    const productStore = useProductStore.getState();

    if (productStore.current && productStore.current._id === productId) {
      productStore.setCurrent({
        ...productStore.current,
        is_in_wishlist: isInWishlist,
      });
    }

    if (productStore.list?.length) {
      const updatedList = productStore.list.map((p) =>
        p._id === productId ? { ...p, is_in_wishlist: isInWishlist } : p
      );
      productStore.set(updatedList);
    }
  };

  const fetchAll = async () => {
    let res = null;
    try {
      res = await crud.get({ __options: { toast: false, error: false } });
    } catch {
      // A user with no wishlist yet may 404 rather than return null —
      // treat that as an empty wishlist instead of surfacing an error.
      res = null;
    }
    const list = res?.products || [];

    useWishlistStore.getState().setCurrent(res || null);
    useWishlistStore.getState().set(list);
    syncProductWishlistState(list);
    return list;
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
    useStore: useWishlistStore,
    fetchAll,
    addProduct,
    removeProduct,
    clear,
    toggle,
    isWishlisted,
  };
};