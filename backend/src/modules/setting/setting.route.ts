import { Router } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.js';
// import { accessControl } from '@core/middlewares/access.middleware.js'; // admin-only, strictly
import { zodValidate } from '@core/middlewares/zod.validator.js';
import { updateSettingSchema, bulkUpdateSettingsSchema } from './setting.validator.js';

import {
    getAllSettings,
    getSettingsGrouped,
    updateSetting,
    bulkUpdateSettings,
} from './setting.controller.ts';

const router = Router();

router.use(authMiddleware);
// router.use(accessControl); // admin only — settings should never be user-accessible

router.get('/', getSettingsGrouped); // powers the Settings page UI directly
router.get('/raw', getAllSettings); // flat list, for debugging/admin tools

router.put(
    '/:key',
    zodValidate(updateSettingSchema, 'body', 'UpdateSettingSchema'),
    updateSetting
);

router.put(
    '/bulk',
    zodValidate(bulkUpdateSettingsSchema, 'body', 'BulkUpdateSettingsSchema'),
    bulkUpdateSettings
);

export default router;