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

    dependsOn: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Tasks",
  default: null,
},



    actualDuration: {
      type: Number,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    //Recurring tasks
    recurrence: {
      enabled:   { type: Boolean, default: false },
      frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: null },
      days:      { type: [String], default: [] }, // ["Monday","Friday"] for weekly
      monthDay:  { type: Number, default: null }, // 1–31 for monthly
      endDate:   { type: Date, default: null },   // stop after this date
    },
    isRecurringInstance: { type: Boolean, default: false },
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks",
      default: null,
    },
  },
  { timestamps: true },
);

// Task model using schema
const taskModel = mongoose.model("Tasks", taskSchema);

export default taskModel;