const mongoose = require("mongoose");
const baseOptions = require("./base.model");

const orgMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER", "AUDITOR"],
      required: true,
      default: "MEMBER",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  baseOptions
);

// Enforce unique (user + organization) combination
orgMemberSchema.index({ user: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model("OrganizationMember", orgMemberSchema);
