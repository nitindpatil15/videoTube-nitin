import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import user from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const User = user.findById(userId);
    const accessToken = User.generateAccessToken();
    const refreshToken = User.generateRefreshToken();

    User.refreshToken = refreshToken;
    await User.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong  while generating tokens");
  }
};

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
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalpath = req.files.avatar[0].path;
  }

  // if (!avatarLocalpath) {
  //   throw new ApiError(400, "Avatar is Required");
  // }

  let coverImageLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    coverImageLocalpath = req.files.coverImage[0].path;
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

const loginUser = asynchandler(async (req, res) => {
  // req.body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookies
  const { username, email, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username/Email is required");
  }

  const UserDetail = user.findOne({
    $or: [{ username }, { email }],
  });

  if (!UserDetail) {
    throw new ApiError(403, "Invalid Credentials");
  }

  // Password validating
  const passwordValidate = await UserDetail.isPasswordCorrect(password);

  if (!passwordValidate) {
    throw new ApiError(403, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    UserDetail._id
  );

  const loggedUser = await user
    .findById(UserDetail._id)
    .select("-password -refreshToken");

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponce(
        200,
        {
          UserDetail: loggedUser,
          accessToken,
          refreshToken,
        },
        "User Logged Successfully"
      )
    );
});

const logoutUser = asynchandler(async(req,res)=>{
  await user.findByIdAndUpdate(
    req.user._id,
    {
        $set: {
          refreshToken:undefined
        },
    },{
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
  }

  return res.status(200)
  .clearCookie(accessToken,options)
  .clearCookie(refreshToken,options)
  .json(200,{},"User Logged Out Successfully")
})

export { 
  registerUser,
   loginUser,
   logoutUser ,
   };
