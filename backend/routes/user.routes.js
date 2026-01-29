const express = require("express");
const {registerUser,login,} = require("../controllers/user.controller");

const router = express.Router();

router.post("/users/register", registerUser);

router.post("/users/login", login);

module.exports = router;
