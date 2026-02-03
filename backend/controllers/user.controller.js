const { createUser, loginUser, getUserOrganizations } = require("../services/user.service");
const { generateToken } = require("../utils/jwt");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await createUser({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser({ email, password });

    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const User = require("../models/user.model");
    const users = await User.find({}, "name email role").sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserOrgs = async (req, res, next) => {
  try {
    const orgs = await getUserOrganizations(req.user.id);
    res.status(200).json({
      success: true,
      data: orgs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  login,
  listUsers,
  getUserOrgs,
};
