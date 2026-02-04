# 🎯 Admin Panel - Complete Setup Guide (Hindi + English)

## ✨ Features / Kya Kya Hai

### Main Admin (Puri Power)
- ✅ Sabhi users, owners aur properties dekh sakte ho
- ✅ Properties ko verify ya reject kar sakte ho with photos from S3
- ✅ Property details edit kar sakte ho
- ✅ Employees create kar sakte ho
- ✅ Employees ko permissions de sakte ho
- ✅ Complete dashboard with statistics

### Employee (Limited Access based on permissions)
- 👁️ Sirf wahi dekh sakte jo main admin ne permission di
- ✏️ Verification handle kar sakte (agar permission hai)
- 🏠 Properties manage kar sakte (agar permission hai)
- 👥 Users/Owners handle kar sakte (agar permission hai)

### Verification System
1. Owner ₹149 pay karta hai
2. Request admin panel mein dikhti hai
3. Admin/Employee review karta hai with notes
4. Approve → 3 mahine valid
5. Reject → Dobara payment karni padegi

---

## 🚀 Setup Kaise Karein (Step by Step)

### Step 1: Database Update Karo

```bash
cd packages/prisma
npx prisma migrate dev --name add_admin_models
npx prisma generate
```

Yeh command database mein admin tables create karega.

### Step 2: Pehla Admin Account Banao

```bash
cd packages/prisma
node seedAdmin.js
```

**Default Login Credentials:**
- Email: `admin@roomsdekho.com`
- Password: `admin123`

⚠️ **Important**: Production mein password change kar dena!

### Step 3: Backend Setup

```bash
cd apps/admin-panel/server

# Dependencies install karo
npm install

# .env file banao
cp .env.example .env
```

**`.env` file mein ye add karo:**

```env
PORT=5001
DATABASE_URL="postgresql://user:password@localhost:5432/roomsdekho"
DIRECT_URL="postgresql://user:password@localhost:5432/roomsdekho"
JWT_SECRET="apna-secret-key-idhar-daalo"
JWT_EXPIRES_IN="7d"

# AWS S3 (for images)
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="apni-aws-access-key"
AWS_SECRET_ACCESS_KEY="apni-aws-secret-key"
AWS_S3_BUCKET="apna-bucket-name"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

**Backend Start Karo:**
```bash
npm run dev
```

Backend ab `http://localhost:5001` pe chalega.

### Step 4: Frontend Setup

```bash
cd apps/admin-panel/client

# Dependencies install karo
npm install

# .env.local file banao
echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local
```

**Frontend Start Karo:**
```bash
npm run dev
```

Frontend ab `http://localhost:3001` pe chalega.

### Step 5: Dono Ek Saath Chalao (Optional)

```bash
cd apps/admin-panel
npm install
npm run dev
```

Yeh backend aur frontend dono ek saath start kar dega!

---

## 🎮 Kaise Use Karein

### 1. Login Karo
- Browser mein jao: `http://localhost:3001/login`
- Email: `admin@roomsdekho.com`
- Password: `admin123`
- Login karo

### 2. Dashboard Dekho
- Login ke baad dashboard khulega
- Yahan pe sabhi statistics dikhenge:
  - Total Users
  - Total Owners
  - Total Properties
  - Verified/Not Verified counts
  - Recent activities

### 3. Properties Manage Karo

**Properties List:**
- Left sidebar se "Properties" pe click karo
- Sabhi properties dikhengi with images
- Search kar sakte ho city, type se
- Filter kar sakte ho verification status se

**Property Details:**
- Kisi property pe click karo
- Complete details dikhegi with S3 photos
- Edit button se details edit kar sakte ho
- Verify/Reject buttons se verification handle karo

**Property Verify Karna:**
1. Property detail page pe jao
2. "Verification Notes" mein notes likho
3. "Verify Property" (green button) ya "Reject Verification" (red button) pe click karo
4. Verify karne pe:
   - Property 3 mahine ke liye verified ho jayegi
   - Owner ko notification jayegi (agar implement kiya hai)
5. Reject karne pe:
   - Owner ko dobara ₹149 payment karni padegi

### 4. Verification Requests Handle Karo

- "Verifications" section mein jao
- Pending requests dikhengi
- Property details aur photos dekh sakte ho
- Quick approve/reject kar sakte ho
- Notes add kar sakte ho

### 5. Employee Management (Main Admin Only)

**Employee Create Karna:**
1. "Employees" section mein jao
2. "Add Employee" button click karo
3. Details bharo (name, email, phone, password)
4. Permissions select karo:
   - Can View Users
   - Can Handle Users
   - Can View Owners
   - Can Handle Owners
   - Can View Properties
   - Can Edit Properties
   - Can Verify Properties
   - Can View Reports
5. "Create Employee" click karo

**Permissions Edit Karna:**
1. Employee ke saamne Edit button click karo
2. Checkboxes se permissions change karo
3. "Save Changes" click karo

### 6. Users aur Owners Manage Karo

