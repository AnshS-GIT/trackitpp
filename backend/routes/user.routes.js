const express = require("express");
const {registerUser, login, listUsers, getUserOrgs} = require("../controllers/user.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/users/register", registerUser);

router.post("/users/login", login);

router.get("/users", protect, listUsers);
router.get("/users/me/organizations", protect, getUserOrgs);

module.exports = router;
