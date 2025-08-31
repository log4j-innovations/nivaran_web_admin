# Municipal Hazard Dashboard - Role-Based System (MVP)

A comprehensive role-based dashboard system for managing municipal infrastructure issues with Indian municipal context and Firebase integration.

## 🚀 Features

### **Role-Based Access Control**
- **Super Admin**: System overview, user management, administration
- **City Engineer**: Issue management, field supervision, SLA monitoring
- **Field Supervisor**: Task execution, field operations, progress tracking
- **Auditor**: Compliance monitoring, performance verification, audit reports

### **Municipal Safety Theme**
- Professional municipal authority color scheme
- Indian municipal context and data
- Mobile-first responsive design
- Real-time data from Firebase

### **Firebase Integration**
- Authentication with role-based access
- Firestore database for real-time data
- Storage for images and attachments
- Security rules for data protection

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore and Storage enabled
- Google Maps API key (optional, for future map features)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd admin_dashboard2
npm install
```

### 2. Firebase Configuration

The project is already configured with your Firebase credentials:



### 3. Firebase Project Setup

1. **Enable Authentication**:
   - Go to Firebase Console → Authentication
   - Enable Email/Password authentication
   - Create test users for each role (see Test Accounts below)

2. **Enable Firestore**:
   - Go to Firebase Console → Firestore Database
   - Create database in test mode
   - Deploy security rules from `firestore.rules`

3. **Enable Storage**:
   - Go to Firebase Console → Storage
   - Create storage bucket
   - Deploy storage rules from `storage.rules`

### 4. Deploy Security Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select your project)
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 5. Create Test Users

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Create users in Firebase Authentication**:
   - Go to Firebase Console → Authentication → Users
   - Add users manually with the test accounts below
   - Set appropriate passwords for each user

3. **Add user data to Firestore**:
   - Go to Firebase Console → Firestore Database
   - Create a `users` collection
   - Add user documents with role and profile information

## 👥 Test Accounts

Create these test accounts in Firebase Authentication:

| Role | Email | Password | Access |
|------|-------|----------|---------|
| Super Admin | superadmin@delhi.gov.in | (set in Firebase Auth) | Full system access |
| Engineer | engineer@delhi.gov.in | (set in Firebase Auth) | Issue management |
| Supervisor | supervisor@delhi.gov.in | (set in Firebase Auth) | Field operations |
| Auditor | auditor@delhi.gov.in | (set in Firebase Auth) | Compliance monitoring |

**Important**: You must create these users in Firebase Authentication manually with matching emails and passwords.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/           # Authentication pages
│   ├── admin/            # Super Admin dashboard
│   ├── engineer/         # City Engineer dashboard
│   ├── supervisor/       # Field Supervisor dashboard
│   ├── auditor/          # Auditor dashboard

├── components/            # Reusable components
│   └── layout/           # Layout components
├── lib/                  # Utilities and services
│   ├── firebase.ts       # Firebase configuration
│   ├── firebaseServices.ts # Firebase operations

│   ├── authContext.tsx   # Authentication context
│   ├── types.ts          # TypeScript interfaces
│   └── toastContext.tsx  # Toast notifications
└── globals.css           # Global styles
```

## 🔐 Security Features

### **Firestore Rules**
- Role-based access control
- User data protection
- Issue management permissions
- Area and analytics access control

### **Storage Rules**
- Profile image protection
- Issue image access control
- Report attachment security

### **Authentication**
- JWT-based authentication
- Role claims in user documents
- Session persistence

## 📊 Data Structure

### **Users Collection**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'SuperAdmin' | 'Engineer' | 'Supervisor' | 'Auditor';
  department?: string;
  phone?: string;
  assignedAreas?: string[];
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date;
  profileImage?: string;
}
```

### **Issues Collection**
```typescript
interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'pothole' | 'street_light' | 'water_leak' | 'traffic_signal' | 'sidewalk' | 'drainage' | 'debris' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  reportedBy: string;
  assignedTo?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  slaDeadline: Date;
  area: string;
  tags: string[];
  estimatedCost?: number;
  actualCost?: number;
  contractorId?: string;
}
```

### **Areas Collection**
```typescript
interface Area {
  id: string;
  name: string;
  city: string;
  state: string;
  population: number;
  priority: 'high' | 'medium' | 'low';
  slaTargets: Record<string, Record<string, number>>;
  boundaries: Array<{ latitude: number; longitude: number }>;
  createdAt: Date;
}
```

## 🚀 Development

### **Start Development Server**
```bash
npm run dev
```

### **Build for Production**
```bash
npm run build
npm start
```

### **Lint and Type Check**
```bash
npm run lint
npm run type-check
```

## 🌍 Indian Municipal Context

The system is designed specifically for Indian municipal operations:

- **Cities**: Delhi NCR, Rajkot, Gujarat areas
- **SLA Targets**: Based on Indian municipal standards
- **Phone Numbers**: +91 format
- **Addresses**: Indian city and state structure
- **Population Data**: Based on Indian census data

## 📱 Mobile Optimization

- Responsive grid system
- Touch-friendly interface
- Mobile-first navigation
- Adaptive layouts for all screen sizes

## 🔄 Real-Time Features

- Live dashboard updates
- Real-time issue tracking
- Instant notifications
- Live SLA monitoring

## 🚨 SLA Management

- Priority-based SLA targets
- Automatic escalation rules
- Compliance monitoring
- Performance analytics

## 📈 Analytics & Reporting

- Dashboard statistics
- Issue trend analysis
- SLA compliance metrics
- Area performance tracking

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Firebase Hosting**
```bash
npm run build
firebase deploy --only hosting
```

## 🐛 Troubleshooting

### **Common Issues**

1. **Firebase Connection Error**:
   - Verify Firebase config in `src/lib/firebase.ts`
   - Check Firestore rules deployment
   - Ensure project ID matches

2. **Authentication Issues**:
   - Verify Firebase Auth is enabled
   - Check user creation in Firebase Console
   - Verify role assignments in Firestore

3. **Permission Denied**:
   - Deploy updated Firestore rules
   - Check user role in database
   - Verify collection access permissions

### **Debug Mode**
Enable debug logging in browser console:
```typescript
// Add to any component
console.log('Debug info:', { user, data });
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review Firebase documentation
- Open an issue in the repository

## 🎯 Roadmap

- [ ] Google Maps integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] API endpoints for external systems
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**Built with ❤️ for Indian Municipal Infrastructure Management**
