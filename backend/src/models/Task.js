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
    },
    description: {
      type: String,
      required: false,
    },
    tags: {
      type: String,
      required: false,
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Due", "Completed"],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    hasTime: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Task model using schema
const taskModel = mongoose.model("Tasks", taskSchema);

export default taskModel;
