import { Request, Response } from 'express';

import * as service from './product.services.ts';
import { CreateProductPayload, UpdateProductPayload } from '@typings/product.types.ts';
import { createStatusControllers } from '@core/constants/createstatuscontroller.constant.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { buildQuery } from '@core/constants/querybuilder.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';
import { AccessRequest } from '@core/middlewares/access.middleware.ts';

const productStatus = createStatusControllers(
  {
    remove: service.removeProduct,
    setActiveStatus: service.setProductActiveStatus,
    retrieve: service.retrieveProduct,
  },
  'product'
);

const controllers = {
  createProduct: async (req: AccessRequest<{}, {}, CreateProductPayload>, res: Response) => {
    const product = await service.createProduct(req.body);
    return sendResponse.created(res, 'Product', product);
  },

  getAllProducts: async (req: AccessRequest, res: Response) => {
    const queries = buildQuery(req);
    const result = await service.getAllProducts(queries, req.user?.role);
    return sendResponse.paginated(res, 'product', result);
  },

  getProductBySlug: async (req: Request<{ slug: string }>, res: Response) => {
    const { slug } = req.params;
    const product = await service.getProductBySlug(slug);
    if (!product) return sendResponse.notFound(res, 'product');
    return sendResponse.fetched(res, 'product', product);
  },

  getProductById: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const product = await service.getProductById(id);
    if (!product) return sendResponse.notFound(res, 'product');
    return sendResponse.fetched(res, 'product', product);
  },

  updateProduct: async (req: Request<{ id: string }, {}, UpdateProductPayload>, res: Response) => {
    const { id } = req.params;
    const product = await service.updateProduct(id, req.body);
    if (!product) return sendResponse.notFound(res, 'product');
    return sendResponse.updated(res, 'product', product);
  },

  deleteProduct: productStatus.softDelete,
  setProductActiveStatus: productStatus.setActiveStatus,
  retrieveProduct: productStatus.retrieve,

  eraseProduct: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const product = await service.eraseProduct(id);
    if (!product) return sendResponse.notFound(res, 'product');
    return sendResponse.deleted(res, 'product');
  },
};

export const {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
  setProductActiveStatus,
  retrieveProduct,
  eraseProduct,
} = wrapControllers(controllers);