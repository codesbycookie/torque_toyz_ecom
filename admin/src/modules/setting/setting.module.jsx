import { toast } from "sonner";
import { useSettingStore } from "./setting.store";
import { apiRequest } from "@/core/api/api.request";
import { apiurls } from "@/core/api/api.urls";
import handleApiError from "@/core/errors/error.handler";

const isPlainObject = (val) =>
  val !== null && typeof val === "object" && !Array.isArray(val);

export const useSettingModule = (exported) => {
  const store = useSettingStore();
  const { current, setCurrent, startLoading, stopLoading } = store;
  const { settings } = apiurls;

  const fetch = async () => {
    startLoading("getAll");
    try {
      const res = await apiRequest(settings.get.method, settings.get.url());
      const data = res?.data ?? res;

      if (!isPlainObject(data)) {
        console.error("[settings] Unexpected response shape — got:", data);
        toast.error("Couldn't load settings — unexpected response from server");
        return null;
      }

      setCurrent(data);
      return data;
    } catch (err) {
      handleApiError(err, "Failed to load settings");
      throw err;
    } finally {
      stopLoading("getAll");
    }
  };

  const fetchRaw = async () => {
    startLoading("getAll");
    try {
      const res = await apiRequest(settings.getRaw.method, settings.getRaw.url());
      const data = res?.data ?? res;

      if (!isPlainObject(data)) {
        console.error("[settings] Unexpected raw response shape — got:", data);
        toast.error("Couldn't load settings — unexpected response from server");
        return null;
      }

      return data;
    } catch (err) {
      handleApiError(err, "Failed to load raw settings");
      throw err;
    } finally {
      stopLoading("getAll");
    }
  };

  // Update a single setting by key — PUT /settings/:key
  const updateKey = async (key, value) => {
    startLoading("edit");
    try {
      const res = await apiRequest(settings.update.method, settings.update.url(key), {
        data: { value },
      });
      setCurrent({ ...useSettingStore.getState().current, [key]: value });
      toast.success("Setting updated successfully");
      return res;
    } catch (err) {
      handleApiError(err, "Failed to update setting");
      throw err;
    } finally {
      stopLoading("edit");
    }
  };

  // Save multiple settings at once — PUT /settings/bulk
  const save = async (data) => {
    startLoading("edit");
    try {
      const settingsList = Array.isArray(data?.settings)
        ? data.settings
        : isPlainObject(data)
        ? Object.entries(data).map(([key, value]) => ({ key, value }))
        : [];

      const res = await apiRequest(settings.bulkUpdate.method, settings.bulkUpdate.url(), {
        data: { settings: settingsList },
      });
      const updatedValues = isPlainObject(data) && !data.settings ? data : {};
      setCurrent({ ...useSettingStore.getState().current, ...updatedValues });
      toast.success("Settings updated successfully");
      return res;
    } catch (err) {
      handleApiError(err, "Failed to update settings");
      throw err;
    } finally {
      stopLoading("edit");
    }
  };

  const downloadDump = async () => {
    try {
      await apiRequest(settings.downloadDump.method, settings.downloadDump.url());
      toast.success("Backup downloaded successfully");
    } catch (err) {
      handleApiError(err, "Failed to download backup");
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
    fetch,
    fetchRaw,
    updateKey,
    save,
    downloadDump,
  };
};