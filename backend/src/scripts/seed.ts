import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '@db/models/user.model.ts';
import Location from '@db/models/location.model.ts';
import Category from '@db/models/category.model.ts';
import Product from '@db/models/product.model.ts';
import Setting from '@db/models/setting.model.ts';
import Order from '@db/models/order.model.ts';
import Payment from '@db/models/payment.model.ts';
import Cart from '@db/models/cart.model.ts';
import Review from '@db/models/review.model.ts';
import Wishlist from '@db/models/wishlist.model.ts';
import Otp from '@db/models/otp.model.ts';
import { Counter } from '@db/models/counter.model.ts';
import { ErrorLog } from '@db/models/errorlog.model.ts';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;
const COUNT = 100;

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round((min + Math.random() * (max - min)) * factor) / factor;
};
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const randHex = (len: number) => {
  let str = '';
  while (str.length < len) str += Math.random().toString(36).substring(2);
  return str.substring(0, len);
};

// ── Counters & ErrorLogs ────────────────────────────────────────────────
const eraseCounters = async () => {
  const result = await Counter.deleteMany({});
  console.log(`  erased   ${result.deletedCount} counter(s)`);
};

const eraseErrorLogs = async () => {
  const result = await ErrorLog.deleteMany({});
  console.log(`  erased   ${result.deletedCount} error log(s)`);
};

