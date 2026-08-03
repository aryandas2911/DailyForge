// ─────────────────────────────────────────────────────────────────
//  DailyForge — Backend API (Node.js + Express + SQLite)
//  Run: npm install && node server.js
// ─────────────────────────────────────────────────────────────────

const express    = require("express");
const Database   = require("better-sqlite3");
const cors       = require("cors");
const path       = require("path");

const app  = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, "dailyforge.db");

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Database Setup ────────────────────────────────────────────────
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    mode        TEXT    NOT NULL DEFAULT 'student',
    goal_hours  REAL    NOT NULL DEFAULT 2,
    streak      INTEGER NOT NULL DEFAULT 0,
    last_logged TEXT,
    created_at  TEXT    NOT NULL DEFAULT (date('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date       TEXT    NOT NULL,
    hours      REAL    NOT NULL,
    notes      TEXT,
    logged_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS habits (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label      TEXT    NOT NULL,
    icon       TEXT    DEFAULT '⚡',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date     TEXT    NOT NULL,
    UNIQUE(habit_id, date)
  );
`);

// ── Helpers ───────────────────────────────────────────────────────
const getToday = () => new Date().toISOString().split("T")[0];

const calcStreak = (lastLogged, currentStreak) => {
  if (!lastLogged) return 1;
  const last  = new Date(lastLogged);
  const today = new Date(getToday());
  const diff  = Math.floor((today - last) / 86400000);
  if (diff === 0) return currentStreak;          // same day
  if (diff === 1) return currentStreak + 1;      // consecutive day
  return Math.max(0, currentStreak - (diff - 1)); // missed days → drop
};

const applyStreakPenalty = (userId) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user || !user.last_logged) return;
  const today = getToday();
  const diff  = Math.floor((new Date(today) - new Date(user.last_logged)) / 86400000);
  if (diff > 1 && user.streak > 0) {
    const newStreak = Math.max(0, user.streak - (diff - 1));
    db.prepare("UPDATE users SET streak = ? WHERE id = ?").run(newStreak, userId);
  }
};

// ── ROUTES ────────────────────────────────────────────────────────

// Health check
app.get("/", (_req, res) => res.json({ status: "DailyForge API running 🔥" }));

/* ────────────────────────────────────────────────────────────────
   USERS
──────────────────────────────────────────────────────────────── */

// POST /users — create a new user profile
app.post("/users", (req, res) => {
  const { name, mode = "student", goal_hours = 2 } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const result = db
    .prepare("INSERT INTO users (name, mode, goal_hours) VALUES (?, ?, ?)")
    .run(name.trim(), mode, goal_hours);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(user);
});

// GET /users/:id — get user profile + auto apply streak penalty
app.get("/users/:id", (req, res) => {
  applyStreakPenalty(req.params.id);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// PATCH /users/:id — update name or goal_hours
app.patch("/users/:id", (req, res) => {
  const { name, goal_hours } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  db.prepare("UPDATE users SET name = ?, goal_hours = ? WHERE id = ?")
    .run(name ?? user.name, goal_hours ?? user.goal_hours, req.params.id);

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /users/:id — delete user + all their data
app.delete("/users/:id", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ message: "User deleted" });
});

/* ────────────────────────────────────────────────────────────────
   STUDY SESSIONS
──────────────────────────────────────────────────────────────── */

// POST /users/:id/sessions — log a study session for today
app.post("/users/:id/sessions", (req, res) => {
  const { hours, notes = "" } = req.body;
  const userId = req.params.id;

  if (!hours || hours <= 0)
    return res.status(400).json({ error: "hours must be a positive number" });

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const today = getToday();
  const existing = db
    .prepare("SELECT * FROM sessions WHERE user_id = ? AND date = ?")
    .get(userId, today);

  if (existing) {
    // Update existing log for today
    db.prepare("UPDATE sessions SET hours = ?, notes = ? WHERE id = ?")
      .run(hours, notes, existing.id);
  } else {
    // Insert new session
    db.prepare("INSERT INTO sessions (user_id, date, hours, notes) VALUES (?, ?, ?, ?)")
      .run(userId, today, hours, notes);
  }

  // Update streak
  const newStreak = calcStreak(user.last_logged, user.streak);
  db.prepare("UPDATE users SET streak = ?, last_logged = ? WHERE id = ?")
    .run(newStreak, today, userId);

  const session = db
    .prepare("SELECT * FROM sessions WHERE user_id = ? AND date = ?")
    .get(userId, today);

  const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  res.status(201).json({ session, user: updatedUser });
});

// GET /users/:id/sessions — get all sessions (newest first)
app.get("/users/:id/sessions", (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const sessions = db
    .prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?")
    .all(req.params.id, parseInt(limit), parseInt(offset));
  res.json(sessions);
});

// GET /users/:id/sessions/week — last 7 days summary
app.get("/users/:id/sessions/week", (req, res) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const results = days.map(date => {
    const session = db
      .prepare("SELECT * FROM sessions WHERE user_id = ? AND date = ?")
      .get(req.params.id, date);
    return {
      date,
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      hours: session?.hours || 0,
      notes: session?.notes || null,
      logged: !!session,
    };
  });

  res.json(results);
});

// GET /users/:id/sessions/stats — total hours, avg, best streak
app.get("/users/:id/sessions/stats", (req, res) => {
  applyStreakPenalty(req.params.id);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const stats = db
    .prepare(`
      SELECT
        COUNT(*)          AS total_sessions,
        COALESCE(SUM(hours), 0)  AS total_hours,
        COALESCE(AVG(hours), 0)  AS avg_hours,
        COALESCE(MAX(hours), 0)  AS best_session
      FROM sessions WHERE user_id = ?
    `)
    .get(req.params.id);

  const today = getToday();
  const loggedToday = !!db
    .prepare("SELECT 1 FROM sessions WHERE user_id = ? AND date = ?")
    .get(req.params.id, today);

  res.json({
    ...stats,
    streak:       user.streak,
    goal_hours:   user.goal_hours,
    logged_today: loggedToday,
    last_logged:  user.last_logged,
  });
});

// DELETE /users/:id/sessions — clear all sessions + reset streak
app.delete("/users/:id/sessions", (req, res) => {
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(req.params.id);
  db.prepare("UPDATE users SET streak = 0, last_logged = NULL WHERE id = ?").run(req.params.id);
  res.json({ message: "All sessions cleared and streak reset" });
});

/* ────────────────────────────────────────────────────────────────
   GENERAL MODE — HABITS
──────────────────────────────────────────────────────────────── */

// POST /users/:id/habits — create a habit
app.post("/users/:id/habits", (req, res) => {
  const { label, icon = "⚡" } = req.body;
  if (!label) return res.status(400).json({ error: "label is required" });
  const result = db
    .prepare("INSERT INTO habits (user_id, label, icon) VALUES (?, ?, ?)")
    .run(req.params.id, label.trim(), icon);
  const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(habit);
});

// GET /users/:id/habits — get all habits with today's completion status
app.get("/users/:id/habits", (req, res) => {
  const today  = getToday();
  const habits = db
    .prepare("SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC")
    .all(req.params.id);

  const enriched = habits.map(h => ({
    ...h,
    done_today: !!db
      .prepare("SELECT 1 FROM habit_logs WHERE habit_id = ? AND date = ?")
      .get(h.id, today),
  }));

  res.json(enriched);
});

// POST /habits/:habitId/toggle — toggle today's completion
app.post("/habits/:habitId/toggle", (req, res) => {
  const today   = getToday();
  const habitId = req.params.habitId;
  const existing = db
    .prepare("SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?")
    .get(habitId, today);

  if (existing) {
    db.prepare("DELETE FROM habit_logs WHERE id = ?").run(existing.id);
    res.json({ done: false, date: today });
  } else {
    db.prepare("INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)").run(habitId, today);
    res.json({ done: true, date: today });
  }
});

// DELETE /habits/:habitId — delete a habit
app.delete("/habits/:habitId", (req, res) => {
  db.prepare("DELETE FROM habits WHERE id = ?").run(req.params.habitId);
  res.json({ message: "Habit deleted" });
});

// ── Start Server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🔥 DailyForge API running at http://localhost:${PORT}\n`);
  console.log("Endpoints:");
  console.log("  POST   /users");
  console.log("  GET    /users/:id");
  console.log("  PATCH  /users/:id");
  console.log("  DELETE /users/:id");
  console.log("  POST   /users/:id/sessions");
  console.log("  GET    /users/:id/sessions");
  console.log("  GET    /users/:id/sessions/week");
  console.log("  GET    /users/:id/sessions/stats");
  console.log("  DELETE /users/:id/sessions");
  console.log("  POST   /users/:id/habits");
  console.log("  GET    /users/:id/habits");
  console.log("  POST   /habits/:habitId/toggle");
  console.log("  DELETE /habits/:habitId\n");
});
