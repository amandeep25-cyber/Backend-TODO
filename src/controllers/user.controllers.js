import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  if ([fullName, email].some((field) => field.trim() === "")) {
    throw new ApiError(401, "FullName and Email both fields are required");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(400, "User already existed");
  }

  let avatarLocalPath;
  if (req.file && req.file.path) {
    avatarLocalPath = req.file.path;
  }

  const uploadedImage = await uploadOnCloudinary(avatarLocalPath);

  const user = await User.create({
    fullName,
    email,
    avatar: uploadedImage?.url || "",
    password,
  });

  const updatedUser = await User.findById(user._id).select("-password");

  if (!updatedUser) {
    throw new ApiError(500, "user not created in db");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, updatedUser, "User register Successfully"));
});

export{
    registerUser
}