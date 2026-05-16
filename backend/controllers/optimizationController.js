import { GoogleGenerativeAI } from "@google/generative-ai";
import Routine from "../src/models/Routine.js";
import Task from "../src/models/Task.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert time (minutes from midnight) to HH:MM format
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    mins
  ).padStart(2, "0")}`;
};

// Analyze routine structure
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
      task: routineData.taskDetails.find(
        (t) => t._id.toString() === item.taskId.toString()
      ),
    });
  }

  // Analyze each day
  for (const [day, tasks] of Object.entries(tasksByDay)) {
    const sortedTasks = tasks.sort(
      (a, b) => a.startTime - b.startTime
    );

    let consecutiveHours = 0;

    analysis.tasksPerDay[day] = tasks.length;

    // Check overlaps and breaks
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const current = sortedTasks[i];
      const next = sortedTasks[i + 1];

      const currentEnd = current.startTime + current.duration;

      // Overlapping tasks
      if (currentEnd > next.startTime) {
        analysis.overlappingTasks.push({
          day,
          task1: current.task?.title,
          task2: next.task?.title,
          taskId1: current.taskId,
          taskId2: next.taskId,
        });
      }

      // Break gap analysis
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

    // Consecutive work duration
    for (const task of sortedTasks) {
      consecutiveHours += task.duration;

      if (consecutiveHours > 180) {
        if (!analysis.consecutiveHours[day]) {
          analysis.consecutiveHours[day] = consecutiveHours;
        }
      }
    }

    analysis.totalHoursScheduled += consecutiveHours;
  }

  return analysis;
};

// Productivity score calculation
const calculateProductivityScore = (analysis) => {
  let score = 100;

  // Overlap penalty
  score -= analysis.overlappingTasks.length * 10;

  // Insufficient break penalty
  const insufficientBreaks = Object.values(analysis.breakGaps)
    .flat()
    .filter((b) => !b.sufficient).length;

  score -= insufficientBreaks * 3;

  // Overloaded day penalty
  for (const [day, tasks] of Object.entries(
    analysis.tasksPerDay
  )) {
    if (tasks > 8) {
      score -= (tasks - 8) * 2;
    }
  }

  // Underutilized day penalty
  for (const [day, tasks] of Object.entries(
    analysis.tasksPerDay
  )) {
    if (tasks < 2 && tasks > 0) {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
};

// Generate AI Suggestions
const generateAISuggestions = async (
  analysis,
  routineData,
  productivityScore
) => {
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

  const prompt = `
You are a productivity and time management expert.

Analyze this routine and provide optimization suggestions.

Routine Data:
${routineJSON}

IMPORTANT:
- Return ONLY valid JSON
- Do NOT use markdown
- Do NOT add explanations

Format:
{
  "taskDistribution": [
    {
      "suggestion": "string",
      "impact": "high"
    }
  ],
  "breakFocusBalance": [
    {
      "suggestion": "string",
      "impact": "medium"
    }
  ],
  "overlapRisks": [
    {
      "suggestion": "string",
      "severity": "warning"
    }
  ],
  "productivityTips": [
    {
      "tip": "string",
      "impact": "high"
    }
  ],
  "summary": "string"
}
`;

  try {
    // Correct Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Generate response
    const result = await model.generateContent(prompt);

    // Extract response text safely
    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    console.log("Raw Gemini Response:", text);

    // Remove markdown formatting
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

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

    return {
      taskDistribution: [],
      breakFocusBalance: [],
      overlapRisks: [],
      productivityTips: [],
      summary: "Failed to generate AI suggestions",
    };
  }
};

// Main optimization endpoint
export const getOptimizationSuggestions = async (
  req,
  res
) => {
  try {
    const { routineId } = req.params;
    const userId = req.userId;

    // Fetch routine
    const routine = await Routine.findById(
      routineId
    ).populate("items.taskId");

    if (!routine) {
      return res.status(404).json({
        message: "Routine not found",
      });
    }

    // Authorization check
    if (routine.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Fetch tasks
    const taskIds = routine.items.map(
      (item) => item.taskId._id
    );

    const tasks = await Task.find({
      _id: { $in: taskIds },
    });

    // Prepare routine data
    const routineData = {
      name: routine.name,
      description: routine.description,
      items: routine.items,
      taskDetails: tasks,
    };

    // Analyze
    const analysis = await analyzeRoutineStructure(
      routineData
    );

    // Calculate score
    const productivityScore =
      calculateProductivityScore(analysis);

    // Generate AI suggestions
    const aiSuggestions =
      await generateAISuggestions(
        analysis,
        routineData,
        productivityScore
      );

    // Send response
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
      message:
        "Failed to generate optimization suggestions",
      error: error.message,
    });
  }
};

// Summary endpoint
export const getAllRoutinesWithSuggestions = async (
  req,
  res
) => {
  try {
    const userId = req.userId;

    const routines = await Routine.find({
      userId,
    }).populate("items.taskId");

    const routinesWithScores = await Promise.all(
      routines.map(async (routine) => {
        const taskIds = routine.items.map(
          (item) => item.taskId._id
        );

        const tasks = await Task.find({
          _id: { $in: taskIds },
        });

        const routineData = {
          name: routine.name,
          description: routine.description,
          items: routine.items,
          taskDetails: tasks,
        };

        const analysis =
          await analyzeRoutineStructure(
            routineData
          );

        const score =
          calculateProductivityScore(analysis);

        return {
          id: routine._id,
          name: routine.name,
          productivityScore: Math.round(score),
          issueCount:
            analysis.overlappingTasks.length,
        };
      })
    );

    res.json({
      success: true,
      routines: routinesWithScores,
    });
  } catch (error) {
    console.error(
      "Error fetching routines:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch routines",
    });
  }
};