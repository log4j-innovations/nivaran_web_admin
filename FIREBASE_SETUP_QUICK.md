# 🔥 Quick Firebase Setup to Fix Authentication

## 🚨 **Current Issue**
Your authentication is stuck in "Checking authentication..." because Firebase isn't configured.

## ⚡ **Quick Fix (5 minutes)**

### **Step 1: Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Give it a name (e.g., "municipal-dashboard")
4. Follow the setup wizard

### **Step 2: Enable Authentication**
1. In your Firebase project, click "Authentication" in left sidebar
2. Click "Get started"
3. Click "Email/Password" tab
4. Click "Enable" and "Save"

### **Step 3: Get Configuration**
1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register app with name "Municipal Dashboard"
6. Copy the config object

### **Step 4: Create Environment File**
Create `.env.local` file in your project root (same folder as `package.json`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
```

### **Step 5: Restart Development Server**
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ **What This Fixes**
- Authentication flow will work properly
- No more "stuck in checking" issue
- Users can login/logout
- Session persistence will work

## 🧪 **Test the Fix**
1. Refresh your browser at `http://localhost:3000`
2. You should see the login page (not stuck loading)
3. Try logging in with test credentials

## 🔑 **Test Users to Create**
In Firebase Console > Authentication > Users, add these test users:

| Email | Password | Role |
|-------|----------|------|
| `admin@municipal.com` | `admin123` | super_admin |
| `engineer@municipal.com` | `engineer123` | city_engineer |
| `supervisor@municipal.com` | `supervisor123` | field_supervisor |
| `auditor@municipal.com` | `auditor123` | auditor |

## 🆘 **Still Having Issues?**
1. Check browser console for errors
2. Verify `.env.local` file is in project root
3. Make sure you restarted the dev server
4. Check that Firebase project is in same region as your location

## 📱 **Next Steps After Fix**
Once authentication works:
1. Test login with different user roles
2. Verify dashboard access control
3. Test session persistence (refresh browser)
4. Configure Firestore database rules

---

**Time to complete:** ~5 minutes  
**Difficulty:** Easy  
**Result:** Working authentication system! 🎉
