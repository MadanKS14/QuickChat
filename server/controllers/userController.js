import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

/**
 * Controller to sign up a new user.
 */
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      userData: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      },
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Controller to log in an existing user.
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            userData: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            },
            token,
            message: "Logged in successfully",
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Controller to check if a user is authenticated and get their data.
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, userData: user });

    } catch (error) {
        console.error("Get Me Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Controller to update an existing user's profile.
 */
export const updateProfile = async (req, res) => {
    const { fullName, bio, password, oldPassword, profilePic } = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Handle password update
        if (password && oldPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Incorrect old password" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Handle profile picture update
        if (profilePic) {
            if (user.profilePic) {
                // Delete the old image from Cloudinary to save space
                const publicId = user.profilePic.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
                folder: 'quickchat_profiles',
                width: 250,
                height: 250,
                crop: 'fill'
            });
            user.profilePic = uploadedResponse.secure_url;
        }

        // Update other user details
        user.fullName = fullName || user.fullName;
        user.bio = bio || user.bio;

        await user.save();
        user.password = undefined; // Remove password from the user object before sending

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            userData: user
        });

    } catch (error) {
        console.error("Update Profile Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
