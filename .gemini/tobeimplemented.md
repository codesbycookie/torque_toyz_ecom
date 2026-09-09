# Integrate Settings with Application Functionalities

This plan outlines how we will integrate the dynamic settings (which are currently wired to the DB) into the actual application logic to control core behaviors like API locking, user signups, and order placements.

## Proposed Changes

### 1. Maintenance Mode Integration
We will update the `maintenanceMode` middleware to use the dynamic `maintenance_mode` setting instead of checking the static environment variable (`ENV.MAINTENANCE_MODE`).

- Since this middleware runs on *every single request*, fetching from the database every time would create a significant bottleneck. 
- We will implement a lightweight in-memory cache with a Time-To-Live (TTL) of 1 minute inside the middleware to keep it fast while still being responsive to changes from the admin dashboard.

#### [MODIFY] `backend/src/core/middlewares/maintenance.middleware.ts`
- Import the `Setting` model.
- Add an in-memory cache mechanism (e.g., `let cachedMaintenanceMode`, `lastCacheTime`).
- If the cache expires, query `Setting.get('maintenance_mode')` and update the cache.
- Block requests if the setting is truthy, maintaining the existing bypass routes.

---

### 2. User Signups Control
We will restrict the ability to create new user accounts based on the `new_signups_enabled` setting.

#### [MODIFY] `backend/src/modules/user/user.services.ts`
- Update the `createUser` function.
- Query `Setting.get('new_signups_enabled')` before processing the creation.
- If it evaluates to false, throw an `ApiError` (403 Forbidden) indicating that new signups are temporarily disabled.

---

### 3. Order Management Controls
We will enforce order-related settings (`min_order_amount`, `allow_cod`, `allow_online_payment`) during the checkout process.

#### [MODIFY] `backend/src/modules/order/order.services.ts`
- Update the `createOrder` function.
- Query the required settings using `Setting.getMany(['min_order_amount', 'allow_cod', 'allow_online_payment'])`.
- Validate that the `payment_method` chosen by the user is allowed based on the `allow_cod` and `allow_online_payment` flags.
- Validate that the calculated `subtotal` (or total) meets the `min_order_amount` threshold.
- Throw appropriate `ApiError` (400 Bad Request) if any of these conditions are violated.

## Open Questions

> [!WARNING]
> Do you want the settings for order placements (`allow_cod`, `allow_online_payment`, `min_order_amount`) to be strictly enforced on the **subtotal** (just items) or the **final total** (including shipping)? I will assume **subtotal** by default unless you prefer otherwise.

## Verification Plan

### Automated Tests
We will verify that the endpoints correctly block access when settings are flipped:
- Send requests to a non-bypassed route when `maintenance_mode` is enabled (should receive 503).
- Attempt user creation when `new_signups_enabled` is disabled (should receive 403).
- Attempt order creation with COD when `allow_cod` is disabled, or below the `min_order_amount` (should receive 400).

### Manual Verification
- We can seed/update the DB settings directly or via the API and observe the application behavior changing in real-time (after the 1-minute TTL for maintenance mode).
