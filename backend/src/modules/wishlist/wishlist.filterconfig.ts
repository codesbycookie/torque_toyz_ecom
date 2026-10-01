import { FilterConfig } from "@core/constants/dynamicfilter.constant.ts";
import { IWishlist } from "@db/models/wishlist.model.ts";

export const wishlistFilterConfig: FilterConfig<IWishlist> = {
  searchable: [],
  filterable: ["user"],
  sortable: ["createdAt"],
  defaultSort: "createdAt",
};
