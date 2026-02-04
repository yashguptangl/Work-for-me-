# 🚀 Re-Verification Quick Start

## ⚡ Quick Commands

### Start Development:
```bash
cd d:\Rooms-Dekho
npm run dev
```

### Test Expiry:
```bash
# Expire a property
curl -X POST http://localhost:3001/api/v1/cron/expire-verifications

# Send reminders
curl -X POST http://localhost:3001/api/v1/cron/send-expiry-reminders
```

### Database Check:
```sql
-- Check verification status
SELECT "verificationStatus", COUNT(*) 
FROM "Property" 
GROUP BY "verificationStatus";
```

## 🎯 Key Features

✅ **Automatic Expiry** - After 3 months
✅ **Re-verification** - Pay ₹299 to renew
✅ **Location Capture** - GPS + Google Maps
✅ **Expiry Reminders** - 7 days before
✅ **Multiple Cycles** - Unlimited renewals
✅ **Verification History** - Complete audit trail

## 📱 UI States

| Status | Badge Color | Button Text |
|--------|-------------|-------------|
| NOT_VERIFIED | None | Get Verified (₹299) |
| VERIFIED | 🟢 Green | None |
| EXPIRED | 🟠 Orange | Renew Verification (₹299) |
| PENDING | 🟡 Yellow | None (Under Review) |

## 🔄 Flow

```
1. Expires → 2. Shows Orange Badge → 3. Click Renew → 
4. Pay ₹299 → 5. Capture Location → 6. Admin Approves → 
7. New 3-Month Period
```

## 🛠️ Setup Cron (Production)

### Option 1: Node Cron
```bash
npm install node-cron @types/node-cron
```

Add to `src/index.ts`:
```typescript
import cron from 'node-cron';
import { runVerificationMaintenance } from './utils/verificationCron';

cron.schedule('0 2 * * *', runVerificationMaintenance);
```

### Option 2: System Cron
```bash
0 2 * * * curl -X POST http://localhost:3001/api/v1/cron/run-maintenance
```

## 📚 Documentation

- **VERIFICATION_SYSTEM_GUIDE.md** - Original implementation
- **RE_VERIFICATION_GUIDE.md** - Re-verification details
- **TESTING_RE_VERIFICATION.md** - Test scripts
- **IMPLEMENTATION_COMPLETE.md** - Complete summary

## 🎉 Done!

System ready for production. Test the flow and set up cron job! 🚀
