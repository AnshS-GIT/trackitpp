const { createUser } = require("../services/user.service");

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

module.exports = {
  registerUser,
};
