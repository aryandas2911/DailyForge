# API Guide

This guide provides practical request and response examples for the REST API.

## Base URL
`/api`

## Authentication
Protected endpoints require the following header:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## Common Status Codes

- `200 OK` — Request succeeded.
- `201 Created` — Resource created successfully.
- `400 Bad Request` — Invalid or missing input.
- `401 Unauthorized` — Missing or invalid token.
- `404 Not Found` — Resource not found.
- `500 Internal Server Error` — Server-side failure.

---

## Authentication Endpoints

### POST `/api/auth/signup`

Register a new user.

**Auth Required:** No

**Request Body**
```json
{
  "name": "Raj",
  "email": "raj@example.com",
  "password": "Password@123"
}
```

**Success Response**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_123",
    "name": "Raj",
    "email": "raj@example.com"
  },
  "token": "jwt_token_here"
}
```

**Error Responses**
- `400 Bad Request` — Missing required fields or invalid email/password.
- `409 Conflict` — User already exists.
- `500 Internal Server Error` — Server error.

**cURL**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Raj","email":"raj@example.com","password":"Password@123"}'
```

---

### POST `/api/auth/login`

Login with email and password.

**Auth Required:** No

**Request Body**
```json
{
  "email": "raj@example.com",
  "password": "Password@123"
}
```

**Success Response**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_123",
    "name": "Raj",
    "email": "raj@example.com"
  },
  "token": "jwt_token_here"
}
```

**Error Responses**
- `400 Bad Request` — Missing email/password.
- `401 Unauthorized` — Invalid credentials.
- `500 Internal Server Error` — Server error.

**cURL**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"raj@example.com","password":"Password@123"}'
```

---

### POST `/api/auth/google-login`

Login using Google authentication.

**Auth Required:** No

**Request Body**
```json
{
  "idToken": "google_id_token_here"
}
```

**Success Response**
```json
{
  "success": true,
  "message": "Google login successful",
  "user": {
    "id": "user_123",
    "name": "Raj",
    "email": "raj@example.com"
  },
  "token": "jwt_token_here"
}
```

**Error Responses**
- `400 Bad Request` — Missing token.
- `401 Unauthorized` — Invalid Google token.
- `500 Internal Server Error` — Server error.

**cURL**
```bash
curl -X POST http://localhost:5000/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"google_id_token_here"}'
```

---

### GET `/api/auth/user`

Get the current authenticated user.

**Auth Required:** Yes

**Headers**
```http
Authorization: Bearer <token>
```

**Success Response**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "Raj",
    "email": "raj@example.com"
  }
}
```

**Error Responses**
- `401 Unauthorized` — Missing or invalid token.
- `404 Not Found` — User not found.

**cURL**
```bash
curl -X GET http://localhost:5000/api/auth/user \
  -H "Authorization: Bearer <token>"
```

---

### PUT `/api/auth/update-profile`

Update the current user's profile.

**Auth Required:** Yes

**Request Body**
```json
{
  "name": "Raj Singh",
  "email": "raj@example.com"
}
```

**Success Response**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_123",
    "name": "Raj Singh",
    "email": "raj@example.com"
  }
}
```

**Error Responses**
- `400 Bad Request` — Invalid input.
- `401 Unauthorized` — Missing or invalid token.
- `409 Conflict` — Email already in use.

**cURL**
```bash
curl -X PUT http://localhost:5000/api/auth/update-profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ankur Kumar Gupta","email":"ankur@example.com"}'
```

---

### POST `/api/auth/logout`

Log out the current user.

**Auth Required:** Yes

**Success Response**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses**
- `401 Unauthorized` — Missing or invalid token.

**cURL**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

---

## Tasks Endpoints

### POST `/api/tasks`

Create a new task.

**Auth Required:** Yes

**Request Body**
```json
{
  "title": "Finish DSA practice",
  "description": "Solve 5 graph problems",
  "priority": "high"
}
```

**Success Response**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": "task_123",
    "title": "Finish DSA practice",
    "description": "Solve 5 graph problems",
    "priority": "high",
    "completed": false,
    "createdAt": "2026-07-25T10:30:00.000Z"
  }
}
```

**Error Responses**
- `400 Bad Request` — Missing required fields.
- `401 Unauthorized` — Missing or invalid token.
- `500 Internal Server Error` — Server error.

**cURL**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Finish DSA practice","description":"Solve 5 graph problems","priority":"high"}'
```

---

### GET `/api/tasks`

Get all tasks for the authenticated user.

**Auth Required:** Yes

