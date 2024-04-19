import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import user from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponse.js";

const registerUser = asynchandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  console.log("Email: ", email);

  // for checking empty field
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required");
  }

  // checking user isExists or not
  const existedUser = await user.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "Username or Email already exists.");
  }

  // Checking for Avatar and coverImage
  // const avatarLocalpath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

  
  let avatarLocalpath;
  if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
    avatarLocalpath = req.files.avatar[0].path
  }

  // if (!avatarLocalpath) {
  //   throw new ApiError(400, "Avatar is Required");
  // }

  let coverImageLocalpath
  if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
    coverImageLocalpath = req.files.coverImage[0].path
  }

  // uploading Files on Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  // if (!avatar) {
  //   throw new ApiError(500, "Failed to Upload Image On Server");
  // }

  // User object
  const User = await user.create({
    fullName,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    password,
    username,
    email,
  });

  // Removing password and refreshToken from object
  const createdUser = await user
    .find(user._id)
    .select("-password -refreshtoken");

  // Checking User Creation
  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong while creating the Account");
  }

  // sending Response to User
  return res
    .status(201)
    .json(new ApiResponce(200, createdUser, "User Register Successfully"));
    
});

export { registerUser };
