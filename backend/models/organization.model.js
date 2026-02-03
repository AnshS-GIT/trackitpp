const mongoose = require("mongoose");
const baseOptions = require("./base.model");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  baseOptions
);

// Index organization name for faster lookup
organizationSchema.index({ name: 1 });

module.exports = mongoose.model("Organization", organizationSchema);
