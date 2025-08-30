# Authentication Flow Implementation

## Overview

The Municipal Dashboard now implements a robust authentication flow using Firebase Authentication with proper session persistence and role-based access control. The system follows the exact flow you specified:

1. **Check Authentication Status** - Firebase `onAuthStateChanged()` listener
2. **If logged in** - Show dashboard
3. **If not logged in** - Show login screen

## Implementation Details

### 1. Firebase Authentication Setup

#### Session Persistence
```typescript
// Set persistence to LOCAL (persists across browser sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('⚠️ Firebase: Failed to set persistence:', error);
});
```

- **LOCAL persistence**: User stays logged in across browser sessions
- **Automatic session restoration**: No need to re-enter credentials
- **Secure token management**: Firebase handles token refresh automatically

#### Authentication Service
```typescript
export const firebaseAuth = {
  signIn: async (email: string, password: string) => {
    // Secure email/password authentication
  },
  signUp: async (email: string, password: string, userData) => {
    // User registration with Firestore integration
  },
  signOut: async () => {
    // Secure logout with session cleanup
  },
  onAuthStateChanged: (callback) => {
    // Real-time authentication state listener
  }
};
```

### 2. Authentication Context (`src/lib/authContext.tsx`)

#### State Management
- **`user`**: Custom user object with role and permissions
- **`firebaseUser`**: Firebase Auth user object
- **`loading`**: Authentication state loading indicator

#### Authentication Flow
```typescript
useEffect(() => {
  // Initialize Firebase auth state listener
  const initializeAuth = async () => {
    try {
      // Listen for Firebase auth state changes
      unsubscribeRef.current = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch user data from Firestore
          const userData = await firestoreService.getUser(firebaseUser.uid);
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);
```

#### Key Features
- **Real-time state updates**: Immediate response to authentication changes
- **Error handling**: Graceful fallback for failed operations
- **Timeout protection**: Prevents infinite loading states
- **Automatic cleanup**: Proper resource management

### 3. Home Page Flow (`src/app/page.tsx`)

#### Authentication Check Flow
```typescript
useEffect(() => {
  // Only redirect when loading is complete
  if (!loading) {
    if (user) {
      // User authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // No user, redirect to login
      router.push('/login');
    }
  }
}, [user, loading, router]);
```

#### State Management
- **Loading state**: Shows "Checking authentication..." while verifying
- **Redirecting state**: Shows "Redirecting..." during navigation
- **Timeout protection**: 15-second safety timeout for infinite loading

### 4. Role-Based Access Control

#### RoleGuard Component
```typescript
<RoleGuard allowedRoles={['super_admin', 'city_engineer']} requireAuth={true}>
  <ProtectedContent />
</RoleGuard>
```

#### Features
- **Role validation**: Checks user permissions before rendering
- **Authentication requirement**: Ensures users are logged in
- **Graceful fallbacks**: User-friendly access denied messages
- **Automatic redirects**: Sends unauthorized users to appropriate pages

### 5. Login Page (`src/app/login/page.tsx`)

#### Authentication Process
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await signIn(email, password);
    // User will be automatically redirected via auth context
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

#### Features
- **Form validation**: Required fields and email format validation
- **Error handling**: User-friendly error messages
- **Loading states**: Visual feedback during authentication
- **Automatic redirect**: Seamless flow to dashboard after login

### 6. Dashboard Protection

#### Layout Protection (`src/app/dashboard/layout.tsx`)
```typescript
useEffect(() => {
  if (!loading && !user) {
    router.push('/login');
  }
}, [user, loading, router]);
```

#### Features
- **Route protection**: Prevents unauthorized dashboard access
- **Automatic redirects**: Sends unauthenticated users to login
- **Loading states**: Prevents flash of unauthorized content

## User Flow Diagram

