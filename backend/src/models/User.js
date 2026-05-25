import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required to create a user"],
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required to create an account"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
      validate: {
        validator(value) {
          return passwordPattern.test(value);
        },
        message:
          "Password must be at least 8 characters long, include an uppercase letter, a digit, and a special character",
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// User schema model
const userModel = mongoose.model("User", userSchema);

export default userModel;
