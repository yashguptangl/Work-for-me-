# Re-Verification After Expiry - Implementation Guide

## 🔄 Overview
Owners can now re-verify their properties after the 3-month verification period expires. The system automatically handles expiry and allows seamless renewal.

## ✨ Key Features Added

### 1. **Automatic Expiry Detection**
- System checks verification expiry date
- Automatically updates status from `VERIFIED` → `EXPIRED`
- Deactivates old verification records
- Updates `isVerified` flag to `false`

### 2. **Expiry Notifications in UI**
The owner dashboard now shows three states:

**Active Verification:**
```
🟢 Verified Property
Valid until: [Date]
```

**Expired Verification:**
```
🟠 Verification Expired
Renew to regain verified badge
[Renew Verification (₹299)] button
```

**Pending Verification:**
```
🟡 Verification Pending
Under review by admin
```

### 3. **Re-Verification Flow**
When verification expires:
1. Badge changes from green to orange
2. Button text changes to "Renew Verification (₹299)"
3. Owner can click to start renewal process
4. Same 3-step process: Payment → Location → Review
5. Admin approves → New 3-month period starts

### 4. **Backend Expiry Logic**

#### Auto-Expiry on Status Check:
```typescript
// In getVerificationStatusController
if (verificationStatus === 'VERIFIED' && verificationExpiry < NOW) {
  - Update property status to EXPIRED
  - Set isVerified to false
  - Deactivate old PropertyVerification records
}
```

#### Re-Verification Prevention Logic:
```typescript
// In initiateVerificationController
- Check if verification is expired → Allow new request
- Deactivate old verification records
- Create new VerificationRequest
- No restriction on re-verification
```

## 📡 New Cron Job Utilities

### Location: `/apps/http-server/src/utils/verificationCron.ts`

#### Functions:

1. **`expireVerifications()`**
   - Finds all verified properties past expiry date
   - Updates status to EXPIRED
   - Deactivates verification records
   - Returns list of expired properties

2. **`sendExpiryReminders()`**
   - Finds verifications expiring within 7 days
   - Logs reminder notifications
   - TODO: Integrate email/SMS service

3. **`runVerificationMaintenance()`**
   - Runs both expiry and reminder tasks
   - Returns combined results

### API Endpoints: `/api/v1/cron`

```bash
# Manually expire verifications
POST /api/v1/cron/expire-verifications

# Send expiry reminders
POST /api/v1/cron/send-expiry-reminders

# Run full maintenance
POST /api/v1/cron/run-maintenance
```

## 🔧 Setup Instructions

### 1. Cron Job Setup (Recommended)

**Option A: Using node-cron (within the app)**

Install node-cron:
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

Add to `apps/http-server/src/index.ts`:
```typescript
import cron from 'node-cron';
import { runVerificationMaintenance } from './utils/verificationCron';

// Run verification maintenance daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily verification maintenance...');
  await runVerificationMaintenance();
});
```

**Option B: Using System Cron (Linux/Mac)**

Create a script `expire-verifications.sh`:
```bash
#!/bin/bash
curl -X POST http://localhost:3001/api/v1/cron/run-maintenance
```

Add to crontab:
```bash
# Run daily at 2:00 AM
0 2 * * * /path/to/expire-verifications.sh
```

**Option C: Using Windows Task Scheduler**
1. Create PowerShell script `expire-verifications.ps1`:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cron/run-maintenance" -Method POST
```

2. Create scheduled task to run daily at 2:00 AM

### 2. Manual Trigger (For Testing)

```bash
# Test expiry function
curl -X POST http://localhost:3001/api/v1/cron/expire-verifications

# Test reminder function
curl -X POST http://localhost:3001/api/v1/cron/send-expiry-reminders

# Run full maintenance
curl -X POST http://localhost:3001/api/v1/cron/run-maintenance
```

## 🧪 Testing Re-Verification

### Test Case 1: Simulate Expiry
```sql
-- Set verification to expire today
UPDATE "Property" 
SET "verificationExpiry" = NOW() - INTERVAL '1 day',
    "verificationStatus" = 'VERIFIED'
WHERE id = 'your-property-id';

-- Refresh owner dashboard
-- Should show "Verification Expired" with "Renew" button
```

### Test Case 2: Manual Expiry Trigger
```bash
# Run expiry cron
curl -X POST http://localhost:3001/api/v1/cron/expire-verifications

# Check database
SELECT id, title, "verificationStatus", "isVerified" 
FROM "Property" 
WHERE "verificationExpiry" < NOW();
```

### Test Case 3: Complete Re-Verification Flow
```
1. Mark property as expired (SQL or wait for cron)
2. Login as owner
3. Go to dashboard → See "Verification Expired"
4. Click "Renew Verification (₹299)"
5. Complete payment
6. Capture location (must be at property)
7. Submit for review
8. Admin approves
9. Verify new 3-month period starts
```

## 📊 Database Queries

### Check Expired Verifications:
```sql
SELECT 
  p.id,
  p.title,
  p."verificationStatus",
  p."verifiedAt",
  p."verificationExpiry",
  p."isVerified",
  o."firstName" || ' ' || o."lastName" as owner
