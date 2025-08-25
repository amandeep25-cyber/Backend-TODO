import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPathName) => {
  try {
    if (!localPathName) return null;

    const response = await cloudinary.uploader.upload(localPathName, {
      resource_type: "auto",
    });

    fs.unlinkSync(localPathName);

    return response;
  } catch (error) {
    fs.unlinkSync(localPathName);

    console.error("error is : ", error);
    return null;
  }
};

const deleteImageFromCloudinary = async (imageLink) => {
  try {
    if (imageLink === "") {
      return "ok";
    }

    const privateId = imageLink.split("/").pop().split(".")[0];

    const deletedImage = await cloudinary.uploader.destroy(privateId);
    console.log(deletedImage);

    return deletedImage.result;
  } catch (error) {
    throw new ApiError(400, "error:" + error);
  }
};

export { uploadOnCloudinary, deleteImageFromCloudinary };
