import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Task } from "../models/task.model.js";
import {
  uploadOnCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessTokenAndRefreshToken = async (user_id) => {
  const user = await User.findById(user_id);
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { refreshToken, accessToken };
};

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

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Password is incorrect");
  }

  const { refreshToken, accessToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, option)
    .cookie("accessToken", accessToken, option)
    .json(
      new ApiResponse(
        200,
        {
          LoginUser: loginUser,
          refreshToken,
          accessToken,
        },
        "Login successfull"
      )
    );
});

const loggedOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  console.log("hello");
  const option = {
    httpOnly: true,
    secure: true,
  };

  res
    .clearCookie("refreshToken", option)
    .clearCookie("accessToken", option)
    .json(new ApiResponse(200, {}, "Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(400, "Refresh token is Empty");
  }

  const decodedToken = await jwt.verify(token, process.env.REFRESH_SECRET_KEY);

  if (!decodedToken) {
    throw new ApiError(400, "Token is not valid");
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );

  const accessToken = user.generateAccessToken();

  const option = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", token, option)
    .json(
      new ApiResponse(200, {
        user,
        refreshToken: token,
        accessToken,
      })
    );
});

const deleteAccount = asyncHandler(async (req, res) => {

  const { avatar, _id } = req.user;

  //fetch all the document of task and delete the document
  const tasks = await Task.deleteMany({ author: { _id } });
  if (tasks.acknowledged !== true) {
    throw new ApiError(400, "Something is wrong while deleting the tasks");
  }

  //fetch avatar and delete from cloudinary
  const response = await deleteImageFromCloudinary(avatar);

  if (response !== "ok") {
    throw new ApiError(400, "Image deleting error");
  }

  //then after delete the account of user
  const deletedAccount = await User.findByIdAndDelete(_id);

  if (!deletedAccount) {
    throw new ApiError(400, "User not found ");
  }
  
  res.json(new ApiResponse(200, deletedAccount, "User deleted Successfully"));
});

const updateAvatar = asyncHandler( async(req,res)=>{
    
    const { avatar, _id} = req.user

    //check if avatar was already uploaded or not?
    
    const response= await deleteImageFromCloudinary(avatar)

    if(response!=='ok'){
        throw new ApiError(400,"Something went wrong while deleting the avatar")
    }

    //get avatar file path 
    const localPathName = req.file?.path || "";

    //Upload on cloudinary
    let uploadedImage = await uploadOnCloudinary(localPathName)

    if(!uploadedImage){
        uploadedImage ={
            url: ""
        }
    }

    const user = await User.findById(_id)

    if(!user){
        throw new ApiError(400,"User does not exist")
    }

    user.avatar = uploadedImage.url || ""
    user.save({validateBeforeSave: false})

    res.json(
        new ApiResponse(201,{uploadedImageUrl: uploadedImage.url},"updated avatar successfully")
    )
    
});

const updateCredential = asyncHandler( async(req, res)=>{
    const newUpdate = req.body;

    if(('password' in newUpdate)){
          delete newUpdate.password;
    }

    if(('email' in newUpdate)){
          delete newUpdate.email;
    }
  
    const user = await User.findByIdAndUpdate({_id: req.user._id}, newUpdate,{
      new: true,
      runValidators: true
    })

    if(!user){
      throw new ApiError(404,"User not found")
    }

    res.json(
      new ApiResponse(200, { updatedUser: user}, "Profile Updated Successfully")
    )

})

const changePassword = asyncHandler( async( req,res)=>{
    const { password, newPassword} = req.body;

    //check password is valid or not
    const user = await User.findById(req.user._id)

    if(!user){
      throw new ApiError(404,"User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
      throw new ApiError(400,"Password is not valid")
    }

    user.password = newPassword

    await user.save({ runValidators: true})

    res.json(
      new ApiResponse(200,{},"Password changed successfully")
    )
    
})

export {
  registerUser,
  loginUser,
  loggedOut,
  refreshAccessToken,
  deleteAccount,
  updateAvatar,
  updateCredential,
  changePassword,
};