```
User Opens Site
       ↓
Check Authentication Status
       ↓
   ┌─────────────────┐
   │ Firebase Auth   │
   │ State Listener  │
   └─────────────────┘
       ↓
   ┌─────────────────┐
   │   Loading...    │
   │  (Checking)     │
   └─────────────────┘
       ↓
   ┌─────────────────┐
   │ User Logged In? │
   └─────────────────┘
       ↓
   ┌─────────┬───────┐
   │   YES   │   NO  │
   └─────────┴───────┘
       ↓         ↓
  Dashboard   Login Page
       ↓         ↓
  Role-Based   Authenticate
  Access       ↓
       ↓     Dashboard
  Protected
  Content
```

## Security Features

### 1. Session Management
- **Secure tokens**: Firebase handles JWT token management
- **Automatic refresh**: Tokens refresh before expiration
- **Persistent sessions**: Users stay logged in across browser restarts

### 2. Role-Based Access
- **Permission validation**: Server-side and client-side checks
- **Route protection**: Unauthorized access prevention
- **Graceful degradation**: User-friendly access denied messages

### 3. Error Handling
- **Timeout protection**: Prevents infinite loading states
- **Fallback users**: Graceful handling of missing Firestore data
- **Error boundaries**: Catches and handles authentication errors

## Testing the Authentication Flow

### 1. Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 2. Test Scenarios
- **Fresh visit**: Should redirect to login if not authenticated
- **After login**: Should redirect to dashboard
- **Session persistence**: Should stay logged in after browser restart
- **Role access**: Should show appropriate content based on user role

### 3. Test Users (Configure in Firebase Console)
```env
# Super Admin
admin@municipal.com / admin123

# City Engineer
engineer@municipal.com / engineer123

# Field Supervisor
supervisor@municipal.com / supervisor123

# Auditor
auditor@municipal.com / auditor123
```

## Environment Variables Required

Create `.env.local` file in project root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Firebase Console Setup

### 1. Authentication
- Enable Email/Password authentication
- Add test users with appropriate roles
- Configure password policies

### 2. Firestore Database
- Create `users` collection
- Set up security rules for role-based access
- Configure indexes for efficient queries

### 3. Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'city_engineer'];
    }
  }
}
```

## Performance Optimizations

### 1. Loading States
- **Immediate feedback**: Loading indicators for all async operations
- **Timeout protection**: Prevents infinite loading scenarios
- **Progressive enhancement**: Content loads as authentication completes

### 2. Error Boundaries
- **Graceful degradation**: Fallback UI for authentication failures
- **User feedback**: Clear error messages and recovery options
- **Logging**: Comprehensive error logging for debugging

### 3. Resource Management
- **Proper cleanup**: Unsubscribe from Firebase listeners
- **Memory management**: Clear timeouts and references
- **Efficient queries**: Optimized Firestore queries with timeouts

## Troubleshooting

### Common Issues

#### 1. Infinite Loading
- Check Firebase configuration
- Verify environment variables
- Check browser console for errors

#### 2. Authentication Failures
- Verify Firebase project settings
- Check user credentials in Firebase Console
- Ensure Firestore rules allow access

#### 3. Role Access Issues
- Verify user role in Firestore
- Check RoleGuard component configuration
- Ensure proper role names in code

### Debug Mode
Enable detailed logging by checking browser console:
- Authentication state changes
- Firestore query results
- Redirect operations
- Error messages

## Conclusion

The authentication flow is now fully implemented with:

✅ **Firebase Authentication** with session persistence  
✅ **Real-time state management** via `onAuthStateChanged()`  
✅ **Automatic redirects** based on authentication status  
✅ **Role-based access control** with proper protection  
✅ **Error handling** and timeout protection  
✅ **Loading states** for better user experience  
✅ **Session persistence** across browser sessions  

The system automatically handles the flow you specified:
1. **Check Authentication Status** ✅
2. **If logged in** → Show dashboard ✅  
3. **If not logged in** → Show login screen ✅

Users can now seamlessly navigate the application with secure, persistent authentication and appropriate role-based access control.
