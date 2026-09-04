import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '@db/models/user.model.ts';
import Location from '@db/models/location.model.ts';
import Category from '@db/models/category.model.ts';
import Product from '@db/models/product.model.ts';
import Setting from '@db/models/setting.model.ts';
import Order from '@db/models/order.model.ts';
import Review from '@db/models/review.model.ts';
import Wishlist from '@db/models/wishlist.model.ts';
import Otp from '@db/models/otp.model.ts';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;
const COUNT = 100;

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round((min + Math.random() * (max - min)) * factor) / factor;
};
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

// ── Users (1 admin + 100 regular) ───────────────────────────────────────
// NOTE: one-by-one .save() — password hashing + username generation
// (pre('validate')) and login_id generation (pre('save')) all need
// real hooks to run.

const FIRST_NAMES = [
  'Arjun', 'Vikram', 'Rahul', 'Sanjay', 'Karthik', 'Suresh', 'Ganesh', 'Naveen',
  'Praveen', 'Arun', 'Deepak', 'Manoj', 'Ravi', 'Ajay', 'Vijay', 'Sathish',
  'Priya', 'Divya', 'Anitha', 'Lakshmi', 'Meena', 'Kavya', 'Swathi', 'Pooja',
  'Nithya', 'Bhavani', 'Suja', 'Revathi', 'Deepa', 'Uma',
];
const LAST_NAMES = [
  'Kumar', 'Raj', 'Sharma', 'Iyer', 'Nair', 'Pillai', 'Reddy', 'Rao', 'Menon',
  'Krishnan', 'Subramaniam', 'Venkatesh', 'Gupta', 'Verma', 'Chandran',
];

const eraseUsers = async () => {
  const result = await User.deleteMany({});
  console.log(`  erased   ${result.deletedCount} user(s)`);
};

const seedUsers = async () => {
  await new User({
    name: 'Super Admin',
    email: 'admin@torquetoyz.com',
    phone: '9999999999',
    password: 'Password@123',
    role: 'admin',
  }).save();
  console.log('  created  1 admin user');

  const created: any[] = [];
  for (let i = 0; i < COUNT; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const user = await new User({
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: `9${randInt(100000000, 999999999)}`,
      password: 'Password@123',
      role: 'user',
    }).save();
    created.push(user);
  }
  console.log(`  created  ${created.length} regular users`);
  return created;
};

// ── Locations (100) ──────────────────────────────────────────────────
// insertMany is safe here — Location has no pre('save') hook.

const INDIAN_STATES = [
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh',
  'Bihar', 'West Bengal', 'Odisha', 'Punjab', 'Haryana', 'Delhi', 'Assam',
  'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh', 'Goa',
  'Tripura', 'Manipur', 'Meghalaya', 'Nagaland', 'Mizoram', 'Sikkim',
];

const eraseLocations = async () => {
  const result = await Location.deleteMany({});
  console.log(`  erased   ${result.deletedCount} location(s)`);
};

const seedLocations = async () => {
  const locations: any[] = [];
  const usedCodes = new Set<string>();

  for (let i = 0; i < COUNT; i++) {
    const state = INDIAN_STATES[i % INDIAN_STATES.length];
    const zone = ['North', 'South', 'East', 'West', 'Central'][Math.floor(i / INDIAN_STATES.length) % 5];
    const label = i < INDIAN_STATES.length ? state : `${state} - ${zone} Zone`;

    let code = `${state.slice(0, 2).toUpperCase()}${i}`.slice(0, 6);
    while (usedCodes.has(code)) code = `${code}X`;
    usedCodes.add(code);

    const base = 25 + randInt(0, 30);
    locations.push({
      state: label,
      code,
      deliverable: Math.random() > 0.05,
      slabs: [
        { min: 0, max: 0.5, rate: base },
        { min: 0.5, max: 1, rate: base + 15 },
        { min: 1, max: 1.5, rate: base + 30 },
        { min: 1.5, max: 2, rate: base + 45 },
        { min: 2, max: 5, rate: base + 80 },
      ],
    });
  }

  const created = await Location.insertMany(locations);
  console.log(`  created  ${created.length} locations`);
  return created;
};

// ── Categories (20) ───────────────────────────────────────────────────
// NOTE: one-by-one .save() if Category has slug-generation in
// pre('save'), same reasoning as Product below. If it turns out
// Category has no such hook, this can safely switch to insertMany.

const CATEGORY_NAMES = [
  'Alloy Wheel', 'Shock Absorber', 'Brake Pad', 'Air Filter', 'Headlight Assembly',
  'Tail Light', 'Seat Cover', 'Floor Mat', 'Side Mirror', 'Bumper Guard',
  'Exhaust Muffler', 'Clutch Plate', 'Radiator', 'Battery', 'Spark Plug',
  'Wiper Blade', 'Horn', 'Fog Lamp', 'Roof Rack', 'Steering Wheel Cover',
];

