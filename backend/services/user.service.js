const User = require("../models/user.model");
const OrganizationMember = require("../models/orgMember.model");

const createUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return user;
};

const getUserOrganizations = async (userId) => {
  const memberships = await OrganizationMember.find({ user: userId })
    .populate("organization", "name isActive")
    .select("role joinedAt organization");

  return memberships.map((m) => ({
    id: m.organization._id,
    name: m.organization.name,
    isActive: m.organization.isActive,
    userRole: m.role,
    joinedAt: m.joinedAt,
  }));
};

module.exports = {
  createUser,
  loginUser,
  getUserOrganizations,
};