**Users:**
- "Users" section mein sabhi users dikenge
- Search kar sakte ho
- Filter kar sakte ho (verified/not verified)
- Delete kar sakte ho (agar permission hai)

**Owners:**
- "Owners" section mein sabhi owners dikenge
- Unki properties count bhi dikhega
- Plan type dikhega (FREE/BASIC/PREMIUM)
- Search aur filter kar sakte ho

---

## 🔐 Permissions System

### Main Admin
- **Sabkuch kar sakta hai!**
- Koi restriction nahi
- Employees banaa sakta hai
- Permissions de sakta hai

### Employee Permissions

| Permission | Kya Kar Sakta Hai |
|-----------|------------------|
| `canViewUsers` | Users ki list aur details dekh sakta |
| `canHandleUsers` | Users ko edit/delete kar sakta |
| `canViewOwners` | Owners ki list aur details dekh sakta |
| `canHandleOwners` | Owners ko edit/delete kar sakta |
| `canViewProperties` | Properties dekh sakta |
| `canEditProperties` | Properties ko edit/delete kar sakta |
| `canVerifyProperties` | Properties verify/reject kar sakta |
| `canViewReports` | Reports aur analytics dekh sakta |

**Example:**
Agar employee ko sirf verification handle karna hai:
- ✅ `canViewProperties` - ON
- ✅ `canVerifyProperties` - ON
- ❌ `canEditProperties` - OFF
- ❌ Baaki sab - OFF

---

## 📱 API Endpoints (For Developers)

Base URL: `http://localhost:5001/api`

### Main Endpoints:

**Authentication:**
- POST `/admin/auth/login` - Login
- GET `/admin/auth/profile` - Profile
- POST `/admin/auth/change-password` - Password change

**Dashboard:**
- GET `/admin/dashboard/stats` - Statistics

**Properties:**
- GET `/admin/properties` - List
- GET `/admin/properties/:id` - Details
- PUT `/admin/properties/:id` - Update
- POST `/admin/properties/:id/verify` - Verify/Reject

**Verifications:**
- GET `/admin/verifications` - List
- POST `/admin/verifications/:id/review` - Approve/Reject

**Employees (Main Admin only):**
- GET `/admin/employees` - List
- POST `/admin/employees` - Create
- PUT `/admin/employees/:id/permissions` - Update permissions

---

## 🐛 Common Problems & Solutions

### 1. Login nahi ho raha
**Problem:** "Invalid credentials" error
**Solution:**
- Check karo admin account create hua ya nahi: `node seedAdmin.js`
- Database connection check karo
- JWT_SECRET .env mein hai ya nahi check karo

### 2. Images nahi dikh rahe
**Problem:** Property images load nahi ho rahe
**Solution:**
- AWS credentials sahi hai ya nahi check karo
- S3 bucket permissions check karo
- Console mein errors dekho

### 3. Permission denied error
**Problem:** "You do not have permission" error
**Solution:**
- Check karo employee ke paas permission hai ya nahi
- Main Admin login karke permissions update karo

### 4. Database migration error
**Problem:** Tables create nahi ho rahe
**Solution:**
```bash
cd packages/prisma
npx prisma migrate reset
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Port already in use
**Problem:** "Port 5001 is already in use"
**Solution:**
- Backend .env mein PORT change karo
- Ya running process ko stop karo

---

## 📊 Dashboard Stats Explained

**Total Users:** Platform pe registered users
**Total Owners:** Property owners
**Total Properties:** Sabhi properties
**Verified Properties:** Jo verify ho chuki hain
**Not Verified:** Jo abhi verify nahi hui
**Pending Verifications:** Jo review ke liye wait kar rahi

---

## 🎉 Congratulations!

Aapka admin panel ab ready hai! 

**Next Steps:**
1. ✅ Production ke liye password change karo
2. ✅ Employees create karo
3. ✅ Permissions assign karo
4. ✅ Verification requests handle karo
5. ✅ Properties manage karo

**Support:**
Koi problem ho toh:
1. Terminal logs check karo
2. Browser console check karo
3. Database connection verify karo
4. Environment variables check karo

---

## 📝 Important Notes

1. **Security:**
   - Production mein default password change karna zaroori hai
   - JWT_SECRET strong rakho
   - HTTPS use karo production mein

2. **Backup:**
   - Regular database backups lo
   - Activity logs dekho

3. **Verification:**
   - Rejected properties ko dobara payment karni padegi
   - Verified properties 3 months valid rahti hain
   - Expiry ke baad renewal karni padegi

4. **S3 Images:**
   - Images presigned URLs se serve hoti hain
   - URLs 1 hour valid rahte hain
   - Automatic refresh ho jate hain

---

## 🚀 Production Deployment

### Backend:
```bash
cd apps/admin-panel/server
npm run build
npm start
```

### Frontend:
```bash
cd apps/admin-panel/client
npm run build
npm start
```

### Database:
```bash
npx prisma migrate deploy
```

---

## 📞 Contact & Support

Admin panel ke baare mein koi sawal ho toh documentation check karo ya developers se contact karo.

**Happy Managing! 🎊**
