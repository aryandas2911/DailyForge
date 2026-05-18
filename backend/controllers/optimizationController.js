import { GoogleGenerativeAI } from "@google/generative-ai";
import Routine from "../src/models/Routine.js";
import Task from "../src/models/Task.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to analyze routine structure
const analyzeRoutineStructure = async (routineData) => {
  const analysis = {
    totalHoursScheduled: 0,
    daysWithTasks: new Map(),
    tasksPerDay: {},
    overlappingTasks: [],
    consecutiveHours: {},
    breakGaps: {},
  };

  // Group tasks by day
  const tasksByDay = {};
  for (const item of routineData.items) {
    if (!tasksByDay[item.day]) {
      tasksByDay[item.day] = [];
    }
    tasksByDay[item.day].push({
      ...item,
      task: routineData.taskDetails.find((t) => t._id.toString() === item.taskId.toString()),
    });
  }

  // Analyze each day
  for (const [day, tasks] of Object.entries(tasksByDay)) {
    const sortedTasks = tasks.sort((a, b) => a.startTime - b.startTime);
    let consecutiveHours = 0;

    analysis.tasksPerDay[day] = tasks.length;

    // Check for overlaps
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const current = sortedTasks[i];
      const next = sortedTasks[i + 1];
      const currentEnd = current.startTime + current.duration;

      if (currentEnd > next.startTime) {
        analysis.overlappingTasks.push({
          day,
          task1: current.task?.title,
          task2: next.task?.title,
          taskId1: current.taskId,
          taskId2: next.taskId,
        });
      }

      // Check break gaps
      const gapMinutes = next.startTime - currentEnd;
      if (!analysis.breakGaps[day]) {
        analysis.breakGaps[day] = [];
      }
      analysis.breakGaps[day].push({
        after: current.task?.title,
        gapMinutes,
        sufficient: gapMinutes >= 15,
      });
    }

    // Calculate consecutive hours
    for (const task of sortedTasks) {
      consecutiveHours += task.duration;
      if (consecutiveHours > 180) {
        // More than 3 hours without tracking
        if (!analysis.consecutiveHours[day]) {
          analysis.consecutiveHours[day] = consecutiveHours;
        }
      }
    }

    analysis.totalHoursScheduled += consecutiveHours;
  }

  return analysis;
};

// Calculate productivity score
const calculateProductivityScore = (analysis) => {
  let score = 100;

  // Deduct for overlaps
  score -= analysis.overlappingTasks.length * 10;

  // Deduct for insufficient breaks
  const insufficientBreaks = Object.values(analysis.breakGaps).flat().filter((b) => !b.sufficient).length;
  score -= insufficientBreaks * 3;

  // Deduct for overloaded days (more than 8 hours)
  for (const [, hours] of Object.entries(analysis.tasksPerDay)) {
    if (hours > 8) {
      score -= (hours - 8) * 2;
    }
  }

  // Deduct for very light days (less than 2 hours)
  for (const [, hours] of Object.entries(analysis.tasksPerDay)) {
    if (hours < 2 && hours > 0) {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
};

// Generate AI suggestions using Gemini
const generateAISuggestions = async (analysis, routineData, productivityScore) => {
  const routineJSON = JSON.stringify(
    {
      name: routineData.name,
      description: routineData.description,
      tasksPerDay: analysis.tasksPerDay,
      overlappingTasks: analysis.overlappingTasks,
      totalHoursScheduled: analysis.totalHoursScheduled,
      breakGaps: analysis.breakGaps,
      productivityScore,
    },
    null,
    2
  );

  const prompt = `You are a productivity and time management expert.

Analyze this routine and provide optimization suggestions.

Routine Data:
${routineJSON}

IMPORTANT:
- Return ONLY valid JSON
- Do NOT use markdown
- Do NOT add explanation text

Format:
{
  "taskDistribution": [
    {
      "suggestion": "...",
      "impact": "high"
    }
  ],
  "breakFocusBalance": [
    {
      "suggestion": "...",
      "impact": "medium"
    }
  ],
  "overlapRisks": [
    {
      "suggestion": "...",
      "severity": "warning"
    }
  ],
  "productivityTips": [
    {
      "tip": "...",
      "impact": "high"
    }
  ],
  "summary": "..."
}`;

  try {
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Generate response
    const result = await model.generateContent(prompt);

    // Extract text safely
    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    console.log("Raw Gemini Response:", text);

    // Clean markdown if Gemini sends it
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON safely
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Invalid JSON:", cleanedText);

      return {
        taskDistribution: [],
        breakFocusBalance: [],
        overlapRisks: [],
        productivityTips: [],
        summary: "AI returned invalid JSON format",
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);

    throw new Error("Failed to generate AI suggestions", { cause: error });
  }
};

// Main optimization endpoint
export const getOptimizationSuggestions = async (req, res) => {
  try {
    const { routineId } = req.params;
    const userId = req.userId;

    // Fetch routine with task details
    const routine = await Routine.findById(routineId).populate("items.taskId");

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    if (routine.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get full task details
    const taskIds = routine.items.map((item) => item.taskId._id);
    const tasks = await Task.find({ _id: { $in: taskIds } });

    const routineData = {
      name: routine.name,
      description: routine.description,
      items: routine.items,
      taskDetails: tasks,
    };

    // Analyze routine
    const analysis = await analyzeRoutineStructure(routineData);
    const productivityScore = calculateProductivityScore(analysis);

    // Get AI suggestions
    const aiSuggestions = await generateAISuggestions(analysis, routineData, productivityScore);

    res.json({
      success: true,
      routine: {
        name: routine.name,
        description: routine.description,
      },
      analysis,
      productivityScore: Math.round(productivityScore),
      suggestions: aiSuggestions,
    });
  } catch (error) {
    console.error("Optimization error:", error);
    res.status(500).json({
      message: "Failed to generate optimization suggestions",
      error: error.message,
    });
  }
};

// Get all routines with suggestions summary
export const getAllRoutinesWithSuggestions = async (req, res) => {
  try {
    const userId = req.userId;

    const routines = await Routine.find({ userId }).populate("items.taskId");

    const routinesWithScores = await Promise.all(
      routines.map(async (routine) => {
        const taskIds = routine.items.map((item) => item.taskId._id);
        const tasks = await Task.find({ _id: { $in: taskIds } });

        const routineData = {
          name: routine.name,
          description: routine.description,
          items: routine.items,
          taskDetails: tasks,
        };

        const analysis = await analyzeRoutineStructure(routineData);
        const score = calculateProductivityScore(analysis);

        return {
          id: routine._id,
          name: routine.name,
          productivityScore: Math.round(score),
          issueCount: analysis.overlappingTasks.length,
        };
      })
    );

    res.json({
      success: true,
      routines: routinesWithScores,
    });
  } catch (error) {
    console.error("Error fetching routines:", error);
    res.status(500).json({ message: "Failed to fetch routines" });
  }
};
