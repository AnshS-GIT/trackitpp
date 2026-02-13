const express = require("express");
const protect = require("../middleware/auth.middleware");
const invitationController = require("../controllers/invitation.controller");

const router = express.Router();

router.get("/invitations/me", protect, invitationController.getMyInvitations);
router.post("/invitations/:id/accept", protect, invitationController.acceptInvitation);
router.post("/invitations/:id/decline", protect, invitationController.declineInvitation);

module.exports = router;
