import Setting from '@db/models/setting.model.ts';

// The admin Settings page renders sections — group settings by prefix
// so the frontend can build "Business Info" / "Orders" / "Site" tabs
// without hardcoding the grouping on the frontend.
const SECTIONS: Record<string, string[]> = {
    business: ['support_phone', 'business_address'],
    orders: ['free_delivery', 'low_stock_threshold', 'allow_cod', 'allow_online_payment', 'min_order_amount', 'gst_percentage'],
    catalog: ['default_product_images'],
    site: ['new_signups_enabled'],
    ecom: ['ecom_announcement_banner'],
};

export const getAllSettings = async () => {
    const settings = await Setting.find().sort({ key: 1 });
    return settings;
};

export const getSettingsGrouped = async () => {
    const all = await Setting.find();
    const map = new Map(all.map((s) => [s.key, s]));

    const grouped: Record<string, Record<string, any>> = {};
    for (const [section, keys] of Object.entries(SECTIONS)) {
        grouped[section] = {};
        for (const key of keys) {
            grouped[section][key] = map.get(key)?.value ?? null;
        }
    }
    return grouped;
};

export const updateSetting = async (key: string, value: any) => {
    return Setting.set(key, value);
};

export const bulkUpdateSettings = async (settings: { key: string; value: any }[]) => {
    return Promise.all(settings.map((s) => Setting.set(s.key, s.value)));
};
