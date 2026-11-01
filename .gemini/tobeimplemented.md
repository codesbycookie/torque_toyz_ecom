# Integrate Settings with Application Functionalities

This plan outlines how we will integrate the dynamic settings (which are currently wired to the DB) into the actual application logic to control core behaviors like API locking, user signups, and order placements.

## Proposed Changes

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
- Attempt user creation when `new_signups_enabled` is disabled (should receive 403).
- Attempt order creation with COD when `allow_cod` is disabled, or below the `min_order_amount` (should receive 400).

### Manual Verification
