# Security Spec: Kyzzy Protocol Matrix

## 1. Data Invariants
- Users can only read/write their own profile unless they are OWNER or ADMIN.
- Users can auto-register with default role 'MEMBER'.
- 'OWNER' and 'ADMIN' can manage all users and keys.
- Recovery keys allow bypassing password sequence but are strictly whitelisted to the owning identity.
- Premium keys can only be 'used' once.
- Timestamps must be server-synced.

## 2. Dirty Dozen Payloads
1. **Payload 1: Identity Spoofing** - User 'alice' attempts to update profile of 'bob'. (Target: PERMISSION_DENIED)
2. **Payload 2: Role Escalation** - User 'alice' attempts to change their own role to 'OWNER'. (Target: PERMISSION_DENIED)
3. **Payload 3: Key Injection** - Anonymous user attempts to create a premium key. (Target: PERMISSION_DENIED)
4. **Payload 4: Double Spend** - User attempts to update a 'used' premium key status to 'unused'. (Target: PERMISSION_DENIED)
5. **Payload 5: ID Poisoning** - User attempts to create a document with a 2MB string as ID. (Target: PERMISSION_DENIED)
6. **Payload 6: Field Poisoning** - User attempts to add a field 'shadowRole' to a UserProfile doc. (Target: PERMISSION_DENIED)
7. **Payload 7: Timestamp Forgery** - User provides a manual 'createdAt' timestamp. (Target: PERMISSION_DENIED)
8. **Payload 8: Admin Hijack** - User 'alice' attempts to delete user 'iky' (the owner). (Target: PERMISSION_DENIED)
9. **Payload 9: Blanket Read** - Guest user attempts to list all users. (Target: PERMISSION_DENIED)
10. **Payload 10: Private Data Leak** - User 'alice' attempts to 'get' user 'iky''s recoveryKey. (Target: PERMISSION_DENIED)
11. **Payload 11: Schema Bypass** - User attempts to set 'durationDays' to a string. (Target: PERMISSION_DENIED)
12. **Payload 12: Terminal State Reversion** - User attempts to update a 'used' key to 'unused' status. (Target: PERMISSION_DENIED)
