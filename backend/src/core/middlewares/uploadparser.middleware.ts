import { Request, Response, NextFunction } from 'express';

export const parseUserUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    req.body.profile = { url: req.file.path || 'http://dummy.url/test.jpg' };
  }
  
  // Handle form-data stringified booleans and objects
  if (req.body.acceptTerms === 'true') req.body.acceptTerms = true;
  if (req.body.acceptTerms === 'false') req.body.acceptTerms = false;
  
  if (typeof req.body.address === 'string') {
    try {
      req.body.address = JSON.parse(req.body.address);
    } catch (e) {
      // let zod validation fail naturally
    }
  }

  next();
};

export const parseProductUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    req.body.images = req.files.map((file: any) => file.path || 'http://dummy.url/test.jpg');
  }

  // Handle form-data stringified numbers & booleans
  if (req.body.weight !== undefined) req.body.weight = Number(req.body.weight);
  if (req.body.stock !== undefined) req.body.stock = Number(req.body.stock);
  if (req.body.price !== undefined) req.body.price = Number(req.body.price);
  if (req.body.active === 'true') req.body.active = true;
  if (req.body.active === 'false') req.body.active = false;

  // Handle form-data stringified ui object
  if (typeof req.body.ui === 'string') {
    try {
      req.body.ui = JSON.parse(req.body.ui);
    } catch (e) {
      // let zod validation fail or pass naturally
    }
  }

  if (req.body.ui && typeof req.body.ui === 'object') {
    if (req.body.ui.slash_price !== undefined) {
      req.body.ui.slash_price = Number(req.body.ui.slash_price) || 0;
    }
    if (req.body.ui.actual_price !== undefined) {
      req.body.ui.actual_price = Number(req.body.ui.actual_price) || 0;
      if (req.body.price === undefined || req.body.price === 0) {
        req.body.price = req.body.ui.actual_price;
      }
    }
    if (req.body.ui.is_trending === 'true' || req.body.ui.is_trending === true) {
      req.body.ui.is_trending = true;
    } else if (req.body.ui.is_trending === 'false' || req.body.ui.is_trending === false) {
      req.body.ui.is_trending = false;
    }
    if (typeof req.body.ui.badges === 'string') {
      try {
        req.body.ui.badges = JSON.parse(req.body.ui.badges);
      } catch {
        req.body.ui.badges = req.body.ui.badges.split(',').map((b: string) => b.trim()).filter(Boolean);
      }
    }
  }

  if (req.body.price !== undefined && req.body.ui && req.body.ui.actual_price === undefined) {
    req.body.ui.actual_price = req.body.price;
  }

  next();
};
