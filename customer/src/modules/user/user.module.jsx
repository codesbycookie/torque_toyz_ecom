import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { useUserStore } from "./user.store";

const isValidObjectId = (val) =>
  typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

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
   * Clean and normalize an address payload for MongoDB user schema & zod validator
   */
  const cleanAddress = (addr, defaultUser = {}) => {
    const rawState =
      typeof addr.state === "object" && addr.state?._id
        ? String(addr.state._id)
        : typeof addr.state === "string"
        ? addr.state
        : undefined;

    const stateId = isValidObjectId(rawState) ? rawState : undefined;
    const pin = Number(addr.pincode || addr.zip);

    const cleaned = {
      label: (addr.label || "Home").trim(),
      name: (
        addr.name ||
        [addr.firstName, addr.lastName].filter(Boolean).join(" ") ||
        defaultUser.name ||
        "Default Contact"
      ).trim(),
      phone: (addr.phone || defaultUser.phone || "").trim(),
      door: (addr.door || "").trim(),
      street: (addr.street || "").trim(),
      city: (addr.city || "").trim(),
      is_default: Boolean(addr.is_default || addr.isDefault),
    };

    if (stateId) cleaned.state = stateId;
    if (!Number.isNaN(pin) && pin > 0) cleaned.pincode = pin;
    if (addr._id && isValidObjectId(String(addr._id))) cleaned._id = String(addr._id);

    return cleaned;
  };

  /**
   * Save an address (add new or update existing) to the user's data in MongoDB
   */
  const saveUserAddress = async (user, newAddress) => {
    if (!user?._id) return null;

    const targetId = String(newAddress._id || newAddress.id || "");
    const cleanedNew = cleanAddress(newAddress, user);

    const existingAddresses = Array.isArray(user.addresses)
      ? user.addresses.map((a) => cleanAddress(a, user))
      : [];

    let updatedList;
    const existingIndex = existingAddresses.findIndex((a) => {
      const aId = String(a._id || a.id || "");
      return aId && targetId && aId === targetId;
    });

    const isDefault = cleanedNew.is_default || existingAddresses.length === 0;

    if (existingIndex >= 0) {
      updatedList = existingAddresses.map((a, i) =>
        i === existingIndex
          ? { ...a, ...cleanedNew, is_default: isDefault }
          : isDefault
          ? { ...a, is_default: false }
          : a
      );
    } else {
      const normalizedNew = { ...cleanedNew, is_default: isDefault };
      const adjustedExisting = isDefault
        ? existingAddresses.map((a) => ({ ...a, is_default: false }))
        : existingAddresses;
      updatedList = [normalizedNew, ...adjustedExisting];
    }

    const defaultAddr = updatedList.find((a) => a.is_default) || updatedList[0];
    const primaryAddress = defaultAddr
      ? {
          door: defaultAddr.door,
          street: defaultAddr.street,
          city: defaultAddr.city,
          ...(defaultAddr.state ? { state: defaultAddr.state } : {}),
          ...(defaultAddr.pincode ? { pincode: defaultAddr.pincode } : {}),
        }
      : undefined;

    const payload = {
      addresses: updatedList,
      ...(primaryAddress ? { address: primaryAddress } : {}),
    };

    const res = await crud.edit(user._id, payload);
    return res;
  };

  /**
   * Delete an address from the user's data in MongoDB
   */
  const deleteUserAddress = async (user, addressId) => {
    if (!user?._id) return null;

    const targetId = String(addressId);
    const existingAddresses = Array.isArray(user.addresses)
      ? user.addresses.map((a) => cleanAddress(a, user))
      : [];

    const updatedList = existingAddresses.filter((a) => {
      const aId = String(a._id || a.id || "");
      return aId !== targetId;
    });

    if (updatedList.length > 0 && !updatedList.some((a) => a.is_default)) {
      updatedList[0].is_default = true;
    }

    const defaultAddr = updatedList.find((a) => a.is_default) || updatedList[0];
    const primaryAddress = defaultAddr
      ? {
          door: defaultAddr.door,
          street: defaultAddr.street,
          city: defaultAddr.city,
          ...(defaultAddr.state ? { state: defaultAddr.state } : {}),
          ...(defaultAddr.pincode ? { pincode: defaultAddr.pincode } : {}),
        }
      : undefined;

    const payload = {
      addresses: updatedList,
      ...(primaryAddress ? { address: primaryAddress } : {}),
    };

    const res = await crud.edit(user._id, payload);
    return res;
  };

  return {
    ...crud,
    saveUserAddress,
    deleteUserAddress,
    useStore: useUserStore,
  };
};
