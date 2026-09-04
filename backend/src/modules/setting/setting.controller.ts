import { Request, Response } from 'express';

import * as service from './setting.services.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';

const controllers = {
    getAllSettings: async (req: Request, res: Response) => {
        const settings = await service.getAllSettings();
        return sendResponse.fetched(res, 'settings', settings);
    },

    getSettingsGrouped: async (req: Request, res: Response) => {
        const grouped = await service.getSettingsGrouped();
        return sendResponse.fetched(res, 'settings', grouped);
    },

    updateSetting: async (req: Request<{ key: string }, {}, { value: any }>, res: Response) => {
        const { key } = req.params;
        const { value } = req.body;
        const updated = await service.updateSetting(key, value);
        return sendResponse.updated(res, 'setting', updated);
    },

    downloadDatabaseDump: async (req: Request, res: Response) => {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            return res.status(500).json({ error: 'MONGO_URI is not configured' });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `db_dump_${timestamp}.gz`;

        const { streamDatabaseDump } = await import('@core/utils/dbdump.util.ts');
        streamDatabaseDump(res, mongoUri, filename);
    },

    bulkUpdateSettings: async (req: Request<{}, {}, { settings: { key: string; value: any }[] }>, res: Response) => {
        const { settings } = req.body;
        const updated = await service.bulkUpdateSettings(settings);
        return sendResponse.updated(res, 'settings', updated);
    },
};

export const { getAllSettings, getSettingsGrouped, updateSetting, bulkUpdateSettings, downloadDatabaseDump } =
    wrapControllers(controllers);