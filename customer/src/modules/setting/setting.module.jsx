import { useSettingStore } from "./setting.store";
import { apiRequest } from "@/core/api/api.request";
import { apiurls } from "@/core/api/api.urls";

const isPlainObject = (val) =>
  val !== null && typeof val === "object" && !Array.isArray(val);

const flattenSettings = (data) => {
  if (!isPlainObject(data)) return {};
  let flat = {};
  for (const key in data) {
    if (isPlainObject(data[key])) {
      flat = { ...flat, ...data[key] };
    } else {
      flat[key] = data[key];
    }
  }
  return flat;
};

export const useSettingModule = (exported) => {
  const store = useSettingStore();
  const { current, setCurrent, startLoading, stopLoading } = store;
  const { settings } = apiurls;

  const fetchPublic = async () => {
    startLoading("getAll");
    try {
      // Try public route first
      let res;
      try {
        res = await apiRequest("get", `${import.meta.env.VITE_BASE_URL}/settings/public`);
      } catch (err) {
        res = await apiRequest(settings.get.method, settings.get.url());
      }
      const data = res?.data ?? res;

      if (!isPlainObject(data)) {
        return null;
      }

      const flatData = flattenSettings(data);
      setCurrent(flatData);
      return flatData;
    } catch (err) {
      console.warn("[settings] Failed to load public settings", err);
      return null;
    } finally {
      stopLoading("getAll");
    }
  };

  return {
    get values() {
      return useSettingStore.getState().current;
    },
    get loading() {
      return useSettingStore.getState().loading;
    },
    setCurrent,
    fetchPublic,
    fetch: fetchPublic,
  };
};
