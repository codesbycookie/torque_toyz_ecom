import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '@db/models/user.model.ts';
import Location from '@db/models/location.model.ts';
import Product from '@db/models/product.model.ts';
import Setting from '@db/models/setting.model.ts';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const seedAdmin = async () => {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
        console.log('  skipped  admin user already exists');
        return;
    }

    await new User({
        name: 'Super Admin',
        email: 'admin@torquetoyz.com',
        phone: '9999999999',
        password: 'ChangeMe@123', // pre('validate') hook hashes this automatically
        role: 'admin',
    }).save();

    console.log('  created  admin user (login_id auto-generated, check logs/db)');
};

const seedLocations = async () => {
    const existing = await Location.countDocuments();
    if (existing > 0) {
        console.log('  skipped  locations already seeded');
        return;
    }

    const locations = [
        {
            state: 'Tamil Nadu',
            code: 'TN',
            deliverable: true,
            slabs: [
                { min: 0, max: 0.5, rate: 30 },
                { min: 0.5, max: 1, rate: 45 },
                { min: 1, max: 1.5, rate: 60 },
                { min: 1.5, max: 2, rate: 75 },
            ],
        },
        {
            state: 'Kerala',
            code: 'KL',
            deliverable: true,
            slabs: [
                { min: 0, max: 0.5, rate: 40 },
                { min: 0.5, max: 1, rate: 60 },
                { min: 1, max: 1.5, rate: 80 },
                { min: 1.5, max: 2, rate: 100 },
            ],
        },
        {
            state: 'Karnataka',
            code: 'KA',
            deliverable: true,
            slabs: [
                { min: 0, max: 0.5, rate: 35 },
                { min: 0.5, max: 1, rate: 50 },
                { min: 1, max: 1.5, rate: 65 },
                { min: 1.5, max: 2, rate: 80 },
            ],
        },
    ];

    await Location.insertMany(locations);
    console.log(`  created  ${locations.length} locations with tariff slabs`);
};

const seedProducts = async () => {
    const existing = await Product.countDocuments();
    if (existing > 0) {
        console.log('  skipped  products already seeded');
        return;
    }

    const products = [
        {
            name: 'Sample Product One',
            description: 'A placeholder product for testing the catalog.',
            stock: 25,
        },
        {
            name: 'Sample Product Two',
            description: 'Another placeholder product for testing.',
            stock: 10,
        },
    ];

    await Product.insertMany(products);
    console.log(`  created  ${products.length} sample products`);
};

const seedSettings = async () => {
    const DEFAULT_SETTINGS = [
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

    let created = 0;
    for (const setting of DEFAULT_SETTINGS) {
        const result = await Setting.findOneAndUpdate(
            { key: setting.key },
            { $setOnInsert: setting },
            { upsert: true, new: true, rawResult: true }
        );
        if (!(result as any).lastErrorObject?.updatedExisting) created++;
    }

    console.log(`  created  ${created} new settings (rest already existed)`);
};

const run = async () => {
    if (!MONGO_URI) {
        console.error('MONGO_URI is missing in .env');
        process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.\n');

    console.log('Seeding admin user...');
    await seedAdmin();

    console.log('\nSeeding locations...');
    await seedLocations();

    console.log('\nSeeding products...');
    await seedProducts();

    console.log('\nSeeding settings...');
    await seedSettings();

    console.log('\nSeed complete.');
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});