const eraseCategories = async () => {
  const result = await Category.deleteMany({});
  console.log(`  erased   ${result.deletedCount} category(ies)`);
};

const seedCategories = async () => {
  const created: any[] = [];
  for (const name of CATEGORY_NAMES) {
    created.push(await new Category({ name }).save());
  }
  console.log(`  created  ${created.length} categories`);
  return created;
};

// ── Products (100 = 20 categories × 5 variants) ─────────────────────────
// NOTE: one-by-one .save() — code + slug generation live in pre('save'),
// which insertMany does NOT run, causing every doc to get code: null
// and collide on the unique index.

const VARIANTS = ['Standard', 'Pro', 'Sport', 'Deluxe', 'Off-Road'];

const eraseProducts = async () => {
  const result = await Product.deleteMany({});
  console.log(`  erased   ${result.deletedCount} product(s)`);
};

const seedProducts = async (categories: any[]) => {
  const specs: any[] = [];
  for (const category of categories) {
    for (const variant of VARIANTS) {
      specs.push({
        name: `${variant} ${category.name}`,
        category: category._id,
        description: `${variant} grade ${category.name.toLowerCase()} built for durability and performance.`,
        stock: randInt(0, 99),
        weight: randFloat(0.5, 10),
        price: randInt(20, 500) * 10, // ₹200–5000
        images: [
          'https://placehold.co/600x400?text=Product+1',
          'https://placehold.co/600x400?text=Product+2',
          'https://placehold.co/600x400?text=Product+3'
        ],
      });
    }
  } // 20 × 5 = 100

  const created: any[] = [];
  for (const p of specs) {
    created.push(await new Product(p).save());
  }
  console.log(`  created  ${created.length} products`);
  return created;
};

// ── Settings (100 = 11 real + 89 synthetic feature flags) ───────────────
// insertMany is safe — Setting has no pre('save') hook.

const REAL_SETTINGS = [
  { key: 'site_name', value: 'Torque Toyz', description: 'Store display name' },
  { key: 'support_email', value: '', description: 'Customer support email' },
  { key: 'support_phone', value: '', description: 'Customer support phone number' },
  { key: 'business_address', value: '', description: 'Registered business address' },
  { key: 'low_stock_threshold', value: 10, description: 'Stock level that triggers a low-stock warning' },
  { key: 'allow_cod', value: true, description: 'Whether cash-on-delivery is offered at checkout' },
  { key: 'allow_online_payment', value: true, description: 'Whether online payment is offered at checkout' },
  { key: 'min_order_amount', value: 0, description: 'Minimum order value required to checkout' },
  {
    key: 'default_product_images',
    value: [
      'https://placehold.co/600x400?text=Product+1',
      'https://placehold.co/600x400?text=Product+2',
      'https://placehold.co/600x400?text=Product+3',
    ],
    description: 'Fallback images used when a product has none',
  },
  { key: 'maintenance_mode', value: false, description: 'When true, storefront shows a maintenance page to non-admins' },
  { key: 'new_signups_enabled', value: true, description: 'Whether new customer registration is open' },
];

const eraseSettings = async () => {
  const result = await Setting.deleteMany({});
  console.log(`  erased   ${result.deletedCount} setting(s)`);
};

const seedSettings = async () => {
  const FEATURES = [
    'wishlist', 'reviews', 'coupons', 'referrals', 'chat_support', 'dark_mode',
    'social_login', 'guest_checkout', 'gift_wrap', 'bulk_orders',
  ];
  const synthetic: any[] = [];
  for (let i = 0; i < COUNT - REAL_SETTINGS.length; i++) {
    synthetic.push({
      key: `feature_${pick(FEATURES)}_${i}`,
      value: Math.random() > 0.5,
      description: `Auto-generated test flag for seeding purposes (#${i})`,
    });
  }

  const created = await Setting.insertMany([...REAL_SETTINGS, ...synthetic]);
  console.log(`  created  ${created.length} settings`);
  return created;
};

// ── Orders (100) ─────────────────────────────────────────────────────────
// NOTE: one-by-one .save() — code generation + status_history seeding
// both live in pre('save'), which insertMany does not run.

const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
const PAYMENT_METHODS = ['cod', 'online'] as const;

const eraseOrders = async () => {
  const result = await Order.deleteMany({});
  console.log(`  erased   ${result.deletedCount} order(s)`);
};

