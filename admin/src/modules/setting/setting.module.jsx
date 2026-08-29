import { toast } from "sonner";
import { useSettingStore } from "./setting.store";

const DUMMY_SETTINGS = {
  site_name: "My Shop",
  support_email: "support@myshop.com",
  low_stock_threshold: 10,
  maintenance_mode: false,
};

export const useSettingModule = (exported) => {
  const store = useSettingStore();
  const { current, setCurrent, startLoading, stopLoading } = store;

  // Load dummy data once
  if (useSettingStore.getState().current === null) {
    setCurrent(DUMMY_SETTINGS);
  }

  const save = async (data) => {
    startLoading("edit");
    try {
      // simulate a network round-trip — no real API yet
      await new Promise((resolve) => setTimeout(resolve, 400));
      setCurrent({ ...useSettingStore.getState().current, ...data });
      toast.success("Settings updated successfully");
    } finally {
      stopLoading("edit");
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
    save,
  };
};