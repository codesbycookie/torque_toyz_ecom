export const buildPayload = (user: any, role: string, login_id: string) => ({
  id: user._id,
  login_id,
  role,
});

export const ensureFields = (fields: Record<string, any>) => {
  const invalid = Object.values(fields).some((v) => !v);
  if (invalid) throw new Error('All fields are required');
};
