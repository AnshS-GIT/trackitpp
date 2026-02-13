const invitationService = require("../services/invitation.service");
const asyncHandler = require("../middleware/asyncHandler");

const getMyInvitations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const invitations = await invitationService.getMyInvitations(userId);

  res.status(200).json({
    success: true,
    data: invitations,
  });
});

const acceptInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await invitationService.acceptInvitation({
    invitationId: id,
    userId,
  });

  res.status(200).json({
    success: true,
    message: "Invitation accepted successfully",
    data: result,
  });
});

const declineInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await invitationService.declineInvitation({
    invitationId: id,
    userId,
  });

  res.status(200).json({
    success: true,
    message: "Invitation declined",
    data: result,
  });
});

module.exports = {
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
};