// ── Locations (100) ─────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Kerala', 'Delhi',
  'Telangana', 'Gujarat', 'West Bengal', 'Rajasthan', 'Uttar Pradesh',
  'Andhra Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Goa',
  'Odisha', 'Bihar', 'Assam', 'Chandigarh', 'Uttarakhand',
  'Himachal Pradesh', 'Jharkhand', 'Chhattisgarh', 'Puducherry',
  'Jammu and Kashmir', 'Tripura', 'Manipur', 'Meghalaya', 'Nagaland',
  'Goa', 'Sikkim', 'Arunachal Pradesh', 'Mizoram', 'Ladakh',
  'Andaman and Nicobar Islands', 'Lakshadweep'
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
    const label = i < INDIAN_STATES.length ? state : `${state} - ${zone} Hub`;

    let code = `${state.slice(0, 2).toUpperCase()}${i}`.slice(0, 6);
    while (usedCodes.has(code)) code = `${code}X`;
    usedCodes.add(code);

    // Keep Lakshadweep and remote zones occasionally non-deliverable for restriction testing
    const isRestricted = state === 'Lakshadweep' || state === 'Andaman and Nicobar Islands' && i >= INDIAN_STATES.length;
    const base = 25 + randInt(0, 30);

    locations.push({
      state: label,
      code,
      deliverable: !isRestricted,
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

// ── Users (1 admin + 1 primary test user + 100 regular) ─────────────────
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

const seedUsers = async (locations: any[]) => {
  const deliverable = locations.find((l) => l.deliverable) || locations[0];

  // 1. Super Admin
  await new User({
    name: 'Super Admin',
    email: 'admin@torquetoyz.com',
    phone: '9999999999',
    password: 'Password@123',
    role: 'admin',
    address: {
      door: '1A',
      street: 'HQ Tech Park',
      city: 'Admin City',
      state: deliverable._id,
      pincode: 110001,
    },
    addresses: [
      {
        label: 'HQ Office',
        name: 'Super Admin',
        phone: '9999999999',
        door: '1A',
        street: 'HQ Tech Park',
        city: 'Admin City',
        state: deliverable._id,
        pincode: 110001,
        is_default: true,
      },
    ],
  }).save();
  console.log('  created  1 admin user (admin@torquetoyz.com / Password@123)');

  // 2. Primary Customer User
  const primaryUser = await new User({
    name: 'Torquetoyzz',
    email: 'torquetoyzz@gmail.com',
    phone: '9840402938',
    password: '@Harisha260206',
    role: 'user',
    address: {
      door: '42B',
      street: 'Pit Lane Circuit',
      city: 'Chennai',
      state: deliverable._id,
      pincode: 600028,
    },
    addresses: [
      {
        label: 'Home',
        name: 'Torquetoyzz Collector',
        phone: '9840402938',
        door: '42B',
        street: 'Pit Lane Circuit',
        city: 'Chennai',
        state: deliverable._id,
        pincode: 600028,
        is_default: true,
      },
      {
        label: 'Track Garage',
        name: 'Torquetoyzz Racing Pit',
        phone: '9840402938',
        door: 'Bay 7',
        street: 'Grand Prix Boulevard',
        city: 'Chennai',
        state: deliverable._id,
        pincode: 602105,
        is_default: false,
      },
    ],
  }).save();
  console.log('  created  1 primary user (torquetoyzz@gmail.com / @Harisha260206)');

  // 3. Regular Users
  const created: any[] = [primaryUser];
  for (let i = 0; i < COUNT; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const loc = pick(locations);
    const fullName = `${first} ${last}`;
    const userPhone = `9${randInt(100000000, 999999999)}`;
    const userDoor = `${randInt(1, 500)}`;
    const userStreet = `${pick(FIRST_NAMES)} Avenue`;
    const userCity = `${loc.state.split(' - ')[0]} City`;
    const userPincode = randInt(100000, 999999);

    const user = await new User({
      name: fullName,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: userPhone,
      password: 'Password@123',
      role: 'user',
      address: {
        door: userDoor,
        street: userStreet,
        city: userCity,
        state: loc._id,
        pincode: userPincode,
      },
      addresses: [
        {
          label: 'Home',
          name: fullName,
          phone: userPhone,
          door: userDoor,
          street: userStreet,
          city: userCity,
          state: loc._id,
          pincode: userPincode,
          is_default: true,
        },
      ],
    }).save();
    created.push(user);
  }
  console.log(`  created  ${created.length} regular users`);
  return created;
};

// ── Categories (20) ─────────────────────────────────────────────────────
const CATEGORY_NAMES = [
  '1:18 Diecast Hypercars', 'Formula 1 Collectibles', 'RC Drift Cars 4WD',
  'Endurance & GT Racers', 'Classic Muscle & Roadsters', 'Supercars & Exotics',
  'RC Crawlers & Buggies', 'Precision Scale Models', 'Tuning & Performance',
  'Alloy Wheels & Slicks', 'Brushless Motors & ESCs', 'Pit Lane Accessories',
  'Championship Liveries', 'JDM Street Icons', 'European GT Racers',
  'Aerodynamic Body Kits', 'RC Radios & Controls', 'LiPo Fast Chargers',
  'Collector Display Cases', 'Limited Edition Releases'
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

const eraseProducts = async () => {
  const result = await Product.deleteMany({});
  console.log(`  erased   ${result.deletedCount} product(s)`);
};

const seedProducts = async (categories: any[]) => {
  const specs: any[] = [];
  let imgIndex = 0;

  for (const category of categories) {
    for (const variant of VARIANTS) {
      const img1 = CAR_IMAGES[imgIndex % CAR_IMAGES.length];
      const img2 = CAR_IMAGES[(imgIndex + 1) % CAR_IMAGES.length];
      const img3 = CAR_IMAGES[(imgIndex + 2) % CAR_IMAGES.length];
      imgIndex++;

      // Paisa prices configured for Razorpay test transactions (0.10 to 1.00 INR)
      const PAISA_PRICES = [0.10, 0.20, 0.25, 0.35, 0.50, 0.65, 0.75, 0.80, 0.90, 0.99, 1.00];
      const price = pick(PAISA_PRICES);
      const hasDiscount = Math.random() > 0.3;
      const slash_price = hasDiscount ? Number((price + pick([0.25, 0.50, 0.75, 1.00])).toFixed(2)) : price;
      const is_trending = Math.random() < 0.25;
      const badges = pick(BADGES_LIST);

      specs.push({
        name: `${variant} ${category.name}`,
        category: category._id,
        description: `${variant} edition ${category.name.toLowerCase()} precision built for collectors with authentic racing aerodynamics and acrylic display case.`,
        stock: randInt(8, 99),
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

  const created: any[] = [];
  for (const p of specs) {
    created.push(await new Product(p).save());
  }
  console.log(`  created  ${created.length} products`);
  return created;
};

// ── Settings (100 = real + synthetic feature flags) ────────────────────
const REAL_SETTINGS = [
  { key: 'free_delivery', value: false, description: 'Whether delivery/shipping is free of cost for all orders' },
  { key: 'support_phone', value: '9840402938', description: 'Customer support phone number' },
  { key: 'business_address', value: '42B Pit Lane Circuit, Chennai, Tamil Nadu - 600028', description: 'Registered business address' },
  { key: 'low_stock_threshold', value: 10, description: 'Stock level that triggers a low-stock warning' },
  { key: 'gst_percentage', value: 18, description: 'GST rate percentage applied to orders' },
  { key: 'allow_cod', value: true, description: 'Whether cash-on-delivery is offered at checkout' },
  { key: 'allow_online_payment', value: true, description: 'Whether online payment is offered at checkout' },
  { key: 'min_order_amount', value: 0, description: 'Minimum order value required to checkout' },
  {
    key: 'default_product_images',
    value: [
      '/cars/gt3_rs.jpg',
      '/cars/redbull_f1.jpg',
      '/cars/bmw_m4_gt3.jpg',
    ],
    description: 'Fallback images used when a product has none',
  },
  { key: 'new_signups_enabled', value: true, description: 'Whether new customer registration is open' },
  { key: 'ecom_announcement_banner', value: '⚡ SPECIAL OFFER: Get 10% off + Free Shipping on orders over ₹999!', description: 'Announcement banner text displayed at top of storefront' },
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

// ── Orders & Payments ──────────────────────────────────────────────────
const eraseOrdersAndPayments = async () => {
  const pResult = await Payment.deleteMany({});
  const oResult = await Order.deleteMany({});
  console.log(`  erased   ${oResult.deletedCount} order(s)`);
  console.log(`  erased   ${pResult.deletedCount} payment(s)`);
};

const seedOrdersAndPayments = async (users: any[], products: any[], locations: any[]) => {
  const deliverableLocations = locations.filter((l) => l.deliverable);
  const createdOrders: any[] = [];
  const createdPayments: any[] = [];

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
    const subtotalFormatted = Math.round(subtotal * 100) / 100;
    const totalFormatted = Math.round((subtotalFormatted + shippingCost) * 100) / 100;

    const status = pick(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const);
    const paymentMethod = pick(['cod', 'online'] as const);

    let paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
    if (status === 'delivered' || status === 'shipped') {
      paymentStatus = 'paid';
    } else if (status === 'cancelled') {
      paymentStatus = Math.random() > 0.5 ? 'cancelled' : 'failed';
    } else if (status === 'confirmed') {
      paymentStatus = paymentMethod === 'online' ? 'paid' : 'pending';
    } else {
      paymentStatus = paymentMethod === 'cod' ? 'pending' : pick(['pending', 'paid', 'failed'] as const);
    }

    const rzpOrderId = paymentMethod === 'online' ? `order_rzp_${randHex(14)}` : undefined;
    const txnId = paymentStatus === 'paid' ? `pay_rzp_${randHex(14)}` : undefined;

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
        subtotal: subtotalFormatted,
        total_weight: Math.round(totalWeight * 100) / 100,
        shipping_cost: shippingCost,
        total: totalFormatted,
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        razorpay_order_id: rzpOrderId,
        transaction_id: txnId,
      },
      status,
    }).save();

    // Spread orders over past 180 days
    const randomDaysAgo = Math.floor(Math.pow(Math.random(), 2) * 180);
    const randomHoursAgo = pick([10, 11, 14, 15, 18, 19, 20, 21]);
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - randomDaysAgo);
    pastDate.setHours(randomHoursAgo);

    await Order.collection.updateOne(
      { _id: order._id },
      { $set: { createdAt: pastDate, updatedAt: pastDate } }
    );

    // If online payment, create matching Payment document in Payment collection
    if (paymentMethod === 'online' && rzpOrderId) {
      let pStatus: 'created' | 'paid' | 'failed' | 'cancelled';
      if (paymentStatus === 'paid') pStatus = 'paid';
      else if (paymentStatus === 'cancelled') pStatus = 'cancelled';
      else if (paymentStatus === 'failed') pStatus = 'failed';
      else pStatus = 'created';

      const paymentDoc = await Payment.create({
        order: order._id,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: txnId,
        amount: totalFormatted,
        currency: 'INR',
        status: pStatus,
        createdAt: pastDate,
        updatedAt: pastDate,
      });
      createdPayments.push(paymentDoc);
    }

    createdOrders.push(order);
  }

  console.log(`  created  ${createdOrders.length} orders`);
  console.log(`  created  ${createdPayments.length} payments`);
  return createdOrders;
};

// ── Carts ───────────────────────────────────────────────────────────────
const eraseCarts = async () => {
  const result = await Cart.deleteMany({});
  console.log(`  erased   ${result.deletedCount} cart(s)`);
};

const seedCarts = async (users: any[], products: any[]) => {
  const primaryUser = users.find((u) => u.email === 'torquetoyzz@gmail.com') || users[0];
  const sampleProducts = products.slice(0, 2);
  const items = sampleProducts.map((p) => ({
    product: p._id,
    name: p.name,
    image: p.images[0],
    price: p.price,
    weight: p.weight,
    quantity: 1,
  }));
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const totalWeight = Math.round(items.reduce((sum, item) => sum + item.weight * item.quantity, 0) * 100) / 100;

  await Cart.create({
    user: primaryUser._id,
    items,
    pricing: {
      subtotal,
      tax: 0,
      total_weight: totalWeight,
      shipping_cost: 0,
      total: subtotal,
    },
    active: true,
    deleted: false,
  });
  console.log('  created  1 active cart for primary user');
};

// ── Reviews ─────────────────────────────────────────────────────────────
const eraseReviews = async () => {
  const result = await Review.deleteMany({});
  console.log(`  erased   ${result.deletedCount} review(s)`);
};

const seedReviews = async (orders: any[]) => {
  const delivered = orders.filter((o) => o.status === 'delivered');
  const seen = new Set<string>();
  const reviews: any[] = [];
  const comments = [
    'Outstanding precision detailing! Perfect replica for my showcase.',
    'Flawless paint finish and smooth rolling rubber tires. Fast dispatch.',
    'Great build quality for the price. The livery lines are razor sharp.',
    'Packaged with exceptional care in pristine foam display box. Highly recommended!',
    'Exceeded expectations! Beautiful aerodynamic profile and working cockpit parts.',
    'Stunning addition to my GT3 collection. Truly authentic diecast craftsmanship.',
    'Solid weight and clean contours. Very satisfied with this purchase.',
  ];

  outer: for (const order of delivered) {
    for (const item of order.items) {
      const key = `${item.product}_${order.user}`;
      if (seen.has(key)) continue;
      seen.add(key);
      reviews.push({
        product: item.product,
        user: order.user,
        rating: randInt(4, 5),
        comment: pick(comments),
      });
      if (reviews.length >= COUNT) break outer;
    }
  }

  if (reviews.length === 0) {
    console.log('  skipped  no delivered orders to review');
    return [];
  }

  const created = await Review.insertMany(reviews);
  console.log(`  created  ${created.length} reviews`);
  return created;
};

// ── Wishlists ───────────────────────────────────────────────────────────
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

// ── OTPs ────────────────────────────────────────────────────────────────
const eraseOtps = async () => {
  const result = await Otp.deleteMany({});
  console.log(`  erased   ${result.deletedCount} otp(s)`);
};

const seedOtps = async (users: any[]) => {
  let created = 0;
  for (let i = 0; i < 30; i++) {
    const user = pick(users);
    await Otp.generate(user.email, pick(['login', 'password_reset', 'phone_verification', 'email_verification']));
    created++;
  }
  console.log(`  created  ${created} otps`);
};

// ── Main Pipeline ───────────────────────────────────────────────────────
const run = async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully.\n');

  console.log('Resetting Counters & Error Logs...');
  await eraseCounters();
  await eraseErrorLogs();

  console.log('\nLocations...');
  await eraseLocations();
  const locations = await seedLocations();

  console.log('\nUsers...');
  await eraseUsers();
  const users = await seedUsers(locations);

  console.log('\nCategories...');
  await eraseCategories();
  const categories = await seedCategories();

  console.log('\nProducts...');
  await eraseProducts();
  const products = await seedProducts(categories);

  console.log('\nSettings...');
  await eraseSettings();
  await seedSettings();

  console.log('\nOrders & Payments...');
  await eraseOrdersAndPayments();
  const orders = await seedOrdersAndPayments(users, products, locations);

  console.log('\nCarts...');
  await eraseCarts();
  await seedCarts(users, products);

  console.log('\nReviews...');
  await eraseReviews();
  await seedReviews(orders);

  console.log('\nWishlists...');
  await eraseWishlists();
  await seedWishlists(users, products);

  console.log('\nOTPs...');
  await eraseOtps();
  await seedOtps(users);

  console.log('\n🎉 Comprehensive database reseed completed across all 13 collections!');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed pipeline failed:', err);
  process.exit(1);
});
