import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check if already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        sucess: false,
        error: "Email already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        sucess: false,
        error: "Invalid email or password",
      });
    }

    // compare password
    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // sign token
    const token = signToken({
      userId: user._id,
      role: user.role,
    });

    res.json({
      success: true,
      data: { token },
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");

  res.json({
    success: true,
    data: user,
  });
};
