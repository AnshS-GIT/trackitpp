const mongoose = require("mongoose");
const baseOptions = require("./base.model");

const invitationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["MEMBER", "ADMIN", "AUDITOR"],
      default: "MEMBER",
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED"],
      default: "PENDING",
    },
  },
  baseOptions
);

// Prevent duplicate pending invitations for the same user + org
invitationSchema.index(
  { organization: 1, invitedUser: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "PENDING" },
  }
);

module.exports = mongoose.model("Invitation", invitationSchema);
