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

    bulkUpdateSettings: async (req: Request<{}, {}, { settings: { key: string; value: any }[] }>, res: Response) => {
        const { settings } = req.body;
        const updated = await service.bulkUpdateSettings(settings);
        return sendResponse.updated(res, 'settings', updated);
    },
};

export const { getAllSettings, getSettingsGrouped, updateSetting, bulkUpdateSettings } =
    wrapControllers(controllers);