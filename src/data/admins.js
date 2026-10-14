/* Admin Accounts (mock only) */

// Development sign-ins for /admin/login while mocks are on. Passwords live
// here only because nothing checks them on a server yet; qvfits-api replaces
// this file with hashed passwords and invites (docs/05-backend-integration.md).
export const adminSeed = [
  { id: "adm_owner", name: "QV fits Owner", email: "owner@qvfits.com", role: "owner", password: "demo123" },
  { id: "adm_staff", name: "Showroom Staff", email: "staff@qvfits.com", role: "staff", password: "demo123" },
];
