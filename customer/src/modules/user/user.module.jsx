import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { useUserStore } from "./user.store";

export const useUserModule = () => {
  const { users } = apiurls;
  const store = useUserStore();

  const crud = createCrud({
    entity: "User",
    urls: users,
    store,
    getRole: () => null,
  });

  /**
   * Save an address (add new or update existing) using CRUD operations
   */
  const saveUserAddress = async (user, address) => {
    if (!user?._id) return null;

    const targetId = String(address?._id || address?.id || "");
    const existingAddresses = Array.isArray(user.addresses) ? [...user.addresses] : [];

    const existingIndex = targetId
      ? existingAddresses.findIndex(
          (a) => String(a._id || a.id || "") === targetId
        )
      : -1;

    // Remove client-only temporary id prefix so Mongo assigns an ObjectId
    const isTempId = targetId.startsWith("addr_");
    const addressToSave = { ...address };
    if (isTempId) {
      delete addressToSave._id;
      delete addressToSave.id;
    }

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = existingAddresses.map((a, i) =>
        i === existingIndex ? { ...a, ...addressToSave } : a
      );
    } else {
      updatedList = [addressToSave, ...existingAddresses];
    }

    return await crud.edit(user._id, { addresses: updatedList });
  };

  /**
   * Update address using CRUD operations
   */
  const updateUserAddress = async (user, address) => {
    return saveUserAddress(user, address);
  };

  /**
   * Delete address using CRUD operations
   */
  const deleteUserAddress = async (user, addressId) => {
    if (!user?._id) return null;

    const targetId = String(addressId);
    const existingAddresses = Array.isArray(user.addresses) ? [...user.addresses] : [];
    const updatedList = existingAddresses.filter(
      (a) => String(a._id || a.id || "") !== targetId
    );

    return await crud.edit(user._id, { addresses: updatedList });
  };

  return {
    ...crud,
    saveUserAddress,
    updateUserAddress,
    saveAddress: saveUserAddress,
    updateAddress: updateUserAddress,
    deleteUserAddress,
    deleteAddress: deleteUserAddress,
    useStore: useUserStore,
  };
};
