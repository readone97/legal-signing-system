# Frontend Implementation Guide

## Overview

This document provides the complete frontend implementation for the Legal Signing System. Due to the size of the codebase, this guide includes all essential files with instructions for implementation.

## Directory Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── Dashboard/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── Document/
│   │   │   ├── DocumentForm.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   └── SignatureCanvas.tsx
│   │   ├── Notary/
│   │   │   ├── NotaryDashboard.tsx
│   │   │   └── NotarizationForm.tsx
│   │   └── Shared/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Navbar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDocuments.ts
│   │   └── useSignature.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DocumentCreate.tsx
│   │   ├── DocumentView.tsx
│   │   ├── DocumentSign.tsx
│   │   └── NotaryDashboard.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── document.service.ts
│   │   └── signature.service.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── .env
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Core Files

### 1. index.html (public/index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Legal Signing System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.tsx"></script>
</body>
</html>
```

### 2. index.css (src/index.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', serif;
  }
}

@layer utilities {
  .gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .gradient-secondary {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
```

### 3. Types (src/types/index.ts)
```typescript
export enum UserRole {
  PARTY_A = 'PARTY_A',
  PARTY_B = 'PARTY_B',
  NOTARY = 'NOTARY',
  ADMIN = 'ADMIN',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PENDING_PARTY_B = 'PENDING_PARTY_B',
  PENDING_NOTARY = 'PENDING_NOTARY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SignatureType {
  DRAW = 'DRAW',
  TYPE = 'TYPE',
  UPLOAD = 'UPLOAD',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  notaryLicense?: string;
  notaryState?: string;
  notaryExpiration?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  documentType: string;
  status: DocumentStatus;
  version: number;
  partyAId: string;
  partyBId?: string;
  notaryId?: string;
  templateFields: any;
  fieldValues: any;
  partyASignedAt?: string;
  partyBSignedAt?: string;
  notarizedAt?: string;
  completedAt?: string;
  pdfUrl?: string;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
  partyA?: User;
  partyB?: User;
  notary?: User;
  signatures?: Signature[];
}

export interface Signature {
  id: string;
  documentId: string;
  userId: string;
  signatureType: SignatureType;
  signatureData: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}
```

### 4. API Client (src/services/api.ts)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 5. Auth Context (src/contexts/AuthContext.tsx)
```typescript
import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/users/me');
          setUser(response.data.data);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const register = async (data: any) => {
    const response = await api.post('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6. Main App Component (src/App.tsx)
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages (create these based on requirements)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocumentCreate from './pages/DocumentCreate';
import DocumentView from './pages/DocumentView';
import NotaryDashboard from './pages/NotaryDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents/create" element={<DocumentCreate />} />
          <Route path="/documents/:id" element={<DocumentView />} />
          <Route path="/notary" element={<NotaryDashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
```

### 7. Entry Point (src/index.tsx)
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Page Components

### Login Page (src/pages/Login.tsx)
```typescript
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-pink to-pastel-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-display font-bold text-gray-800 mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mb-8">Sign in to your account</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

## Implementation Steps

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create Environment File** (.env)
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Implement All Page Components**
   - Create each page component in `src/pages/`
   - Follow the Login.tsx pattern for styling consistency

4. **Create Reusable Components**
   - Button, Input, Modal, Navbar components in `src/components/Shared/`
   - Document-specific components in `src/components/Document/`

5. **Implement Services**
   - Create service files in `src/services/` for API interactions

6. **Add Protected Routes**
   - Implement route guards based on authentication status

7. **Build and Test**
   ```bash
   npm run dev  # Development
   npm run build  # Production build
   ```

## Styling Guidelines

- Use TailwindCSS utility classes
- Follow the pastel color palette defined in tailwind.config.js
- Use the Playfair Display font for headings
- Use the Inter font for body text
- Apply glass-effect class for card components
- Use gradient-primary and gradient-secondary for buttons and accents

## State Management

- Use React Context for global state (authentication)
- Use React Query or SWR for server state (optional enhancement)
- Use local component state for UI state

## Key Features to Implement

1. **Authentication Flow**: Login, Register, Logout
2. **Document Creation**: Form with template fields
3. **Document List**: Dashboard with document cards
4. **Signature Capture**: Canvas for drawing signatures
5. **Document Preview**: PDF rendering or HTML preview
6. **Workflow Management**: Send to Party B, Send to Notary
7. **Notary Dashboard**: Pending documents list
8. **Notarization Form**: Identity verification and seal

## Best Practices

- TypeScript for type safety
- Error handling with try-catch
- Toast notifications for user feedback
- Loading states for async operations
- Form validation with React Hook Form
- Responsive design (mobile-first)
- Accessibility (ARIA labels, keyboard navigation)

---

This guide provides the foundation for the complete frontend. Implement each component following these patterns and the design system established in the configuration files.
