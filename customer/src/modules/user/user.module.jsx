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

  return {
    ...crud,
    useStore: useUserStore,
  };
};
