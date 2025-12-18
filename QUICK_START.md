# 🚀 Quick Start Guide - Owner Flow Testing

## Prerequisites
- Node.js installed
- PostgreSQL database running
- AWS S3 bucket configured

---

## Step 1: Environment Setup

### Backend (.env)
Create `apps/http-server/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/roomsdekho"
JWT_SECRET="your-super-secret-jwt-key-change-this"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="your-bucket-name"
PORT=3000
```

---

## Step 2: Start Servers

### Terminal 1 - Backend
```powershell
cd apps/http-server
npm install  # If not already done
npx prisma generate  # Generate Prisma client
npx prisma db push  # Push schema to database
npm run dev
```

**Expected Output:**
```
Server running on port 3000
Database connected
```

### Terminal 2 - Frontend
```powershell
cd apps/web
npm install  # If not already done
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.5.4
- Local: http://localhost:3001
```

---

## Step 3: Test Owner Flow

### 3.1 Login Test
1. Open: http://localhost:3001/login?type=owner
2. Enter credentials (or create account first)
3. Click "Login"
4. **✅ Should redirect to:** http://localhost:3001/owner/dashboard

### 3.2 Dashboard Test
1. Dashboard should load
2. **✅ Should see:**
   - 4 stats cards (Properties, Inquiries, Views, Rent)
   - Sidebar with navigation
   - "My Properties" tab (may be empty)
   - Header with "Quick Add" button

### 3.3 Property Listing Test
1. Click "Add Property" or "Quick Add"
2. **✅ Should go to:** http://localhost:3001/list-property
3. Fill the form:
   - Title: "Beautiful 2BHK Apartment"
   - Type: FLAT
   - City: "Mumbai"
   - Town/Sector: "Andheri West"
   - Colony: "Lokhandwala"
   - Address: "123 Main Street"
   - Rent: 25000
   - Security: 50000
   - BHK: 2
   - WhatsApp Number: 9876543210
4. Click "Send OTP"
5. **✅ Check backend terminal:** Should see OTP logged
6. Enter OTP and click "Verify"
7. **✅ Should see:** Green checkmark
8. Upload 2-5 images (property photos)
9. Click "Publish Property"
10. **✅ Should:**
    - See success toast
    - Redirect to dashboard
    - See new property in list

### 3.4 Property Management Test
1. On dashboard, find your property
2. **Test Edit:**
   - Click "Edit" button
   - Change rent to 27000
   - Click "Save"
   - **✅ Should see:** Updated rent + success toast
3. **Test Pause:**
   - Click eye icon
   - **✅ Should see:** Status changes to "PAUSED"
   - Click again to activate
4. **Test Delete:**
   - Click trash icon
   - Confirm deletion
   - **✅ Should see:** Property removed + success toast

### 3.5 Leads Test
1. Click "Leads & Inquiries" tab
2. If no leads: **✅ Should see** empty state with icon
3. If leads exist:
   - **✅ Should see:** Table with seeker details
   - Click phone number → Should open dialer
   - Click "Delete" → Lead removed

### 3.6 Profile Test
1. Click "My Profile" in sidebar
2. **✅ Should see:**
   - Owner name
   - Email
   - Phone
   - Account type: OWNER
3. Can edit details and save

---

## Step 4: Check Console

### Browser Console (F12)
**✅ Should NOT see:**
- Red errors
- Failed API calls
- Authentication errors

**✅ OK to see:**
- React DevTools messages
- Network requests (API calls)

### Backend Terminal
**✅ Should see:**
- OTP logs when you send OTP
- API request logs
- Success messages

**✅ Should NOT see:**
- 500 Internal Server Errors
- Database connection errors
- JWT verification errors

---

## Step 5: Verify Database

### Check Database Records
```sql
-- Check if property was created
SELECT * FROM "Property" ORDER BY "createdAt" DESC LIMIT 5;

-- Check if owner exists
SELECT * FROM "User" WHERE role = 'OWNER';

-- Check OTP records
SELECT * FROM "TempMobileVerifyOwnerListing" ORDER BY "createdAt" DESC LIMIT 5;
```

---

## Common Issues & Solutions

### Issue: "Cannot access /owner/dashboard"
**Solution:** Login first as owner

### Issue: "Role denied" on property listing
**Solution:** 
1. Check JWT token in localStorage
2. Should have `role: "OWNER"` not `userType`
3. Re-login if token is old

### Issue: OTP not received
**Solution:**
1. Check backend terminal for OTP
2. In development, OTP is logged to console
3. Use the logged OTP to verify

### Issue: Images not uploading
**Solution:**
1. Check AWS credentials in .env
2. Check S3 bucket permissions
3. Check browser console for errors

### Issue: Property not showing on dashboard
**Solution:**
1. Check network tab for API errors
2. Verify property was saved to database
3. Refresh dashboard

### Issue: "Cannot read property 'role'"
**Solution:**
1. Clear localStorage
2. Logout and login again
3. Check if user object has role field

---

## Quick Verification Commands

### Check if servers are running
```powershell
# Backend
Invoke-WebRequest http://localhost:3000/api/v1/health

# Frontend
Invoke-WebRequest http://localhost:3001
```

### Check database connection
```powershell
cd apps/http-server
npx prisma studio
# Opens database viewer at http://localhost:5555
```

---

## Success Indicators

### ✅ Everything Working If:
- [x] Login redirects to dashboard
- [x] Dashboard shows stats
- [x] Can create property with OTP
- [x] Property appears on dashboard
- [x] Can edit/pause/delete property
- [x] Leads tab accessible
- [x] Profile page works
- [x] No console errors
- [x] Toast notifications show
- [x] Images upload successfully

---

## Next Steps After Testing

If everything works:
1. ✅ Mark test checklist items complete
2. 📸 Take screenshots of working flow
3. 🐛 Report any bugs found
4. 💡 Suggest improvements
5. 🚀 Deploy to production

If issues found:
1. 📝 Note exact error messages
2. 🖼️ Screenshot error screens
3. 📋 Check which step failed
4. 🔍 Check console logs
5. 🆘 Report with details

---

## Emergency Reset

If something goes completely wrong:

```powershell
# Stop all servers (Ctrl+C in both terminals)

# Reset frontend
cd apps/web
rm -rf .next
npm run dev

# Reset backend database (CAUTION: Deletes all data)
cd apps/http-server
npx prisma migrate reset
npm run dev

# Clear browser data
# In browser: F12 → Application → Clear Storage → Clear all
# Or just clear localStorage
```

---

## Test Data Examples

### Sample Owner Account
```
Email: owner@test.com
Phone: 9876543210
Password: Test@1234
Name: Test Owner
```

### Sample Property Data
```
Title: Luxurious 3BHK Apartment
Type: FLAT
City: Mumbai
Colony: Lokhandwala
Rent: 35000
Security: 70000
BHK: 3
Furnished: SEMI_FURNISHED
```

---

**Ready to test!** 🚀

Just follow steps 1-5 in order and check off items as you go. Good luck! 🎉
