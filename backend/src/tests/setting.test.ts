import { describe, it, beforeAll, afterAll } from 'vitest';
import { expect } from 'vitest';
import { bootstrap } from '../app.ts';
import Setting from '@db/models/setting.model.ts';
import { tester } from '@core/constants/tester.constant.ts';

const baseRoute = '/api/v1/settings';

let token: string;
let cleanupAdmin: () => Promise<void>;

beforeAll(async () => {
  await bootstrap();
  const setup = await tester.setupAdmin();
  token = setup.token;
  cleanupAdmin = setup.cleanup;

  await Setting.findOneAndUpdate(
    { key: 'low_stock_threshold' },
    { $set: {  value: 10 } },
    { upsert: true }
  );
});

afterAll(async () => {
  if (cleanupAdmin) await cleanupAdmin();
  await Setting.findOneAndUpdate({ key: 'low_stock_threshold' }, { $set: { value: 10 } }); // reset for next run
});

describe('Settings API Endpoint Suite', () => {
  it('should reject requests without authorization header', async () => {
    const res = await tester.get(baseRoute);
    tester.assertUnauthorized(res, 'Unauthenticated');
  });

  it('should successfully fetch grouped settings', async () => {
    const res = await tester.get(baseRoute, token);
    tester.assertFetched(res, 'settings');
    expect(res.body.data.orders.low_stock_threshold).to.equal(10);
  });

  it('should successfully update a single setting', async () => {
    const res = await tester.put(`${baseRoute}/low_stock_threshold`, { value: 15 }, token);
    tester.assertUpdated(res, 'setting', (data) => {
      expect(data.value).to.equal(15);
    });
  });

  it('should successfully bulk update multiple settings', async () => {
    const res = await tester.put(
      `${baseRoute}/bulk`,
      {
        settings: [
          { key: 'low_stock_threshold', value: 20 },
          { key: 'maintenance_mode', value: true },
        ],
      },
      token
    );
    tester.assertUpdated(res, 'settings');

    const check = await tester.get(baseRoute, token);
    tester.assertFetched(check, 'settings');
    expect(check.body.data.orders.low_stock_threshold).to.equal(20);
    expect(check.body.data.site.maintenance_mode).to.equal(true);
  });
});