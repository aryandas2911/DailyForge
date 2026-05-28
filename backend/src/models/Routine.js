import mongoose from "mongoose";

// Routine schema
const routineSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: false,
    },
    items: [ // tasks
      {
        taskId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tasks",
          required: true,
        },
        day: {
          type: String,
          required: true,
          trim: true,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          adaptiveSettings: {
         adaptiveEnabled: {
         type: Boolean,
         default: true,
         },

         difficultyLevel: {
         type: String,
         enum: ["easy", "moderate", "hard"],
         default: "moderate",
         },

         burnoutScore: {
         type: Number,
         default: 0,
         min: 0,
         max: 100,
         },

         consistencyScore: {
         type: Number,
         default: 100,
         min: 0,
         max: 100,
         },

         fatigueLevel: {
         type: String,
         enum: ["low", "medium", "high"],
         default: "low",
        },

         recoveryMode: {
         type: Boolean,
         default: false,
        },

         recoveryDays: {
         type: Number,
         default: 0,
         },

           missedDaysCount: {
           type: Number,
           default: 0,
          },

           completedDaysCount: {
           type: Number,
           default: 0,
           },

           sustainabilityScore: {
            type: Number,
            default: 100,
            min: 0,
            max: 100,
           },

           lastRecoveryDate: {
           type: Date,
           },
          },
        },
        startTime: {
          type: Number,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
          min: 10,
        },
      },
    ],
  },
  { timestamps: true }
);

// Routine model using schema
const routineModel = mongoose.model("Routine", routineSchema);

export default routineModel;
