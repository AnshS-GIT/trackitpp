const express = require("express");
const {registerUser, login, listUsers} = require("../controllers/user.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/users/register", registerUser);

router.post("/users/login", login);

router.get("/users", protect, listUsers);

module.exports = router;
