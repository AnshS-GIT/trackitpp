const mongoose = require("mongoose");
const baseOptions = require("./base.model");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "ISSUE_CREATED",
        "ISSUE_STATUS_UPDATED",
        "ISSUE_ASSIGNED",
      ],
    },

    entityType: {
      type: String,
      required: true,
      enum: ["ISSUE"],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },

    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  baseOptions
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
