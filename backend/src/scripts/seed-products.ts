import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '@db/models/category.model.ts';
import Product from '@db/models/product.model.ts';
import Order from '@db/models/order.model.ts';
import Review from '@db/models/review.model.ts';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round((min + Math.random() * (max - min)) * factor) / factor;
};
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

const CATEGORY_NAMES = [
  '1:18 Diecast Hypercars', 'Formula 1 Collectibles', 'RC Drift Cars 4WD',
  'Endurance & GT Racers', 'Classic Muscle & Roadsters', 'Supercars & Exotics',
  'RC Crawlers & Buggies', 'Precision Scale Models', 'Tuning & Performance',
  'Alloy Wheels & Slicks', 'Brushless Motors & ESCs', 'Pit Lane Accessories',
  'Championship Liveries', 'JDM Street Icons', 'European GT Racers',
  'Aerodynamic Body Kits', 'RC Radios & Controls', 'LiPo Fast Chargers',
  'Collector Display Cases', 'Limited Edition Releases'
];

const VARIANTS = ['Standard', 'Pro', 'Sport', 'Deluxe', 'Off-Road'];

const CAR_IMAGES = [
  '/cars/gt3_rs.jpg',
  '/cars/redbull_f1.jpg',
  '/cars/rx7_lbwk.jpg',
  '/cars/bmw_m4_gt3.jpg',
  '/cars/daytona_sp3.jpg',
  '/cars/ferrari_499p.jpg',
  '/cars/r34_gtr.jpg',
  '/cars/shelby_cobra.jpg',
];

const BADGES_LIST = [
  ['Best Seller'],
  ['New Arrival'],
  ['Hot'],
  ['Limited Edition'],
  ['Trending'],
  ['Top Rated'],
  ['Exclusive'],
  [],
];

const run = async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully.');

  let categories = await Category.find({});
  if (!categories.length) {
    console.log('No categories found. Creating 20 categories...');
    for (const name of CATEGORY_NAMES) {
      categories.push(await new Category({ name }).save());
    }
    console.log(`Created ${categories.length} categories.`);
  } else {
    console.log(`Found ${categories.length} existing categories.`);
  }

  // Use up to 20 categories to generate 100 products (20 * 5)
  const activeCategories = categories.slice(0, 20);

  console.log('Erasing old products...');
  const delResult = await Product.deleteMany({});
  console.log(`Erased ${delResult.deletedCount} old products.`);

  console.log('Seeding products with UI configuration...');
  const specs: any[] = [];
  let imgIndex = 0;

  for (const category of activeCategories) {
    for (const variant of VARIANTS) {
      const img1 = CAR_IMAGES[imgIndex % CAR_IMAGES.length];
      const img2 = CAR_IMAGES[(imgIndex + 1) % CAR_IMAGES.length];
      const img3 = CAR_IMAGES[(imgIndex + 2) % CAR_IMAGES.length];
      imgIndex++;

      const price = randInt(20, 500) * 10;
      const hasDiscount = Math.random() > 0.3;
      const slash_price = hasDiscount ? Math.round(price * (1 + randFloat(0.15, 0.4))) : price;
      const is_trending = Math.random() < 0.25;
      const badges = pick(BADGES_LIST);

      specs.push({
        name: `${variant} ${category.name}`,
        category: category._id,
        description: `${variant} edition ${category.name.toLowerCase()} precision built for collectors with authentic racing aerodynamic details and display case.`,
        stock: randInt(4, 99),
        weight: randFloat(0.5, 3.5),
        price,
        images: [img1, img2, img3],
        ui: {
          actual_price: price,
          slash_price,
          badges,
          is_trending,
        },
      });
    }
  }

  const createdProducts: any[] = [];
  for (const p of specs) {
    createdProducts.push(await new Product(p).save());
  }
  console.log(`Successfully created ${createdProducts.length} products with UI settings!`);

  // Relink orders
  const orders = await Order.find({});
  if (orders.length > 0) {
    console.log(`Relinking ${orders.length} orders to new products...`);
    for (const order of orders) {
      if (order.items && order.items.length > 0) {
        order.items = order.items.map((item: any) => {
          const randomProduct = pick(createdProducts);
          return {
            product: randomProduct._id,
            name: randomProduct.name,
            image: randomProduct.images?.[0] || '/cars/gt3_rs.jpg',
            price: randomProduct.price,
            weight: randomProduct.weight || 1,
            quantity: item.quantity || 1,
          };
        });
        await order.save();
      }
    }
    console.log('Orders relinked successfully.');
  }

  // Relink reviews
  const reviews = await Review.find({});
  if (reviews.length > 0) {
    console.log(`Relinking ${reviews.length} reviews to new products...`);
    const usedPairs = new Set<string>();
    for (const review of reviews) {
      const availableProduct = createdProducts.find(
        (p) => !usedPairs.has(`${p._id}_${review.user}`)
      );
      if (availableProduct) {
        usedPairs.add(`${availableProduct._id}_${review.user}`);
        review.product = availableProduct._id;
        await review.save();
      } else {
        await Review.deleteOne({ _id: review._id });
      }
    }
    console.log('Reviews relinked successfully.');
  }

  console.log('\nProduct re-seed complete!');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Re-seed products failed:', err);
  process.exit(1);
});
