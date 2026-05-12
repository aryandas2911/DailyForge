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
        },
        day: {
          type: String,
          required: true,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
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
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

// Routine model using schema
const routineModel = mongoose.model("Routine", routineSchema);

export default routineModel;
