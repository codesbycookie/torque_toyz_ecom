import { toast } from 'sonner';
import handleApiError from '@/core/errors/error.handler';
import { apiRequest } from '../api/api.request';
import { camelToTitle } from '../utils/helper.utils';

export const createCrud = ({ entity, urls, store, getRole }) => {
  const crud = {};

  const customtoasts = {
    setActiveStatus: (entity, res) =>
      res?.active
        ? `${camelToTitle(entity)} is now active`
        : `${camelToTitle(entity)} has been deactivated`,
    submit: (entity) => `${camelToTitle(entity)} submitted for approval`,
    branchApprove: (entity, res) => `Order successfully ${res?.branchAdminApproval?.status}`,
    superAdminApprove: (entity, res) => `Order successfully ${res?.superAdminApproval?.status}`,
  };

  const defaultMessages = {
    create: 'created successfully',
    edit: 'updated successfully',
    delete: 'deleted successfully',
    erase: 'deleted permanently',
    retrieve: 'retrieved successfully',
  };

  const DOWNLOAD_KEYS = ['download', 'exportCsv', 'exportXlsx', 'exportPdf', 'exportMarksheetCsv'];
  const SET_KEYS = ['getAll', 'getMine'];
  const ADD_KEYS = ['create'];
  const UPDATE_KEYS = ['edit', 'setActiveStatus', 'toggleStatus', 'branchApprove', 'branchAdminApprove', 'superAdminApprove', 'submit'];
  const DELETE_KEYS = ['delete'];
  const RETRIEVE_KEYS = ['retrieve'];
  const ERASE_KEYS = ['erase'];




  const loadingCounts = {};

  const beginLoading = (key) => {
    loadingCounts[key] = (loadingCounts[key] || 0) + 1;
    if (loadingCounts[key] === 1) store?.startLoading?.(key);
  };

  const endLoading = (key) => {
    loadingCounts[key] = Math.max((loadingCounts[key] || 1) - 1, 0);
    if (loadingCounts[key] === 0) store?.stopLoading?.(key);
  };

  Object.entries(urls).forEach(([key, config]) => {
    const { method, url } = config;

    const loadingKey = SET_KEYS.includes(key)
      ? 'getAll'
      : ADD_KEYS.includes(key)
        ? 'create'
        : UPDATE_KEYS.includes(key)
          ? 'edit'
          : DELETE_KEYS.includes(key)
            ? 'delete'
            : 'global';

    crud[key] = async (...args) => {
      const lastArg = args[args.length - 1];
      const isOptions = lastArg && typeof lastArg === 'object' && lastArg.__options;

      const callOptions = isOptions ? lastArg.__options : {};
      if (isOptions) args.pop();

      beginLoading(loadingKey);

      try {
        const finalUrl = typeof url === 'function' ? url(...args) : url;
        const isBody = ['post', 'put', 'patch'].includes(method.toLowerCase());

        if (DOWNLOAD_KEYS.includes(key)) {
          const rawParams = args[0] || {};

          const { page, limit, ...exportParams } = rawParams;

          const cleanParams = Object.fromEntries(
            Object.entries(exportParams).filter(
              ([_, v]) =>
                v !== undefined && v !== null && typeof v !== 'function' && typeof v !== 'object'
            )
          );

          const response = await apiRequest('download', finalUrl, {
            params: cleanParams,
          });



          toast.success(
            typeof response === 'string' && response
              ? `Downloaded: ${response}`
              : `${camelToTitle(entity)} downloaded successfully`
          );
          return response;
        }

        let options = {};

        if (isBody) {
          const body = args[args.length - 1];
          if (body instanceof FormData) {
            options.data = body;
          } else if (Array.isArray(body)) {
            options.data = body;
          } else if (typeof body === 'object' && body !== null) {



            options.data = callOptions.stripEmptyStrings
              ? Object.fromEntries(Object.entries(body).filter(([_, v]) => v !== ''))
              : body;
          }
        } else if (method.toLowerCase() === 'get' && args[0] && typeof args[0] === 'object') {
          options.params = args[0];
        }

        const res = await apiRequest(method, finalUrl, options);


        const data = res?.data;

        if (SET_KEYS.includes(key)) {
          store?.set?.(data || []);
          if (res?.pagination) {
            store?.setPagination?.(res.pagination);
          }
        }

        if (ADD_KEYS.includes(key) && !callOptions.skipStore) {
          store?.add?.(data);
        }

        if (UPDATE_KEYS.includes(key)) {
          store?.update?.(args[0], data);
          store?.setCurrent?.(data);
        }

        if (DELETE_KEYS.includes(key)) {
          const role = getRole?.();

          if (typeof getRole !== 'function' && process.env.NODE_ENV !== 'production') {


            console.warn(
              `[loom] "${entity}" has a delete action but no getRole() was provided; defaulting to permanent removal from the store.`
            );
          }

          if (role !== 'super_admin') {
            store?.remove?.(args[0]);
          } else {
            store?.update?.(args[0], { deleted: true, active: false });
          }
        }

        if (RETRIEVE_KEYS.includes(key)) {
          store?.update?.(args[0], { deleted: false, active: true });
        }

        if (ERASE_KEYS.includes(key)) {
          store?.remove?.(args[0]);
        }

        const shouldToast = callOptions.toast !== false;

        if (shouldToast) {
          const customMessage = customtoasts[key]?.(entity, data);
          const message =
            customMessage !== undefined && customMessage !== null
              ? customMessage
              : defaultMessages[key]
                ? `${camelToTitle(entity)} ${defaultMessages[key]}`
                : null;

          if (message) {
            toast.success(message);
          }
        }

        return data;
      } catch (err) {
        handleApiError(err, `Failed to ${key} ${entity}`, {
          toast: callOptions.error !== false,
        });

        throw err;
      } finally {
        endLoading(loadingKey);
      }
    };
  });

  return crud;
}; 