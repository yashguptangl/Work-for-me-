# Property Verification System - Quick Reference

## 🎯 How It Works

### For Property Owners:
1. **View Property** → Dashboard shows "Get Verified (₹299)" button
2. **Click Button** → Opens verification page
3. **Pay ₹299** → Complete payment (3 months validity)
4. **Capture Location** → Must be inside property, GPS + Google Maps captures exact location
5. **Wait for Review** → Admin reviews and approves
6. **Get Badge** → Verified badge shows on property for 3 months

### For Admins:
1. **Go to Verifications** → `/dashboard/verifications`
2. **Review Requests** → See property details, owner info, and captured location
3. **Check Location** → Verify lat/long and address match property
4. **Approve/Reject** → Add notes and approve/reject
5. **Auto Expiry** → System automatically expires after 3 months

## 🔗 Key URLs

### Owner Side:
- Dashboard: `/owner/dashboard`
- Verify Property: `/owner/verify-property/[propertyId]`

### Admin Side:
- Verifications List: `/dashboard/verifications`
- Property Details: `/dashboard/properties/[propertyId]`

## 📡 API Endpoints

### Owner APIs:
```
POST   /api/v1/owner/verification/initiate
POST   /api/v1/owner/verification/payment/complete
POST   /api/v1/owner/verification/capture-location
GET    /api/v1/owner/verification/status/:propertyId
GET    /api/v1/owner/verification/requests
```

### Admin APIs:
```
GET    /admin/verifications
GET    /admin/verifications/:id
POST   /admin/verifications/:id/review
```

## 🔄 Verification Status Flow

```
NOT_VERIFIED → PENDING_PAYMENT → PAYMENT_COMPLETED → 
PENDING_VERIFICATION → VERIFIED → EXPIRED (after 3 months)
```

## 💾 Database Fields Added

**VerificationRequest Table:**
- `verificationLatitude` (Float) - GPS latitude
- `verificationLongitude` (Float) - GPS longitude  
- `verificationAddress` (String) - Full address from Google Maps
- `locationCapturedAt` (DateTime) - When location was captured
- `amount` (Int) - Updated to 299

## 🎨 UI Components

### Owner Dashboard Badge (Verified):
```tsx
<div className="bg-green-50 border-green-200">
  ✓ Verified Property
  Valid until: [Date]
</div>
```

### Owner Dashboard Badge (Pending):
```tsx
<div className="bg-yellow-50 border-yellow-200">
  ⏳ Verification Pending
  Under review by admin
</div>
```

### Verification Button:
```tsx
<Button className="bg-blue-600">
  🛡️ Get Verified (₹299)
</Button>
```

## 📝 Testing Steps

### Test Owner Flow:
```bash
1. Login as owner
2. Go to dashboard
3. Click "Get Verified" on any property
4. Click "Start Verification Process"
5. Click "Pay ₹299"
6. Allow location access when prompted
7. Click "I'm at Property"
8. Verify success message
9. Check dashboard shows "Verification Pending"
```

### Test Admin Flow:
```bash
1. Login as admin
2. Go to /dashboard/verifications
3. Find the verification request
4. Check location data is displayed
5. Click approve (checkmark icon)
6. Enter notes
7. Verify property shows verified badge
```

### Test Expiry:
```sql
-- In database, update expiry to past date:
UPDATE "Property" 
SET "verificationExpiry" = NOW() - INTERVAL '1 day'
WHERE id = 'property-id';

-- Refresh owner dashboard
-- Verify badge disappears and button reappears
```

## 🔐 Security Notes

1. **JWT Required**: All endpoints require valid JWT token
2. **Owner Check**: Endpoints verify property belongs to logged-in owner
3. **Location Access**: Requires browser permission for geolocation
4. **Google API**: Requires valid Google Maps API key in `.env`

## 🐛 Common Issues & Fixes

**Issue**: "Geolocation not supported"
- **Fix**: Use HTTPS or allow location in browser settings

**Issue**: "Failed to get location"
- **Fix**: Enable location services on device

**Issue**: "Google API error"
- **Fix**: Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`

**Issue**: "Verification button not showing"
- **Fix**: Ensure property is not draft and not already verified

**Issue**: "Payment not completing"
- **Fix**: Check network requests in browser console

## 📊 Database Queries

### Check verification status:
```sql
SELECT p.title, p."verificationStatus", p."verificationExpiry", 
       vr.status, vr."verificationLatitude", vr."verificationLongitude"
FROM "Property" p
LEFT JOIN "VerificationRequest" vr ON vr."propertyId" = p.id
WHERE p.id = 'property-id';
```

### Find expired verifications:
```sql
SELECT * FROM "Property" 
WHERE "verificationStatus" = 'VERIFIED' 
AND "verificationExpiry" < NOW();
```

### Count verifications by status:
```sql
SELECT status, COUNT(*) 
FROM "VerificationRequest" 
GROUP BY status;
```

## 🚀 Deployment Checklist

- [ ] Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to environment
- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Integrate real payment gateway (Razorpay/Stripe)
- [ ] Set up cron job to expire verifications after 3 months
- [ ] Configure email/SMS notifications
- [ ] Add rate limiting to verification endpoints
- [ ] Test on production database

## 📞 Support

Check logs:
```bash
# Frontend logs
Browser Console → Network tab

# Backend logs  
Terminal running http-server

# Database logs
npx prisma studio
```

---

**Quick Test Command:**
```bash
# Start all services
cd d:\Rooms-Dekho
npm run dev
```

**Migration Command:**
```bash
cd packages/prisma
npx prisma migrate dev
```
