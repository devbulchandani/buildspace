# Backend API Integration Documentation

## Overview
This document describes the complete backend API integration implemented in the frontend application.

## API Endpoints Integrated

### Authentication APIs (`/api/auth`)
- **POST /api/auth/register** - User registration
- **POST /api/auth/login** - User login

### Learning Plan APIs (`/api/plans`)
- **POST /api/plans** - Create a new learning plan

### Chat APIs (`/api/chat`)
- **POST /api/chat** - Send message to AI mentor

### Verification APIs (`/api/verify`)
- **POST /api/verify/{milestoneId}** - Verify milestone completion

## File Structure

```
frontend/src/
├── api/
│   ├── axiosClient.js       # Axios instance with interceptors
│   ├── authApi.js           # Authentication API calls
│   ├── planApi.js           # Learning plan API calls
│   ├── chatApi.js           # Chat API calls
│   ├── verificationApi.js   # Milestone verification API calls
│   └── index.js             # API exports
├── store/
│   └── useAppStore.js       # Zustand store with API integration
└── pages/
    ├── Login.jsx            # Login/Register with API
    ├── CreatePlan.jsx       # Create plan with API
    ├── Chat.jsx             # Chat with API
    ├── MilestoneDetail.jsx  # Milestone verification with API
    └── Dashboard.jsx        # Dashboard with real data
```

## Features Implemented

### 1. Authentication
- Login and registration forms
- JWT token storage in localStorage
- Automatic token injection in API requests
- Auto-redirect on 401 errors
- Error handling and display

### 2. Learning Plan Creation
- Form submission to backend
- Real-time loading states
- Error handling
- Automatic navigation on success
- Store updates with plan data

### 3. AI Chat
- Real-time messaging with AI mentor
- Loading states during API calls
- Context-aware chat (includes learning plan and repo URL)
- Error handling

### 4. Milestone Verification
- Repository verification via API
- AI feedback display
- Success/error states
- Milestone status updates

### 5. State Management
- Zustand store integrated with APIs
- User authentication state
- Current plan and milestones
- Repository URL management

## API Client Configuration

### Base URL
```javascript
baseURL: 'http://localhost:8080/api'
```

### Request Interceptor
- Automatically adds JWT token to Authorization header
- Token retrieved from localStorage

### Response Interceptor
- Handles 401 errors (unauthorized)
- Clears token and redirects to login

## Usage Examples

### Login
```javascript
const { login } = useAppStore();
const result = await login(email, password);
if (result.success) {
  // Navigate to dashboard
}
```

### Create Plan
```javascript
import { planApi } from '../api/planApi';
const planData = await planApi.createPlan(technology, duration, skillLevel);
```

### Send Chat Message
```javascript
import { chatApi } from '../api/chatApi';
const response = await chatApi.sendMessage(planId, message, repoUrl);
```

### Verify Milestone
```javascript
import { verificationApi } from '../api/verificationApi';
const result = await verificationApi.verifyMilestone(milestoneId, repoUrl);
```

## Error Handling

All API calls include try-catch blocks with:
- Console error logging
- User-friendly error messages
- Loading state management
- Fallback UI states

## Security

- JWT tokens stored in localStorage
- Tokens automatically included in requests
- Auto-logout on authentication failures
- HTTPS recommended for production

## Testing

To test the integration:
1. Start backend server: `cd backend && ./mvnw spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Test authentication flow
4. Create a learning plan
5. Test chat functionality
6. Verify milestone completion

## Notes

- All UI components remain unchanged
- Only data flow and API integration added
- Backward compatible with existing UI
- Ready for production deployment