const seedOrders = async (users: any[], products: any[], locations: any[]) => {
  const deliverableLocations = locations.filter((l) => l.deliverable);
  const created: any[] = [];

  for (let i = 0; i < COUNT; i++) {
    const user = pick(users);
    const location = deliverableLocations.length ? pick(deliverableLocations) : locations[0];
    const itemCount = randInt(1, 4);

    const chosenIdx = new Set<number>();
    while (chosenIdx.size < itemCount) chosenIdx.add(randInt(0, products.length - 1));

    const items: any[] = [];
    let subtotal = 0;
    let totalWeight = 0;

    for (const idx of chosenIdx) {
      const product = products[idx];
      const quantity = randInt(1, 3);
      items.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        weight: product.weight,
        quantity,
      });
      subtotal += product.price * quantity;
      totalWeight += product.weight * quantity;
    }

    const slab =
      location.slabs.find((s: any) => totalWeight > s.min && totalWeight <= s.max) ??
      location.slabs[location.slabs.length - 1];
    const shippingCost = slab.rate;
    const status = pick(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']);
    const paymentMethod = pick(['cod', 'online']);

    const order = await new Order({
      user: user._id,
      items,
      shipping_address: {
        door: `${randInt(1, 200)}`,
        street: `${randInt(1, 20)}th Cross Street`,
        city: 'Chennai',
        state: location._id,
        pincode: randInt(600001, 600120),
      },
      pricing: {
        subtotal,
        total_weight: totalWeight,
        shipping_cost: shippingCost,
        total: subtotal + shippingCost,
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : pick(['pending', 'paid', 'failed'] as const),
      },
      status,
    }).save();

    created.push(order);
  }

  console.log(`  created  ${created.length} orders`);
  return created;
};

// ── Reviews (up to 100 — only against delivered orders, unique per user+product) ─

const eraseReviews = async () => {
  const result = await Review.deleteMany({});
  console.log(`  erased   ${result.deletedCount} review(s)`);
};

const seedReviews = async (orders: any[]) => {
  const delivered = orders.filter((o) => o.status === 'delivered');
  const seen = new Set<string>();
  const reviews: any[] = [];
  const comments = [
    'Great quality, fits perfectly.',
    'Exactly as described, fast shipping.',
    'Good value for the price.',
    'Not bad, but expected better finish.',
    'Excellent product, highly recommend!',
    'Works well so far.',
    'Decent quality for the price point.',
  ];

  outer: for (const order of delivered) {
    for (const item of order.items) {
      const key = `${item.product}_${order.user}`;
      if (seen.has(key)) continue;
      seen.add(key);
      reviews.push({
        product: item.product,
        user: order.user,
        rating: randInt(2, 5),
        comment: pick(comments),
      });
      if (reviews.length >= COUNT) break outer;
    }
  }

  if (reviews.length === 0) {
    console.log('  skipped  no delivered orders to review yet');
    return [];
  }

  // insertMany is safe here — Review has no pre('save') hook,
  // and duplicates are already de-duplicated via `seen` above.
  const created = await Review.insertMany(reviews);
  console.log(`  created  ${created.length} reviews`);
  return created;
};

// ── Wishlists (up to 100 users) ───────────────────────────────────────────
// insertMany is safe — Wishlist has no pre('save') hook.

const eraseWishlists = async () => {
  const result = await Wishlist.deleteMany({});
  console.log(`  erased   ${result.deletedCount} wishlist(s)`);
};

const seedWishlists = async (users: any[], products: any[]) => {
  const wishlistUsers = users.slice(0, Math.min(COUNT, users.length));
  const docs: any[] = [];

  for (const user of wishlistUsers) {
    const count = randInt(1, 5);
    const chosen = new Set<number>();
    while (chosen.size < count) chosen.add(randInt(0, products.length - 1));

    docs.push({
      user: user._id,
      products: [...chosen].map((i) => products[i]._id),
    });
  }

  const created = await Wishlist.insertMany(docs);
  console.log(`  created  ${created.length} wishlists`);
  return created;
};

// ── OTPs (100) ─────────────────────────────────────────────────────────
// Uses the model's own `generate` static, which already handles hashing.

const eraseOtps = async () => {
  const result = await Otp.deleteMany({});
  console.log(`  erased   ${result.deletedCount} otp(s)`);
};

const seedOtps = async (users: any[]) => {
  const purposes = ['login', 'password_reset', 'phone_verification', 'email_verification'] as const;
  let created = 0;

  for (let i = 0; i < COUNT; i++) {
    const user = pick(users);
    await Otp.generate(user.email, pick(['login', 'password_reset', 'phone_verification', 'email_verification']));
    created++;
  }
  console.log(`  created  ${created} otps`);
};

// ── Run ──────────────────────────────────────────────────────────────

const run = async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  console.log('Users...');
  await eraseUsers();
  const users = await seedUsers();

  console.log('\nLocations...');
  await eraseLocations();
  const locations = await seedLocations();

  console.log('\nCategories...');
  await eraseCategories();
  const categories = await seedCategories();

  console.log('\nProducts...');
  await eraseProducts();
  const products = await seedProducts(categories);

  console.log('\nSettings...');
  await eraseSettings();
  await seedSettings();

  console.log('\nOrders...');
  await eraseOrders();
  const orders = await seedOrders(users, products, locations);

  console.log('\nReviews...');
  await eraseReviews();
  await seedReviews(orders);

  console.log('\nWishlists...');
  await eraseWishlists();
  await seedWishlists(users, products);

  console.log('\nOTPs...');
  await eraseOtps();
  await seedOtps(users);

  console.log('\nSeed complete — ~100 records per collection.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});