import mongoose from 'mongoose';
import { Counter } from '@db/models/counter.model.ts';
import { ErrorLog } from '@db/models/errorlog.model.ts';
import { ENV } from '@config/env.config.ts';

const MONGODB_URI = ENV.MONGO_URI || 'mongodb://localhost:27017/torque_toyz_ecom_db';

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // Clear counters and logs
    console.log('🧹 Clearing Counter and ErrorLog collections...');
    await Counter.deleteMany({});
    await ErrorLog.deleteMany({});

    console.log('✅ Base infrastructure collections cleared.');
    console.log('🎉 Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
