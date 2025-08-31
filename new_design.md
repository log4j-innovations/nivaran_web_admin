# New Design Document - Role-Based Dashboard System (MVP)

## Overview

This document outlines the **MVP version** of the role-based dashboard system for the Municipal Hazard Dashboard, designed for hackathon implementation. Focused on **4 core roles** with **minimal essential functionalities**, clean responsive design and municipal safety theme.

## 🎯 **Core Design Principles (MVP)**

- **Role-Based Access Control**: Simple, clear role separation (4 roles with minimal features)
- **Municipal Safety Theme**: Consistent with road safety branding
- **Mobile-First Design**: Optimized for all devices
- **Clean UI/UX**: Simple, intuitive interfaces
- **Minimal Features Only**: Core functionality for hackathon MVP

## 🏗️ **Technical Architecture (Simplified)**

### **Authentication & Authorization**
```typescript
interface AuthSystem {
  login: 'JWT Role Token Based';
  roles: ['SuperAdmin', 'Engineer', 'Supervisor', 'Auditor'];
  tokenStorage: 'Secure HTTP-only cookies';
  sessionTimeout: '8 hours';
}
```

### **Routing Structure**
```typescript
// Simple role-based routing (4 roles)
const roleRoutes = {
  SuperAdmin: '/admin',
  Engineer: '/engineer', 
  Supervisor: '/supervisor',
  Auditor: '/auditor'
};
```

### **Data Access Layers**
```typescript
interface DataAccess {
  SuperAdmin: 'Basic system access';
  Engineer: 'Basic issue management';
  Supervisor: 'Basic task management';
  Auditor: 'Basic data viewing';
}
```

## 📊 **Role Dashboards (MVP - 4 Roles, Minimal Features)**

### 1. **Super Admin Dashboard** 🔑
*Basic system administration*

#### **Core Functionalities (MVP - Minimal)**
- **User Management**
  - View all users
  - Add new user (basic)

- **System Overview**
  - Total issues count
  - Active users count

- **Quick Actions**
  - Add User
  - View Reports

#### **Dashboard Layout**
```typescript
interface SuperAdminDashboard {
  layout: 'grid-cols-1 md:grid-cols-2';
  widgets: [
    'TotalIssues',
    'ActiveUsers'
  ];
  quickActions: [
    'AddUser',
    'ViewReports'
  ];
}
```

#### **Data Access**
🔑 **Basic system access**

---

### 2. **City Engineer Dashboard** 🏗️
*Basic issue management*

#### **Core Functionalities (MVP - Minimal)**
- **Issue Management**
  - View issues
  - Assign issue to supervisor
  - Update issue status

- **Quick Actions**
  - Assign Issue
  - Update Status

#### **Dashboard Layout**
```typescript
interface EngineerDashboard {
  layout: 'grid-cols-1 md:grid-cols-2';
  widgets: [
    'IssueOverview',
    'RecentActivity'
  ];
  quickActions: [
    'AssignIssue',
    'UpdateStatus'
  ];
}
```

#### **Data Access**
🔑 **Basic issue management**

---

### 3. **Field Supervisor Dashboard** 🚧
*Basic task execution*

#### **Core Functionalities (MVP - Minimal)**
- **Task Management**
  - View assigned tasks
  - Update task status
  - Add simple note

- **Quick Actions**
  - Update Status
  - Add Note

#### **Dashboard Layout**
```typescript
interface SupervisorDashboard {
  layout: 'grid-cols-1 md:grid-cols-2';
  widgets: [
    'AssignedTasks',
    'TaskProgress'
  ];
  quickActions: [
    'UpdateStatus',
    'AddNote'
  ];
  mobileOptimized: true;
}
```

#### **Data Access**
🔑 **Basic task management**

---

### 4. **Auditor Dashboard** 📋
*Basic data viewing*

#### **Core Functionalities (MVP - Minimal)**
- **Data Viewing**
  - View all issues
  - Basic filter by status

- **Quick Actions**
  - View Reports
  - Filter Data

#### **Dashboard Layout**
```typescript
interface AuditorDashboard {
  layout: 'grid-cols-1 md:grid-cols-2';
  widgets: [
    'IssueOverview',
    'StatusBreakdown'
  ];
  quickActions: [
    'ViewReports',
    'FilterData'
  ];
}
```

#### **Data Access**
🔑 **Basic data viewing**

---

## ✅ **Implementation Approach (MVP - Minimal)**

### 1. **Authentication Flow**
```typescript
// Simple login flow (4 roles)
interface LoginFlow {
  step1: 'User enters email/password';
  step2: 'System validates and returns JWT with role';
  step3: 'Role-based redirect to dashboard';
}
```

### 2. **Role-Based Routing**
```typescript
// Simple route structure (4 roles)
const routes = {
  '/admin': 'Super Admin Dashboard',
  '/engineer': 'Engineer Dashboard',
  '/supervisor': 'Supervisor Dashboard',
  '/auditor': 'Auditor Dashboard'
};
```

### 3. **Component-Level Access Control**
```typescript
// Simple role guard (4 roles)
const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }
  
  return children;
};
```

### 4. **Conditional UI Rendering**
```typescript
// Simple conditional rendering (4 roles)
const DashboardActions = () => {
  const { user } = useAuth();
  
  return (
    <div className="dashboard-actions">
      {user.role === 'SuperAdmin' && (
        <button>Add User</button>
      )}
      
      {user.role === 'Engineer' && (
        <button>Assign Issue</button>
      )}
      
      {user.role === 'Supervisor' && (
        <button>Update Status</button>
      )}
      
      {user.role === 'Auditor' && (
        <button>View Reports</button>
      )}
    </div>
  );
};
```

