import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
let outputBuffer = '';

const args = process.argv.slice(2);

const child = spawn('npx', ['vitest', 'run', ...args], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: { ...process.env, NODE_ENV: 'test' },
});

child.stdout.on('data', (data) => {
  process.stdout.write(data);
  outputBuffer += data.toString();
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
  outputBuffer += data.toString();
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error('\n❌ Tests failed. Saving error log...');

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFileName = `test_error_${timestamp}.log`;
    const logFilePath = path.join(logsDir, logFileName);

    // Strip ANSI color codes to make the log file readable
    const cleanOutput = outputBuffer.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');

    fs.writeFileSync(logFilePath, `Test Run Failed at ${new Date().toISOString()} with exit code ${code}\n\n${cleanOutput}`);

    console.error(`Error log saved to ${logFilePath}`);
    process.exit(code);
  }
});
