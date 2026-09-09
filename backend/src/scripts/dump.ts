import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

function generateMongoDump() {
  console.log('🔄 Starting native mongodump process...');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGO_URI is not defined in the environment variables.');
    process.exit(1);
  }

  const dumpsDir = path.join(process.cwd(), 'dumps');
  if (!fs.existsSync(dumpsDir)) {
    fs.mkdirSync(dumpsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(dumpsDir, `mongodump_${timestamp}.gz`);

  try {
    console.log(`📦 Running mongodump...`);
    // Run the native mongodump command with archive and gzip flags
    execSync(`mongodump --uri="${mongoUri}" --archive="${outputFile}" --gzip`, { stdio: 'inherit' });
    console.log(`\n✅ Database successfully dumped and zipped to ${outputFile}`);
  } catch (error) {
    console.error('\n❌ Error executing mongodump. Please make sure MongoDB Database Tools are installed and available in your system PATH.', error);
    process.exit(1);
  }
}

generateMongoDump();