## 🎨 **UI/UX Design Specifications (MVP)**

### **Color Scheme (Municipal Safety Theme)**
```css
:root {
  /* Primary - Municipal Authority Blue */
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  /* Secondary - Safety Orange */
  --secondary-500: #f97316;
  --secondary-600: #ea580c;
  
  /* Success - Road Sign Green */
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  /* Warning - Construction Yellow */
  --warning-500: #eab308;
  
  /* Danger - Emergency Red */
  --danger-500: #ef4444;
  --danger-600: #dc2626;
  
  /* Neutral - Professional Grays */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
}
```

### **Priority Color Coding**
```typescript
const priorityColors = {
  critical: '#dc2626', // Emergency red
  high: '#ea580c',     // Safety orange
  medium: '#eab308',   // Construction yellow
  low: '#16a34a'       // Road sign green
};
```

### **Typography Scale**
```css
/* Municipal-focused typography */
.text-display {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 700;
  font-size: 2rem;
  line-height: 1.2;
}

.text-heading {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.3;
}

.text-body {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.5;
}
```

### **Component Design Patterns**
```typescript
// Status indicators (minimal)
const statusConfig = {
  pending: {
    color: 'warning',
    icon: 'Clock',
    label: 'Pending',
    bgClass: 'bg-warning-50 text-warning-700 border-warning-200',
  },
  in_progress: {
    color: 'primary',
    icon: 'Wrench',
    label: 'In Progress',
    bgClass: 'bg-primary-50 text-primary-700 border-primary-200',
  },
  resolved: {
    color: 'success',
    icon: 'CheckCircle',
    label: 'Resolved',
    bgClass: 'bg-success-50 text-success-700 border-success-200',
  }
};

// Priority indicators (minimal)
const priorityConfig = {
  high: {
    color: 'secondary',
    icon: 'ChevronUp',
    bgClass: 'bg-secondary-100 text-secondary-600'
  },
  medium: {
    color: 'warning',
    icon: 'Equal',
    bgClass: 'bg-warning-100 text-warning-600'
  },
  low: {
    color: 'gray',
    icon: 'Minus',
    bgClass: 'bg-gray-100 text-gray-600'
  }
};
```

### **Responsive Design (MVP)**
```typescript
const responsiveBreakpoints = {
  mobile: 'max-width: 768px',
  tablet: 'min-width: 769px and max-width: 1024px',
  desktop: 'min-width: 1025px'
};

const mobileOptimizations = {
  touchTargets: '44px minimum',
  simpleNavigation: true,
  optimizedForms: true
};
```

## 🔒 **Security & Access Control (MVP)**

### **Data Isolation**
```typescript
interface DataIsolation {
  SuperAdmin: 'Basic system access';
  Engineer: 'Basic issue management';
  Supervisor: 'Basic task management';
  Auditor: 'Basic data viewing';
}
```

### **API Security**
```typescript
interface APISecurity {
  authentication: 'JWT tokens with role claims';
  authorization: 'Basic role-based endpoint access';
  dataFiltering: 'Server-side role-based filtering';
}
```

## 📱 **Mobile & Responsive Features (MVP)**

### **Mobile Optimizations**
```typescript
interface MobileFeatures {
  touchOptimized: 'Large touch targets';
  responsiveLayout: 'Adaptive grid system';
  mobileNavigation: 'Simple navigation menu';
  optimizedForms: 'Mobile-friendly input fields';
}
```

### **Responsive Grid System**
```css
/* Mobile-first responsive design */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding: 0 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 0 2rem;
  }
}
```

## 🚀 **Implementation Phases (MVP - Minimal)**

### **Phase 1: Core Setup (Day 1)**
- Project setup and authentication (4 roles)
- Basic routing structure
- Role-based access control

### **Phase 2: Dashboard Layouts (Day 2)**
- Dashboard layouts for 4 roles (minimal widgets)
- Basic components
- Responsive design implementation

### **Phase 3: Core Functionality (Day 3)**
- Basic issue management
- Simple CRUD operations
- Role-based data filtering

### **Phase 4: Polish & Testing (Day 4)**
- UI/UX improvements
- Testing and bug fixes
- Documentation

## 📁 **File Structure (MVP - 4 Roles, Minimal)**

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── admin/
│   │   └── page.tsx
│   ├── engineer/
│   │   └── page.tsx
│   ├── supervisor/
│   │   └── page.tsx
│   ├── auditor/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── table.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── RoleGuard.tsx
│   ├── dashboard/
│   │   ├── StatsGrid.tsx
│   │   ├── IssueTable.tsx
│   │   └── SimpleMap.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── lib/
│   ├── auth.ts
│   ├── constants.ts
│   └── types.ts
└── styles/
    ├── globals.css
    └── municipal-theme.css
```

## 🎯 **MVP Success Criteria (4 Roles, Minimal Features)**

### **Functional Requirements**
- ✅ User authentication with 4-role access
- ✅ Role-specific dashboards (minimal widgets)
- ✅ Basic issue management
- ✅ Responsive design on all devices
- ✅ Municipal safety theme implementation

### **Technical Requirements**
- ✅ JWT-based authentication (4 roles)
- ✅ Role-based routing
- ✅ Component-level access control
- ✅ Mobile-first responsive design
- ✅ Clean, maintainable code

### **UI/UX Requirements**
- ✅ Consistent municipal theme
- ✅ Intuitive navigation
- ✅ Mobile-optimized interface
- ✅ Professional appearance
- ✅ Accessibility considerations

---

**This MVP design document focuses on 4 essential roles with minimal features for hackathon implementation while maintaining professional UI/UX standards and municipal safety theme consistency.**