**Success Response**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task_123",
      "title": "Finish DSA practice",
      "description": "Solve 5 graph problems",
      "priority": "high",
      "completed": false
    }
  ]
}
```

**Error Responses**
- `401 Unauthorized` — Missing or invalid token.
- `500 Internal Server Error` — Server error.

**cURL**
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>"
```

---

### PUT `/api/tasks/:id`

Update a task by ID.

**Auth Required:** Yes

**Request Body**
```json
{
  "title": "Finish DSA practice",
  "completed": true
}
```

**Success Response**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "id": "task_123",
    "title": "Finish DSA practice",
    "completed": true
  }
}
```

**Error Responses**
- `400 Bad Request` — Invalid input.
- `401 Unauthorized` — Missing or invalid token.
- `404 Not Found` — Task not found.

**cURL**
```bash
curl -X PUT http://localhost:5000/api/tasks/task_123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Finish DSA practice","completed":true}'
```

---

### DELETE `/api/tasks/:id`

Delete a task by ID.

**Auth Required:** Yes

**Success Response**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses**
- `401 Unauthorized` — Missing or invalid token.
- `404 Not Found` — Task not found.

**cURL**
```bash
curl -X DELETE http://localhost:5000/api/tasks/task_123 \
  -H "Authorization: Bearer <token>"
```

---

## Routines Endpoints

### POST `/api/routines`

Create a new routine.

**Auth Required:** Yes

**Request Body**
```json
{
  "name": "Morning Workout",
  "description": "Push-ups, squats, stretching",
  "time": "07:00"
}
```

**Success Response**
```json
{
  "success": true,
  "message": "Routine created successfully",
  "routine": {
    "id": "routine_123",
    "name": "Morning Workout",
    "description": "Push-ups, squats, stretching",
    "time": "07:00"
  }
}
```

**Error Responses**
- `400 Bad Request` — Missing required fields.
- `401 Unauthorized` — Missing or invalid token.
- `500 Internal Server Error` — Server error.

**cURL**
```bash
curl -X POST http://localhost:5000/api/routines \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Morning Workout","description":"Push-ups, squats, stretching","time":"07:00"}'
```

---

### GET `/api/routines`

Get all routines for the authenticated user.

**Auth Required:** Yes

**Success Response**
```json
{
  "success": true,
  "routines": [
    {
      "id": "routine_123",
      "name": "Morning Workout",
      "description": "Push-ups, squats, stretching",
      "time": "07:00"
    }
  ]
}
```

**Error Responses**
- `401 Unauthorized` — Missing or invalid token.
- `500 Internal Server Error` — Server error.

**cURL**
```bash
curl -X GET http://localhost:5000/api/routines \
  -H "Authorization: Bearer <token>"
```

---

### PUT `/api/routines/:id`

Update a routine by ID.

**Auth Required:** Yes

**Request Body**
```json
{
  "name": "Morning Workout",
  "time": "06:30"
}
```

**Success Response**
```json
{
  "success": true,
  "message": "Routine updated successfully",
  "routine": {
    "id": "routine_123",
    "name": "Morning Workout",
    "time": "06:30"
  }
}
```

**Error Responses**
- `400 Bad Request` — Invalid input.
- `401 Unauthorized` — Missing or invalid token.
- `404 Not Found` — Routine not found.

**cURL**
```bash
curl -X PUT http://localhost:5000/api/routines/routine_123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Morning Workout","time":"06:30"}'
```

---

### DELETE `/api/routines/:id`

Delete a routine by ID.

**Auth Required:** Yes

**Success Response**
```json
{
  "success": true,
  "message": "Routine deleted successfully"
}
```

**Error Responses**
- `401 Unauthorized` — Missing or invalid token.
- `404 Not Found` — Routine not found.

**cURL**
```bash
curl -X DELETE http://localhost:5000/api/routines/routine_123 \
  -H "Authorization: Bearer <token>"
```

---

## Analytics Endpoint

### GET `/api/analytics`

Get analytics/statistics for the authenticated user.

**Auth Required:** Yes

**Success Response**
```json
{
  "success": true,
  "data": {
    "totalTasks": 12,
    "completedTasks": 8,
    "totalRoutines": 3
  }
}
```

**Error Responses**
- `401 Unauthorized` — Missing or invalid token.
- `500 Internal Server Error` — Server error.

**cURL**
```bash
curl -X GET http://localhost:5000/api/analytics \
  -H "Authorization: Bearer <token>"
```

---

## Postman Testing

You can import these endpoints into Postman and reuse the same Bearer token for protected routes. For all protected requests, set the `Authorization` header to `Bearer <token>` and `Content-Type` to `application/json` for body-based requests. [web:11][web:16]