import { useUI } from "@/core/contexts/ui.context";
import { useAuth } from "@/core/contexts/auth.context";
import { useUserStore } from "./user.store";
import { modals } from "./user.modals";
import { useUserColumns } from "./user.columns";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useUserModule = (exported) => {
  const { openModal } = useUI();
  const { adminResetPassword } = useAuth();
  const store = useUserStore();
  const { set, add, update, remove, setCurrent, setQuery } = store;
  const { users } = apiurls;

  const crud = createCrud({
    entity: "User",
    urls: users,
    store: store,
    getRole: () => "super_admin",
  });

  // NOTE: No openCreate here on purpose — user creation isn't handled yet.

  const openView = (user) => {
    setCurrent(user);
    return openModal(modals.view, {
      user,
      exported,
    });
  };

  // Soft delete → item stays in list with deleted: true
  const openDelete = (id, name) => {
    return openModal(modals.delete, {
      id,
      name,
      submitFn: (id) => crud.delete(id),
      exported,
    });
  };

  // Reset password now goes through AuthContext's adminResetPassword,
  // which hits POST /auths/admin/reset-password.
  const openResetPassword = (user) => {
    return openModal(modals.resetPassword, {
      user,
      submitFn: (data) =>
        adminResetPassword(user._id, user.role, data.password),
      exported,
    });
  };

  const openDisable = (id, name, status) => {
    return openModal(modals.disable, {
      id,
      name,
      status,
      submitFn: (id, data) => crud.setActiveStatus(id, data),
      exported,
    });
  };

  // Permanent erase → removes item from list
  const openErase = (id, name) => {
    return openModal(modals.erase, {
      id,
      name,
      submitFn: (id) => crud.erase(id),
      exported,
    });
  };

  // Retrieve a soft-deleted user
  const openRetrieve = (id, name) => {
    return openModal(modals.retrieve, {
      id,
      name,
      submitFn: (id) => crud.retrieve(id),
      exported,
    });
  };

  const { fetch, reset, sortByColumn, presets, csv, xlsx, pdf, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useUserStore.getState().query,
      setQuery,
    });

  return {
    get state() {
      return useUserStore.getState().list;
    },
    get loading() {
      return useUserStore.getState().loading;
    },
    get pagination() {
      return useUserStore.getState().pagination;
    },
    get current() {
      return useUserStore.getState().current;
    },
    set,
    add,
    update,
    remove,
    setCurrent,
    useUserColumns,
    openView,
    openDelete,
    openResetPassword,
    openDisable,
    openErase,
    openRetrieve,
    crud,
    fetch,
    reset,
    sortByColumn,
    filters: presets,
    csv,
    xlsx,
    pdf,
    getQuery,
  };
};