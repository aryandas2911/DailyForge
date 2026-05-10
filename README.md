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

| Service  | URL |
|----------|-----|
| 🖥️ Frontend | [https://dailyforge-frontend-lhjq.onrender.com](https://dailyforge-frontend-lhjq.onrender.com) |
| ⚙️ Backend API | [https://dailyforge-backend.onrender.com](https://dailyforge-backend.onrender.com) |

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
- View all saved routines at a glance
- Quick access to edit or delete any routine
- Summary stats for your weekly schedule

### ♻️ Routine Templates
- Save any routine as a reusable template
- Re-apply templates to any week in seconds

---

## 🏗 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| `@dnd-kit/core` | Drag-and-drop interactions |
| Axios | HTTP client for API calls |
| React Router DOM v7 | Client-side routing |
| Lucide React | Icon library |
| Context API | Global auth state management |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js v5 | REST API framework |
| MongoDB Atlas | Cloud database |
| Mongoose v9 | ODM for MongoDB |
| JSON Web Token (JWT) | Stateless authentication |
| Bcrypt | Password hashing |
| dotenv | Environment variable management |
| Nodemon | Dev server with hot-reload |

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

**Create your `.env` file** (see the [Environment Variables](#-environment-variables) section below):

```bash
# Inside the /backend directory
cp .env.example .env   # or manually create .env
```

Then fill in your values (see the next section for what each variable means).

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

> ⚠️ **Local dev note:** The frontend base URL is hardcoded in `frontend/src/api/axios.js` to point at the deployed backend. To test against your local backend, temporarily change `baseURL` in that file to `http://localhost:5000/api/`.

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

Create this file manually. **Never commit it to git.**

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key_here
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Port on which the Express server runs (default: `5000`) |
| `MONGO_URI` | ✅ | Full MongoDB Atlas connection string — get it from your Atlas cluster's "Connect" menu |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs — use any long, random string (e.g., `openssl rand -hex 32`) |

**How to get `MONGO_URI`:**
1. Log into [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster (if you haven't)
3. Click **Connect** → **Connect your application** → Copy the connection string
4. Replace `<password>` with your DB user's password

### Frontend — No `.env` required

The frontend has **no environment variables**. The API base URL is hardcoded in `frontend/src/api/axios.js`:

```js
// frontend/src/api/axios.js
const api = axios.create({
  baseURL: "https://dailyforge-backend.onrender.com/api/",
});
```

**Running locally?** Change `baseURL` to `http://localhost:5000/api/` while developing, and revert before committing.

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

| Type | Example |
|------|---------|
| New feature | `feature/add-dark-mode` |
| Bug fix | `fix/login-redirect-loop` |
| Documentation | `docs/update-readme` |
| Refactor | `refactor/task-hook-cleanup` |

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

| Label | Meaning |
|-------|---------|
| `good first issue` | Small, well-scoped tasks — perfect for first-time contributors |
| `bug` | Something is broken or behaving incorrectly |
| `feature` | New functionality to be added |
| `documentation` | Improvements to README, guides, or inline comments |
| `help wanted` | Maintainers need external input or hands | Experienced contributors |
| `testing` | Adding or improving test coverage | Anyone comfortable with testing |

**Tips for new contributors:**
- Start with `good first issue` — they're designed to be approachable
- Don't hesitate to ask questions in the issue comments
- One issue at a time — don't take on multiple issues until your first PR is merged

---

## 📸 Screenshots

### 🔐 Signup Page
![Signup Page](Screenshots/Signup.png)

### 📊 Dashboard
![Dashboard](Screenshots/Dashboard.png)

### 📋 Tasks Page
![Tasks Page](Screenshots/Tasks.png)

### 🗓️ Routine Builder
![Routine Builder](Screenshots/Routine.png)

---


## 📬 Contact & Community

Have questions, ideas, or want to connect with other contributors?

| Channel | Link |
|---------|------|
| 📧 Email | aryandas2911@gmail.com |
| 🐛 Issues | [GitHub Issues](https://github.com/aryandas2911/DailyForge/issues) |

---

<div align="center">

**Built with ❤️ for GSSoC 2026**

If DailyForge helped you, consider giving it a ⭐ — it helps more contributors find the project!

</div>
