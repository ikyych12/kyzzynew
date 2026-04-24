# Security Specification

## Data Invariants
1. A user record must be created at root owner initialization or through login with password '1' (auto-registration).
2. Users can only update their own profiles (password, etc) unless they are ADMIN or OWNER.
3. ADMIN and OWNER can manage all users (except root owners cannot be modified by other admins/owners in terms of role demotion or deletion).
4. Premium keys belong to a generator (RESELLER/ADMIN/OWNER).
5. Only generators can create keys.
6. Only generators can list keys (RESELLERS only their own).
7. Keys can only be updated to 'used' status, and once used, they are immutable.

## The "Dirty Dozen" Payloads (Expected to fail)
1. Someone else trying to delete 'iky' root user.
2. A MEMBER trying to create a Premium Key.
3. A MEMBER trying to promote themselves to OWNER.
4. An unauthenticated user reading the user list.
5. A RESELLER trying to delete another RESELLER'S key.
6. A MEMBER trying to use an invalid (non-existent) key.
7. An attacker creating a user with a 1MB string as username.
8. An attacker injecting a `role: "OWNER"` field into a 'Free' tier user.
9. A user updating `createdAt` field (should be immutable).
10. A user updating `generatedBy` list (should be immutable for resellers).
11. A user trying to set `expiry` to 10 years in the future without a valid key.
12. Someone else trying to read another user's password.

## The Test Runner (Plan)
We will implement `firestore.rules` and verify them.
