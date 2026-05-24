import mongoose from "mongoose";
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
      type: [String],
      required: false,
      default: [],
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
    actualDuration: {
      type: Number,
      default: null,
    },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const taskModel = mongoose.model("Tasks", taskSchema);
export default taskModel;