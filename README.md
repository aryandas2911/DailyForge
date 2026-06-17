<div align="center">

# 🔨 DailyForge

### Build routines. Forge habits. Own your week.

**DailyForge** is an open-source fullstack MERN productivity app that lets you design, manage, and visualize your weekly routines — with drag-and-drop scheduling, a smart task library, and overlap protection built right in.

[![GSSoC](https://img.shields.io/badge/GSSoC-2026-orange?style=for-the-badge)](https://gssoc.girlscript.tech/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)
[![Stars](https://img.shields.io/github/stars/aryandas2911/DailyForge?style=for-the-badge)](https://github.com/aryandas2911/DailyForge/stargazers)

[🌐 Live Demo](#-live-demo) · [⚡ Quick Start](#-quick-start) · [🤝 Contribute](#-contribution-guidelines) · [📸 Screenshots](#-screenshots)

</div>

---

## 📑 Table of Contents

- [🚀 Project Overview](#-project-overview)
- [🌐 Live Demo](#-live-demo)
- [✨ Features](#-features)
- [🏗 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [⚡ Quick Start](#-quick-start)
- [🔐 Environment Variables](#-environment-variables)
- [🌐 Google Authentication Setup](#-google-authentication-setup)
- [❓ FAQ](#-faq)
- [🛠 Troubleshooting](#-troubleshooting)
- [🤝 Contribution Guidelines](#-contribution-guidelines)
- [🏷 Issue Guidelines](#-issue-guidelines)
- [📸 Screenshots](#-screenshots)
- [📬 Getting Help](#-getting-help)
- [📬 Contact & Community](#-contact--community)

---

## 🚀 Project Overview

Most productivity tools are either too bloated or too simple. **DailyForge** is a no-nonsense weekly planner that gives you total control over your schedule — built by students, for students and professionals alike.

**What it does:**

- Build a reusable **task library** with custom durations, colors, and categories
- Design **weekly routines** by dragging tasks into a visual time grid
- Save, update, and delete **routines** with one click
- Automatically detects and prevents **scheduling conflicts** for the same day

**Why it matters:**  
Most people don't fail to plan — they fail to stick to a plan. DailyForge makes routines feel visual and deliberate, making habits easier to build and track.

**Key highlights:**

- ⚡ Drag-and-drop weekly planner powered by `@dnd-kit`
- 🔒 Secure JWT authentication with bcrypt password hashing
- 🗂️ Reusable routine templates to clone and reuse schedules
- 🚫 Conflict detection — no overlapping tasks on the same day
- 📱 Clean, responsive UI built with React 19 + Tailwind CSS v4

---

## 🌐 Live Demo

| Service        | URL                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------- |
| 🖥️ Frontend    | [https://dailyforge-frontend-lhjq.onrender.com](https://dailyforge-frontend-lhjq.onrender.com) |
| ⚙️ Backend API | [https://dailyforge-backend.onrender.com](https://dailyforge-backend.onrender.com)             |

> ⚠️ Deployed on Render's free tier — first load may take 30–60 seconds to spin up.

---

## ✨ Features

### 🔐 Authentication

- Signup / Login with JWT-based session management
- Protected routes — unauthenticated users are redirected to login
- Passwords hashed with bcrypt

### 📋 Task Management

- Create tasks with: title, duration, color, and category
- Edit and delete tasks from your personal task library
- Tasks persist across sessions

### 🗓️ Routine Builder

- Drag tasks from your library onto a **7-day weekly grid**
- Time-slot-based placement with visual feedback
- Overlap detection prevents conflicting task placement on the same day

### 📊 Dashboard

- **Interactive Contribution Heatmap**: A premium, GitHub-style 371-day productivity calendar that tracks consistency with stunning teal and glowing mint aesthetics.
  - **4-Level Visual Scale**: Cell intensities map to completed counts (1 task $\rightarrow$ low, 2 tasks $\rightarrow$ medium, 3+ tasks $\rightarrow$ perfect glowing mint).
  - **Streak & Productivity Tracking**: Real-time calculations of current streaks, longest streaks, total productive days, and average day-wise completion rate.
  - **Completing Date-Matching**: Tracks contributions using the actual task completion timestamp (`completedAt`), fully timezone-robust to your local browser.
  - **Micro-Animations & Smart Tooltips**: Staggered cell entry animations and edge-aware floating tooltips that slide horizontally to prevent bounding box clipping.
  - **Upcoming Days Protection**: Future dates automatically render as hidden, transparent slots until they arrive.
- View all saved routines at a glance
- Quick access to edit or delete any routine
- Summary stats for your weekly schedule and completion progress

### ♻️ Routine Templates

- Save any routine as a reusable template
- Re-apply templates to any week in seconds

---

## 🏗 Tech Stack

### Frontend

| Technology          | Purpose                                   |
| ------------------- | ----------------------------------------- |
| React 19            | UI framework                              |
| Vite                | Build tool & dev server                   |
| Tailwind CSS v4     | Utility-first styling                     |
| `@dnd-kit/core`     | Drag-and-drop interactions                |
| Axios               | HTTP client for API calls                 |
| React Router DOM v7 | Client-side routing                       |
| Lucide React        | Icon library                              |
| Context API         | Global auth state management              |
| Firebase Client     | Google Sign-In authentication integration |

### Backend

| Technology                  | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| Node.js                     | Runtime environment                          |
| Express.js v5               | REST API framework                           |
| MongoDB Atlas               | Cloud database                               |
| Mongoose v9                 | ODM for MongoDB                              |
| JSON Web Token (JWT)        | Stateless authentication                     |
| Bcrypt                      | Password hashing                             |
| Firebase token verification | RS256 Google ID token signature verification |
| dotenv                      | Environment variable management              |
| Nodemon                     | Dev server with hot-reload                   |

---

## 📂 Project Structure

```
DailyForge/
│
├── backend/
│   ├── config/                 # DB connection config
│   ├── controllers/
│   │   ├── authController.js   # Signup, login logic
│   │   ├── routineController.js
│   │   └── taskController.js
│   ├── middlewares/
│   │   └── authMiddleware.js   # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── routineRoutes.js
│   │   └── taskRoutes.js
│   ├── src/
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.model.js
│   │   │   ├── Task.model.js
│   │   │   └── Routine.model.js
│   │   └── server.js           # Express app entry point
│   ├── .env                    # ← You create this (see below)
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axiosConfig.js  # Axios base URL config
    │   ├── components/
    │   │   ├── Dashboard/
    │   │   ├── Routine/
    │   │   ├── Task/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoutes.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useTasks.js
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── RoutineBuilder.jsx
    │   │   ├── Tasks.jsx
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start

**Prerequisites:** Node.js v18+, npm v9+, a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### 1. Clone the repository

```bash
git clone https://github.com/aryandas2911/DailyForge.git
cd DailyForge
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

**Create your `.env` file from the given template** (see the [Environment Variables](#-environment-variables) section below):

```bash
# Inside the /backend directory

cp .env.example .env
```

Then fill in your values (see the next section for what each variable means).

> ⚠️ **Local dev note:** The backend CORS origin is already configured for both the deployed frontend (`https://dailyforge-frontend-lhjq.onrender.com`) and local development (`http://localhost:5173`) in `backend/src/server.js`. No changes are needed for local development.

**Start the backend dev server:**

```bash
npm run dev
```

> ✅ Server should start at `http://localhost:5000`

---

### 3. Set up the Frontend

Open a **new terminal**, then:

```bash
cd frontend
npm install
```

> 💡 **Local dev note:** To point the frontend to your local backend, copy `frontend/.env.example` to `frontend/.env` and ensure `VITE_API_URL` is set to `http://localhost:5000/api`.

**Start the frontend dev server:**

```bash
npm run dev
```

> ✅ App should open at `http://localhost:5173`

---

### ✅ You're ready!

Open `http://localhost:5173`, sign up for an account, and start building your routines.

---

## 🔐 Environment Variables

### Backend — `backend/.env`

Copy the provided template to get started. **Never commit the .env to git.**

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key_here
#CLIENT_ORIGIN=your_deployed_frontend_url
```

| Variable        | Required | Description                                                                                                                                                                                                                    |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`          | ✅       | Port on which the Express server runs (default: `5000`)                                                                                                                                                                        |
| `MONGO_URI`     | ✅       | Full MongoDB Atlas connection string — get it from your Atlas cluster's "Connect" menu                                                                                                                                         |
| `JWT_SECRET`    | ✅       | Secret key for signing JWTs — use any long, random string (e.g., `openssl rand -hex 32`)                                                                                                                                       |
| `CLIENT_ORIGIN` | ⬜       | _(Optional)_ Allowed CORS origin for API requests. Set this to your production frontend URL (e.g., `https://dailyforge-frontend-lhjq.onrender.com`). If not set, it defaults to `http://localhost:5173` for local development. |

**How to get `MONGO_URI`:**

1. Log into [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster (if you haven't)
3. Click **Connect** → **Connect your application** → Copy the connection string
4. Replace `<password>` with your DB user's password

### Frontend — `frontend/.env`

Copy the provided `.env.example` to a new file named `.env`.

| Variable                            | Required | Description                                                                                   |
| ----------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `VITE_API_URL`                      | ✅       | Base URL for frontend API requests, usually `http://localhost:5000/api` in local development. |
| `VITE_FIREBASE_API_KEY`             | ✅       | Firebase client API key used by Firebase SDK for authentication.                              |
| `VITE_FIREBASE_AUTH_DOMAIN`         | ✅       | Firebase Auth domain for your project (e.g. `your-project.firebaseapp.com`).                  |
| `VITE_FIREBASE_PROJECT_ID`          | ✅       | Firebase project identifier used by the frontend and backend.                                 |
| `VITE_FIREBASE_STORAGE_BUCKET`      | ✅       | Firebase storage bucket name for your project (even if storage is not used directly).         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅       | Firebase messaging sender ID required for client configuration.                               |
| `VITE_FIREBASE_APP_ID`              | ✅       | Firebase app ID for the registered web app.                                                   |

**Running locally?** Update `VITE_API_URL` in your local `.env` file to `http://localhost:5000/api/`.

> Note: For Firebase credential values, see the existing [Google Authentication Setup](#-google-authentication-setup) section below.

---

## 🌐 Google Authentication Setup

DailyForge supports Google Authentication via Firebase. Follow these steps to configure and enable Google Sign-In:

### 1. Firebase Console Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add project** to create a new project.
2. Once the project is created, click the **Web icon (`</>`)** on the Project Overview page to register a new Web App.
3. Copy the `firebaseConfig` object containing the API key, app ID, etc.
4. Go to **Build** → **Authentication** in the left sidebar and click **Get Started**.
5. Under the **Sign-in method** tab, click **Add new provider** and select **Google**.
6. Enable the provider, configure your support email, and click **Save**.

### 2. Environment Variables Configuration

To enable the frontend and backend integration, copy the configuration values into your respective `.env` files:

#### Frontend — `frontend/.env`

Append your Firebase client configuration to your local `.env` file:

```env
# Firebase Client configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend — `backend/.env`

Add your Firebase Project ID to secure RS256 token verification:

```env
# Firebase verification configuration
FIREBASE_PROJECT_ID=your_project_id
```

---

## 🧩 REST API Reference

**Base URL:** `/api`

**JWT Authorization header:**

```http
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint                   | Auth Required | Description                        |
| ------ | -------------------------- | ------------- | ---------------------------------- |
| POST   | `/api/auth/signup`         | No            | Register a new user                |
| POST   | `/api/auth/login`          | No            | Login with email and password      |
| POST   | `/api/auth/google-login`   | No            | Login using Google authentication  |
| GET    | `/api/auth/user`           | Yes           | Get the current authenticated user |
| PUT    | `/api/auth/update-profile` | Yes           | Update the current user's profile  |
| POST   | `/api/auth/logout`         | Yes           | Log out the current user           |

### Tasks

| Method | Endpoint         | Auth Required | Description                              |
| ------ | ---------------- | ------------- | ---------------------------------------- |
| POST   | `/api/tasks`     | Yes           | Create a new task                        |
| GET    | `/api/tasks`     | Yes           | Get all tasks for the authenticated user |
| PUT    | `/api/tasks/:id` | Yes           | Update a task by ID                      |
| DELETE | `/api/tasks/:id` | Yes           | Delete a task by ID                      |

### Routines

| Method | Endpoint            | Auth Required | Description                                 |
| ------ | ------------------- | ------------- | ------------------------------------------- |
| POST   | `/api/routines`     | Yes           | Create a new routine                        |
| GET    | `/api/routines`     | Yes           | Get all routines for the authenticated user |
| PUT    | `/api/routines/:id` | Yes           | Update a routine by ID                      |
| DELETE | `/api/routines/:id` | Yes           | Delete a routine by ID                      |

### Analytics

| Method | Endpoint         | Auth Required | Description                                         |
| ------ | ---------------- | ------------- | --------------------------------------------------- |
| GET    | `/api/analytics` | Yes           | Get analytics/statistics for the authenticated user |

---

## ❓ FAQ

### Why is the app slow on first load?

The project is deployed on Render’s free tier. Services may go to sleep after inactivity, so the first request can take around 30–60 seconds to respond.

---

### Which Node.js version should I use?

Recommended versions:

- Node.js `v18+`
- npm `v9+`

Check your installed versions:

```bash
node -v
npm -v
```

---

### Do I need MongoDB installed locally?

No. DailyForge uses MongoDB Atlas, so you only need a free Atlas account and a valid connection string.

---

### Why am I getting CORS errors during local development?

Make sure:

- Backend CORS origin is set to:

```js
origin: "http://localhost:5173";
```

- Frontend `.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### Where should I add environment variables?

Backend variables go inside:

```bash
/backend/.env
```

Frontend variables go inside:

```bash
/frontend/.env
```

---

## 🛠 Troubleshooting

| Issue                                  | Common Cause                                                     | Quick Fix                                                                                                                     |
| :------------------------------------- | :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **CORS Errors**                        | `CLIENT_ORIGIN` or `FRONTEND_URL` mismatch in backend `.env`.    | Ensure backend `.env` has correct origin (e.g., `http://localhost:5173`). Restart the server after changes.                   |
| **MongoDB Connection Error**           | Incorrect `MONGO_URI`, wrong credentials, or IP not whitelisted. | Verify `MONGO_URI`, replace `<password>` with correct DB password, and whitelist `0.0.0.0/0` in MongoDB Atlas Network Access. |
| **Frontend Cannot Connect to Backend** | Backend not running, wrong API URL, or port mismatch.            | Set `VITE_API_URL=http://localhost:5000/api` and ensure backend is running on `http://localhost:5000`.                        |
| **JWT Authentication Errors**          | Missing or incorrect `JWT_SECRET`.                               | Add `JWT_SECRET` in `backend/.env` and restart the backend server.                                                            |
| **Dependency Conflicts**               | React 19 / Tailwind v4 strict peer dependency issues.            | Run `npm install --legacy-peer-deps` in both frontend and backend directories.                                                |
| **Glitchy Drag-and-Drop**              | Browser extensions interfering with DOM events.                  | Test the app in **Incognito mode** or disable extensions.                                                                     |
| **Port Already in Use**                | Another process is using the same port.                          | Stop the running process or change `PORT` in `.env` (e.g., `PORT=5001`).                                                      |
| **Dependency Installation Issues**     | Corrupted `node_modules` or lock file conflicts.                 | Run `rm -rf node_modules package-lock.json && npm install`.                                                                   |

---

## 🤝 Contribution Guidelines

We love contributions! DailyForge is actively participating in **GSSoC 2026** and welcomes contributors of all experience levels.

📄 **Read the full guidelines:** [CONTRIBUTING.md](CONTRIBUTING.md)

### Quick Contribution Flow

**1. Pick an issue**

- Browse [open issues](https://github.com/aryandas2911/DailyForge/issues)
- Look for `good first issue` if you're new
- Comment on the issue to get it assigned before starting work

**2. Fork & branch**

```bash
git clone https://github.com/<your-username>/DailyForge.git
cd DailyForge
git checkout -b <type>/<short-description>
```

**Branch naming convention:**

| Type          | Example                      |
| ------------- | ---------------------------- |
| New feature   | `feature/add-dark-mode`      |
| Bug fix       | `fix/login-redirect-loop`    |
| Documentation | `docs/update-readme`         |
| Refactor      | `refactor/task-hook-cleanup` |

**3. Make your changes**

- Keep changes focused — one issue per PR
- Follow the existing code style
- Test your changes locally before pushing

**4. Open a Pull Request**

- Fill out the PR template completely
- Link the issue it resolves using `Closes #<issue-number>`
- Request a review from a maintainer

> ⚠️ PRs without a linked issue or description will not be reviewed.

---

## 🏷 Issue Guidelines

We use labels to organize work. Here's what they mean:

| Label              | Meaning                                                        |
| ------------------ | -------------------------------------------------------------- |
| `good first issue` | Small, well-scoped tasks — perfect for first-time contributors |
| `bug`              | Something is broken or behaving incorrectly                    |
| `feature`          | New functionality to be added                                  |
| `documentation`    | Improvements to README, guides, or inline comments             |
| `help wanted`      | Maintainers need external input or assistance                  |
| `testing`          | Adding or improving test coverage                              |

**Tips for new contributors:**

- Start with `good first issue` — they're designed to be approachable
- Don't hesitate to ask questions in the issue comments
- One issue at a time — don't take on multiple issues until your first PR is merged

---

## 📸 Screenshots

### 🔐 Signup Page

![Signup Page](Screenshots/Signup.png)

### 📊 Dashboard Overview

![Dashboard](Screenshots/Dashboard.png)

### 📋 Tasks Page

![Tasks Page](Screenshots/Tasks.png)

### 🗓️ Drag-and-Drop Routine Builder

![Routine Builder](Screenshots/Routine.png)

---

## 📬 Getting Help

Need help with setup or contributing?

### You can:

- Open a GitHub Issue
- Comment on an existing issue for clarification
- Contact the maintainer through the email provided below

### Before asking for help:

- Read the setup instructions carefully
- Check the FAQ and Troubleshooting sections
- Search existing GitHub issues first

We welcome contributors of all experience levels 🚀

---

## 📬 Contact & Community

### 💖 Contributors

Thanks to all the amazing people who contribute to **DailyForge** 🚀

<p align="center">
  <a href="https://github.com/aryandas2911/DailyForge/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=aryandas2911/DailyForge" alt="Contributors"/>
  </a>
</p>

<br>

### ⭐ Project Support

<p align="center">
  <a href="https://github.com/aryandas2911/DailyForge/stargazers">
    <img src="https://img.shields.io/github/stars/aryandas2911/DailyForge?style=social" alt="Stars">
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/aryandas2911/DailyForge/network/members">
    <img src="https://img.shields.io/github/forks/aryandas2911/DailyForge?style=social" alt="Forks">
  </a>
</p>

<br>

Have questions, ideas, or want to connect with other contributors?

| Channel   | Link                                                               |
| --------- | ------------------------------------------------------------------ |
| 📧 Email  | aryandas2911@gmail.com                                             |
| 🐛 Issues | [GitHub Issues](https://github.com/aryandas2911/DailyForge/issues) |

---

<div align="center">

**Built with ❤️ for GSSoC 2026**

If DailyForge helped you, consider giving it a ⭐ — it helps more contributors find the project!

</div>
