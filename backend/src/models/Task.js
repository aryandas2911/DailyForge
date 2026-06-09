import mongoose from "mongoose";

// Task schema
const taskSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: false,
      trim: true
    },
    tags: [{
      type: String,
      trim: true,
    }],
    default: [],
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Due", "In Progress", "Completed"],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    actualDuration: {
      type: Number,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Task model using schema
const taskModel = mongoose.model("Tasks", taskSchema);

export default taskModel;