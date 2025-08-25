import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

const verifyJWT = asyncHandler( async (req,res,next)=>{
   try {
     const token = req.cookies?.accessToken || req.header('Authorization')?.split(" ")[1];
     
     if(!token){
         throw new ApiError(401,"Give the token! You have not any token.")
     }

     const decodedToken= await jwt.verify(token, process.env.ACCESS_SECRET_KEY)
 
     if(!decodedToken){
        throw new ApiError(400, "Invalid token! Access Denied.")
     }

     const user = await User.findById(decodedToken._id).select("-password -refreshToken")

     if(!user){
        throw new ApiError(400, "Can not get access! Access denied.")
     }

     req.user = user;
     next();
     
   } catch (error) {
        throw new ApiError(400, error?.message || "Problem in Authentication")
   }
})

export { verifyJWT }