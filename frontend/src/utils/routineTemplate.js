// frontend/src/utils/routineTemplates.js

export const routineTemplates = [
  {
    id: "student-routine",
    title: "Student Routine",
    description: "A balanced schedule alternating between active classes, study blocks, and necessary breaks to prevent burnout.",
    tasks: [
      { title: "Morning Review & Planning", duration: 30, priority: "Medium" },
      { title: "Class / Lecture Block 1", duration: 90, priority: "Critical" },
      { title: "Short Break (Screen-free)", duration: 15, priority: "Low" },
      { title: "Class / Lecture Block 2", duration: 90, priority: "Critical" },
      { title: "Lunch & Recharge", duration: 60, priority: "Low" },
      { title: "Deep Study & Note Consolidation", duration: 120, priority: "High" },
      { title: "Homework & Assignments", duration: 60, priority: "Medium" }
    ]
  },
  {
    id: "work-productivity",
    title: "Work Productivity Routine",
    description: "Front-loads complex tasks when energy is highest, reserving the afternoon for collaboration and admin.",
    tasks: [
      { title: "Admin, Triage & Daily Plan", duration: 30, priority: "Medium" },
      { title: "Deep Work (Primary Project)", duration: 120, priority: "Critical" },
      { title: "Short Break", duration: 15, priority: "Low" },
      { title: "Deep Work (Secondary Project)", duration: 90, priority: "High" },
      { title: "Lunch", duration: 60, priority: "Low" },
      { title: "Meetings & Collaboration", duration: 60, priority: "Medium" },
      { title: "Email Wrap-up & Tomorrow's Prep", duration: 30, priority: "Medium" }
    ]
  },
  {
    id: "fitness-routine",
    title: "Fitness Routine",
    description: "A comprehensive training structure prioritizing safety, intensity, and recovery.",
    tasks: [
      { title: "Dynamic Warmup & Mobility", duration: 15, priority: "Medium" },
      { title: "Primary Strength / Skill Work", duration: 45, priority: "Critical" },
      { title: "Cardio / Accessory Movements", duration: 30, priority: "High" },
      { title: "Cool Down & Static Stretching", duration: 15, priority: "Medium" }
    ]
  },
  {
    id: "deep-work",
    title: "Deep Work Schedule",
    description: "Aggressive hyper-focus blocks designed for flow states, punctuated by total-disconnect breaks.",
    tasks: [
      { title: "Workspace Prep & Intention Setting", duration: 15, priority: "Medium" },
      { title: "Deep Work Block 1", duration: 90, priority: "Critical" },
      { title: "Total Disconnect Break", duration: 30, priority: "Low" },
      { title: "Deep Work Block 2", duration: 90, priority: "Critical" },
      { title: "Long Break & Meal", duration: 60, priority: "Low" },
      { title: "Deep Work Block 3", duration: 90, priority: "High" },
      { title: "Review & Shutdown Sequence", duration: 15, priority: "Medium" }
    ]
  },
  {
    id: "exam-prep",
    title: "Exam Preparation Routine",
    description: "High-intensity retention focused on active recall intervals and spaced repetition.",
    tasks: [
      { title: "Review Study Plan & Objectives", duration: 10, priority: "Medium" },
      { title: "Active Recall / Flashcards (Topic A)", duration: 50, priority: "Critical" },
      { title: "Break", duration: 10, priority: "Low" },
      { title: "Active Recall / Flashcards (Topic B)", duration: 50, priority: "Critical" },
      { title: "Long Break", duration: 30, priority: "Low" },
      { title: "Practice Test / Problem Solving", duration: 60, priority: "High" },
      { title: "Spaced Repetition (Older Topics)", duration: 30, priority: "Medium" }
    ]
  }
];