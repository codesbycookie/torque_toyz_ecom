import { useHomeStore } from "./home.store";
import { apiRequest } from "@/core/api/api.request";
import { apiurls } from "@/core/api/api.urls";
import { useCategoryStore } from "@/modules/category/category.store";
import { useProductStore } from "@/modules/product/product.store";

// Module-level in-flight promise and timestamp cache to guarantee deduplication
let inFlightPromise = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh cache

export const useHomeModule = (exported) => {
  const store = useHomeStore();
  const { setData, setLoading, setError } = store;

  const fetchHomeData = async (options = {}) => {
    const { force = false } = options;

    const currentData = useHomeStore.getState().data;
    const hasData =
      currentData?.categories?.length > 0 && currentData?.products?.length > 0;
    const isFresh = Date.now() - lastFetchTime < CACHE_TTL_MS;

    // 1. If fresh data is already cached and not forced, return immediately
    if (!force && hasData && isFresh) {
      return currentData;
    }

    // 2. If a request is already in-flight, return the existing promise (prevents multiple parallel requests)
    if (inFlightPromise) {
      return inFlightPromise;
    }

    // 3. Initiate single network request
    inFlightPromise = (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest(
          apiurls.home.get.method,
          apiurls.home.get.url()
        );
        const result = res?.data || res || {};

        setData(result);
        lastFetchTime = Date.now();

        // Hydrate category store so navbar and category modules have immediate access without re-fetching
        if (result.categories && Array.isArray(result.categories)) {
          useCategoryStore.getState().set?.(result.categories);
        }
        if (result.products && Array.isArray(result.products)) {
          useProductStore.getState().set?.(result.products);
        }

        return result;
      } catch (err) {
        setError(err?.message || "Failed to load home data");
        return null;
      } finally {
        setLoading(false);
        inFlightPromise = null;
      }
    })();

    return inFlightPromise;
  };

  return {
    get data() {
      return useHomeStore.getState().data;
    },
    get loading() {
      return useHomeStore.getState().loading;
    },
    get error() {
      return useHomeStore.getState().error;
    },
    fetchHomeData,
    loadHomeData: fetchHomeData,
  };
};
