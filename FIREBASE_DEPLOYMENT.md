# Firebase Security Rules Deployment

## Overview
The new Firebase security rules have been updated to support both the existing citizen app functionality and the new admin dashboard features.

## Key Changes

### 1. New Collections Supported
- **`issues`** - For admin dashboard issue management
- **`users`** - Enhanced with new role types

### 2. New Roles Added
- `super_admin` - Full access to all features
- `city_engineer` - Can manage issues and areas
- `field_supervisor` - Can update issue status and manage assignments
- `auditor` - Read access to all data, can generate reports

### 3. Preserved Functionality
- **Citizen app** continues to work with `reports` collection
- **Worker assignments** remain unchanged
- **Existing security** for `workers`, `assignments`, `areas` preserved

## Deployment Steps

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `authapp-3bd50`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules`
5. Paste and click **Publish**

### Option 2: Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Testing the Rules

### 1. Test Issue Creation
- Login as a user with role `super_admin`, `city_engineer`, `field_supervisor`, or `auditor`
- Navigate to `/issues` page
- Try to create a new issue
- Should work without permission errors

### 2. Test Citizen App
- Login as a citizen user
- Try to create a report in the `reports` collection
- Should continue to work as before

### 3. Test Role-Based Access
- Different roles should see different levels of access
- Super admins can delete issues
- Other roles can only read/update

## Troubleshooting

### Common Issues

1. **"Missing or insufficient permissions"**
   - Ensure user is authenticated
   - Check user role in Firestore
   - Verify rules are deployed

2. **"Invalid data" errors**
   - Check that all required fields are present
   - Ensure no `undefined` values are sent
   - Validate data types match rules

3. **Rules not taking effect**
   - Wait 1-2 minutes after deployment
   - Clear browser cache
   - Check Firebase Console for deployment status

### Verification Commands
```bash
# Check current rules
firebase firestore:rules:get

# Test rules locally (if using Firebase CLI)
firebase emulators:start --only firestore
```

## Rollback Plan
If issues arise, you can rollback to the previous rules:
1. Go to Firebase Console → Firestore → Rules
2. Click **History** tab
3. Select previous version and click **Restore**

## Support
For issues with the rules:
1. Check Firebase Console logs
2. Verify user authentication status
3. Test with different user roles
4. Check browser console for specific error messages
