const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
