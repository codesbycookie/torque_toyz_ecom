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

  // Handle form-data stringified numbers
  if (req.body.weight !== undefined) req.body.weight = Number(req.body.weight);
  if (req.body.stock !== undefined) req.body.stock = Number(req.body.stock);
  if (req.body.price !== undefined) req.body.price = Number(req.body.price);

  next();
};
