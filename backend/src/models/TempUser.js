import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);



tempUserSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300 }
);

const TempUserModel = mongoose.model("TempUser", tempUserSchema);

export default TempUserModel;
