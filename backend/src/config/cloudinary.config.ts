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
        if (req.baseUrl.includes('/users')) {
          folder = 'torque_toyz/users';
        } else if (req.baseUrl.includes('/products')) {
          folder = 'torque_toyz/products';
        }
        
        return {
          folder: folder,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
      },
    });

export const upload = multer({ storage: storage });
