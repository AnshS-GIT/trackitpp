const express = require("express");
const { registerUser } = require("../controllers/user.controller");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.post("/users/register", asyncHandler(registerUser));

module.exports = router;