FROM "Property" p
JOIN "Owner" o ON o.id = p."ownerId"
WHERE p."verificationStatus" = 'VERIFIED'
  AND p."verificationExpiry" < NOW();
```

### Check Properties Expiring Soon:
```sql
SELECT 
  p.id,
  p.title,
  p."verificationExpiry",
  DATE_PART('day', p."verificationExpiry" - NOW()) as days_left,
  o.email
FROM "Property" p
JOIN "Owner" o ON o.id = p."ownerId"
WHERE p."verificationStatus" = 'VERIFIED'
  AND p."verificationExpiry" BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```

### Verification History:
```sql
SELECT 
  p.title,
  vr.status,
  vr."createdAt",
  vr."validFrom",
  vr."validUntil"
FROM "VerificationRequest" vr
JOIN "Property" p ON p.id = vr."propertyId"
WHERE vr."propertyId" = 'your-property-id'
ORDER BY vr."createdAt" DESC;
```

## 🎯 UI Changes Summary

### Owner Dashboard (`OwnerDashboard.tsx`)

**Before:**
- Only showed verified badge for active verifications
- Button hidden for verified properties

**After:**
- Shows expired badge with orange styling
- Button text changes based on status:
  - `"Get Verified (₹299)"` - First time
  - `"Renew Verification (₹299)"` - After expiry
- Button appears for:
  - NOT_VERIFIED
  - EXPIRED
  - Verified but past expiry date

### Verification Page (`verify-property/[id]/page.tsx`)

**Before:**
- Only handled first-time verifications

**After:**
- Detects if property is expired
- Shows special "Verification Expired" notice
- Button text adapts: "Renew Verification"
- Allows re-verification even if previous request exists (if approved/rejected/expired)

## 🔐 Security & Business Logic

### Prevents Duplicate Active Requests:
```typescript
// Cannot create new request if one is:
- PENDING_PAYMENT
- PAYMENT_COMPLETED
- UNDER_REVIEW

// Can create new request if previous is:
- APPROVED (and expired)
- REJECTED
- EXPIRED
```

### Deactivates Old Verification Records:
```typescript
// When starting re-verification:
- Sets old PropertyVerification.isActive = false
- Maintains verification history
- Allows tracking of all verification cycles
```

## 📧 Notification Integration (TODO)

### Email Templates Needed:

1. **7-Day Expiry Warning:**
```
Subject: Your verified badge expires in 7 days

Hi [Owner Name],

Your verified badge for "[Property Title]" will expire on [Expiry Date].

Renew now to:
- Keep your verified status
- Maintain 3x more inquiries
- Stay ahead of competitors

[Renew Now Button]
```

2. **Verification Expired:**
```
Subject: Your verified badge has expired

Hi [Owner Name],

Your verified badge for "[Property Title]" has expired.

Renew your verification to regain:
- Verified badge
- Increased visibility
- Trust from potential tenants

[Renew Now Button]
```

### Integration Points:
```typescript
// In verificationCron.ts
import { sendEmail } from './emailService';

// In sendExpiryReminders()
await sendEmail({
  to: property.owner.email,
  template: 'expiry-warning',
  data: {
    ownerName: property.owner.firstName,
    propertyTitle: property.title,
    expiryDate: property.verificationExpiry,
    renewUrl: `${process.env.FRONTEND_URL}/owner/verify-property/${property.id}`
  }
});
```

## 🚀 Production Deployment

### Pre-Deployment Checklist:
- [ ] Set up cron job (choose Option A, B, or C)
- [ ] Test manual expiry endpoint
- [ ] Configure email/SMS service
- [ ] Set up monitoring for cron job failures
- [ ] Test complete re-verification flow
- [ ] Update documentation for support team

### Monitoring:
```bash
# Check cron job logs
tail -f /var/log/verification-cron.log

# Monitor database
SELECT 
  "verificationStatus",
  COUNT(*) 
FROM "Property" 
GROUP BY "verificationStatus";
```

## 🐛 Troubleshooting

**Issue**: Expired properties not showing "Renew" button
- **Check**: Verify `verificationStatus` is set to `EXPIRED`
- **Fix**: Run manual expiry cron or check frontend logic

**Issue**: Cron job not running
- **Check**: Logs in terminal/system cron logs
- **Fix**: Verify cron syntax and server timezone

**Issue**: Owner can't create new verification request
- **Check**: Existing request status in database
- **Fix**: Ensure no active requests (PENDING_PAYMENT, etc.)

## 📝 Summary

### What Was Added:
✅ Automatic expiry detection on status checks
✅ UI changes for expired state (orange badge)
✅ Re-verification flow with adaptive messaging
✅ Cron job utilities for batch expiry
✅ Reminder system for 7-day warnings
✅ Manual trigger endpoints
✅ Deactivation of old verification records
✅ Prevention of duplicate active requests

### Files Modified:
- `owner.verification.controllers.ts` - Added expiry logic
- `OwnerDashboard.tsx` - Added expired state UI
- `verify-property/[id]/page.tsx` - Added renewal support

### Files Created:
- `utils/verificationCron.ts` - Cron job functions
- `routes/verification.cron.ts` - Cron endpoints
- `RE_VERIFICATION_GUIDE.md` - This document

---

**Status**: ✅ Re-verification Complete
**Last Updated**: January 18, 2026
