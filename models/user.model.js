const mongoose = require("mongoose");
const baseOptions = require("./base.model");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["ENGINEER", "MANAGER", "AUDITOR", "ADMIN"],
      default: "ENGINEER",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  baseOptions
);

module.exports = mongoose.model("User", userSchema);
