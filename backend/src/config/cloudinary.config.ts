import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { ENV } from './env.config.ts';

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

const storage = ENV.NODE_ENV === 'test'
  ? multer.memoryStorage()
  : new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        // Determine the folder based on the route
        let folder = 'torque_toyz/misc';
        let public_id = `${Date.now()}-${file.originalname.split('.')[0]}`;

        if (req.baseUrl.includes('/users')) {
          folder = 'torque_toyz/users';
        } else if (req.baseUrl.includes('/products')) {
          // Clean the product name (e.g., "Hot Wheels!" -> "hot-wheels")
          const cleanName = req.body.name 
            ? req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
            : 'unknown-product';
            
          folder = `torque_toyz/products/${cleanName}`;
          
          // Keep a counter on the request to number the images 1, 2, 3, etc.
          // @ts-ignore
          req._fileCounter = (req._fileCounter || 0) + 1;
          // @ts-ignore
          public_id = `${cleanName}_${req._fileCounter}`;
        }
        
        return {
          folder: folder,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          public_id: public_id,
        };
      },
    });

export const upload = multer({ storage: storage });
