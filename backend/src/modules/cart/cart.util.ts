import { enhanceDoc } from "@core/constants/enhancedoc.constant.ts";
import CartModel, { ICart } from "@db/models/cart.model.ts";

export const enhanceCart = async (cart: ICart) => {
  cart = await cart.populate([
    { path: "user", select: "name email phone" },
    { path: "shipping_address.state", select: "state code" },
    { path: "items.product", select: "name images price weight stock" },
  ]);
  return enhanceDoc(CartModel, cart, []);
};
