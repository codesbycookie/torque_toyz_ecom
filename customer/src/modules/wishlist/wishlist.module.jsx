import { toast } from "sonner";
import { useWishlistStore } from "./wishlist.store";
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
    return list;
  };

  const addProduct = async (productId) => {
    try {
      const res = await crud.addProduct(
        { product: productId },
        { __options: { toast: false } }
      );
      await fetchAll();
      toast.success("Added to wishlist");
      return res;
    } catch (err) {
      throw err;
    }
  };

  const removeProduct = async (productId) => {
    try {
      const res = await crud.removeProduct(productId, {
        __options: { toast: false },
      });
      await fetchAll();
      toast.success("Removed from wishlist");
      return res;
    } catch (err) {
      throw err;
    }
  };

  const clear = async () => {
    try {
      const res = await crud.clear({ __options: { toast: false } });
      useWishlistStore.getState().setCurrent(res || null);
      useWishlistStore.getState().set(res?.products || []);
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