const User = require("../models/user.model");
const OrganizationMember = require("../models/orgMember.model");
const { BadRequestError, UnauthorizedError, ForbiddenError } = require("../errors");

const createUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("User already exists");
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
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.isActive) {
    throw new ForbiddenError("User account is inactive");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
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
