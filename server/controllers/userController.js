import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      bio: bio || "",
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      userData: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      userData: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      userData: user,
    });
  } catch (error) {
    console.error("Get Me Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  const { fullName, bio, password, oldPassword, profilePic } = req.body;

  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (password && oldPassword) {
      const isMatch = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect old password",
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    if (profilePic) {
      const uploadedResponse = await cloudinary.uploader.upload(
        profilePic,
        {
          folder: "quickchat_profiles",
          width: 250,
          height: 250,
          crop: "fill",
        }
      );

      user.profilePic = uploadedResponse.secure_url;
    }

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      userData: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};