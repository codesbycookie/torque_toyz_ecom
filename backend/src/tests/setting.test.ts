import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { bootstrap } from "../app.ts";
import { tester } from "@core/constants/tester.constant.ts";
import User from "@db/models/user.model.ts";
import Setting from "@db/models/setting.model.ts";
import { generateToken } from "@lib/jwt.ts";

let token: string;

beforeAll(async () => {
  await bootstrap();
  const admin = await User.findOne({ role: 'admin', deleted: false });
  if (admin) {
    token = generateToken({ _id: admin._id.toString(), role: admin.role, email: admin.email });
  }
});

describe("Settings API Suite", () => {
  it("should update settings in bulk including empty string banner and free_delivery", async () => {
    const payload = {
      settings: [
        { key: "free_delivery", value: true },
        { key: "low_stock_threshold", value: 10 },
        { key: "gst_percentage", value: 18 },
        { key: "ecom_announcement_banner", value: "" }
      ]
    };

    const res = await tester
      .put("/api/v1/settings/bulk")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    console.log("STATUS:", res.status, "BODY:", JSON.stringify(res.body));
    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    await Setting.set("free_delivery", false);
  });
});
