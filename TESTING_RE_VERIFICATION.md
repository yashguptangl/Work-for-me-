# Re-Verification Testing Script

## Quick Test Commands

### 1. Simulate Expiry in Database
```sql
-- Connect to your database and run:

-- Find a verified property
SELECT id, title, "verificationStatus", "verificationExpiry" 
FROM "Property" 
WHERE "verificationStatus" = 'VERIFIED' 
LIMIT 1;

-- Set it to expire (replace 'property-id' with actual ID)
UPDATE "Property" 
SET "verificationExpiry" = NOW() - INTERVAL '1 day'
WHERE id = 'property-id';
```

### 2. Test Auto-Expiry via API
```bash
# Call the status endpoint (will auto-detect expiry)
curl -X GET "http://localhost:3001/api/v1/owner/verification/status/property-id" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response should show verificationStatus: 'EXPIRED'
```

### 3. Test Manual Expiry Cron
```bash
# Trigger expiry cron manually
curl -X POST http://localhost:3001/api/v1/cron/expire-verifications

# Expected response:
{
  "success": true,
  "expired": 1,
  "properties": [...]
}
```

### 4. Test Re-Verification Flow

**Step 1: Check Dashboard**
- Login as owner
- Go to `/owner/dashboard`
- Should see orange "Verification Expired" badge
- Should see "Renew Verification (₹299)" button

**Step 2: Click Renew**
- Click the button
- Should open `/owner/verify-property/[id]`
- Should show "⏰ Verification Expired" notice
- Button should say "Renew Verification"

**Step 3: Complete Payment**
- Click "Renew Verification"
- Should create new VerificationRequest
- Click "Pay ₹299"
- Should complete payment

**Step 4: Capture Location**
- Should show location popup
- Click "I'm at Property"
- Should capture GPS and address
- Should submit for review

**Step 5: Admin Approval**
- Login as admin
- Go to `/dashboard/verifications`
- Find the new request
- Approve it
- Should create new 3-month verification period

### 5. Verify Database Changes
```sql
-- Check property status updated
SELECT 
  id, 
  title, 
  "verificationStatus", 
  "isVerified",
  "verifiedAt",
  "verificationExpiry"
FROM "Property" 
WHERE id = 'property-id';

-- Check verification history
SELECT 
  id,
  "verifiedAt",
  "validUntil",
  "isActive"
FROM "PropertyVerification"
WHERE "propertyId" = 'property-id'
ORDER BY "verifiedAt" DESC;

-- Should see:
-- - Old verification with isActive = false
-- - New verification with isActive = true
-- - New validUntil = 3 months from now
```

### 6. Test Expiry Reminders (Optional)
```sql
-- Create a property expiring in 5 days
UPDATE "Property" 
SET "verificationExpiry" = NOW() + INTERVAL '5 days',
    "verificationStatus" = 'VERIFIED'
WHERE id = 'property-id';
```

```bash
# Trigger reminder cron
curl -X POST http://localhost:3001/api/v1/cron/send-expiry-reminders

# Check terminal logs for reminder messages
```

## Expected Results

### Before Re-Verification:
```json
{
  "verificationStatus": "EXPIRED",
  "isVerified": false,
  "verificationExpiry": "2026-01-15T00:00:00.000Z"
}
```

### After Re-Verification:
```json
{
  "verificationStatus": "VERIFIED",
  "isVerified": true,
  "verifiedAt": "2026-01-18T10:30:00.000Z",
  "verificationExpiry": "2026-04-18T10:30:00.000Z"
}
```

## Troubleshooting Tests

### Test 1: Multiple Re-Verifications
```sql
-- Verify can be done multiple times
SELECT 
  COUNT(*) as verification_count,
  MAX("verifiedAt") as latest_verification
FROM "PropertyVerification"
WHERE "propertyId" = 'property-id';

-- Should show multiple records after several renewal cycles
```

### Test 2: Prevent Duplicate Requests
```bash
# Try to create another request while one is pending
curl -X POST "http://localhost:3001/api/v1/owner/verification/initiate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "property-id"}'

# Should return error: "A verification request is already in progress"
```

### Test 3: Expired Badge UI
- Set property to expired in DB
- Refresh owner dashboard
- Should see:
  - ❌ No green "Verified Property" badge
  - ✅ Orange "Verification Expired" badge
  - ✅ "Renew Verification (₹299)" button visible

## Performance Test

### Test Bulk Expiry
```sql
-- Create 100 expired properties for testing
UPDATE "Property" 
SET "verificationExpiry" = NOW() - INTERVAL '1 day',
    "verificationStatus" = 'VERIFIED'
WHERE "verificationStatus" = 'NOT_VERIFIED'
LIMIT 100;
```

```bash
# Run expiry cron and measure time
time curl -X POST http://localhost:3001/api/v1/cron/expire-verifications

# Should complete in < 5 seconds for 100 properties
```

## Automated Test Script (Optional)

Create `test-reverification.sh`:
```bash
#!/bin/bash

echo "=== Testing Re-Verification System ==="

# 1. Trigger expiry
echo "1. Running expiry cron..."
EXPIRE_RESULT=$(curl -s -X POST http://localhost:3001/api/v1/cron/expire-verifications)
echo $EXPIRE_RESULT | jq

# 2. Send reminders
echo "2. Sending expiry reminders..."
REMINDER_RESULT=$(curl -s -X POST http://localhost:3001/api/v1/cron/send-expiry-reminders)
echo $REMINDER_RESULT | jq

# 3. Check database
echo "3. Checking expired properties..."
psql $DATABASE_URL -c "SELECT COUNT(*) as expired_count FROM \"Property\" WHERE \"verificationStatus\" = 'EXPIRED';"

echo "=== Test Complete ==="
```

Make executable and run:
```bash
chmod +x test-reverification.sh
./test-reverification.sh
```

## Success Criteria

✅ Expired properties show orange badge in dashboard
✅ "Renew Verification" button appears for expired properties
✅ Can complete full re-verification flow
✅ New verification creates new 3-month period
✅ Old verification records marked as inactive
✅ Multiple verification cycles supported
✅ Cron job successfully expires verifications
✅ No duplicate active requests allowed
✅ Database constraints maintained

## Notes

- Test with real GPS location for location capture
- Use different browsers/devices to test UI
- Verify email/SMS notifications when integrated
- Monitor server logs during testing
- Test with multiple property types (RENT, SALE)
- Verify admin panel shows correct status

---

**Quick Start Test:**
```bash
# 1. Expire a property
psql $DATABASE_URL -c "UPDATE \"Property\" SET \"verificationExpiry\" = NOW() - INTERVAL '1 day' WHERE \"verificationStatus\" = 'VERIFIED' LIMIT 1;"

# 2. Run expiry cron
curl -X POST http://localhost:3001/api/v1/cron/expire-verifications

# 3. Check dashboard
# Open browser → owner dashboard → see expired badge → click renew → complete flow
```
