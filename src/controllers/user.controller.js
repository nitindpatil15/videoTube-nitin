import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import user from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const UserToken = await user.findById(userId);
    const accessToken = UserToken.generateAccessToken();
    const refreshToken = UserToken.generateRefreshToken();
    console.log("generated accessToken: ", accessToken);
    console.log("generated refreshToken: ", refreshToken);

    UserToken.refreshToken = refreshToken;
    await UserToken.save({ validateBeforeSave: false });

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

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is Required");
  }

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

  if (!avatar) {
    throw new ApiError(500, "Failed to Upload Image On Server");
  }

  // User object
  const User = await user.create({
    fullName,
    avatar: avatar?.url,
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
    .json(new ApiResponce(200, User, "User Register Successfully"));
});

const loginUser = asynchandler(async (req, res) => {
  // req.body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookies
  const { email, username, password } = req.body;
  // console.log(req.body);
  // if (!(username || email)) {
  if (!username && !email) {
    throw new ApiError(400, "Username and Email is required");
  }

  const UserDetail = await user.findOne({
    $or: [{ username }, { email }],
  });
  // console.log(UserDetail);
  if (!UserDetail) {
    throw new ApiError(403, "Invalid Credentials");
  }

  // Password validating
  // const isPasswordValid = await UserDetail.isPasswordCorrect(password,UserDetail.password)

  // if (!isPasswordValid) {
  //   throw new ApiError(403, "Invalid Password");
  // }
  const passwordCompare = await bcrypt.compare(password, UserDetail.password);
  if (!passwordCompare) {
    success = false;
    return res
      .status(400)
      .json({ success, error: "Please try to login with correct credentials" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    UserDetail._id
  );
  const loggedUser = await user.findById(UserDetail._id).select("-password ");

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
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User Logged Successfully"
      )
    );
});

const logoutUser = asynchandler(async (req, res) => {
  try {
    await user.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponce(200, {}, "User Logged Out Successfully"));
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
});

// To-Do refresh token and password change 
const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingAccessToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingAccessToken) {
    throw new ApiError(401, "Unauthorized Token");
  }

  try {
    const decodedToken = jwt.verify(
      incomingAccessToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const User = await user.findById(decodedToken?._id);

    if (!User) {
      throw new ApiError(404, "Invalid Refresh Token");
    }

    if (incomingAccessToken !== User?.refreshtoken) {
      throw new ApiError(401, "Refresh Token is Expired or used");
    }

    const option = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(User._id);

    return res
      .status(200)
      .cookie("AccessToken", accessToken, option)
      .cookie("RefreshToken", newRefreshToken, option)
      .json(
        new ApiResponce(
          200,
          { accessToken, newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Session Timeout Please Login Again");
  }
});

const changeUserPassword = asynchandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const User = await user.findById(req.user?._id);
  if(!User){
    throw new ApiError(401,"Invalid user")
  }

  const isPasswordCorrect = await User.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  User.password = newPassword;
  await User.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(ApiResponce(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponce(200, req.user, "User fetched Successfully"));
});

const updateUserDetails = asynchandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(email && fullName)) {
    throw new ApiError(401, "All fields are Required!");
  }

  const UserUpdate = await user
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          email,
        },
      },
      {
        new: true,
      }
    )
    .select("-password");
  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Detail Saved Successfully"));
});

const updateAvatar = asynchandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Files is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading Avatar File");
  }

  const User = await user
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    )
    .select("-password");

  return res
    .status(200)
    .json(new ApiResponce(200, User, "Avatar Upload Successfully"));
});

const updateCoverImage = asynchandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage Files is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading coverImage File");
  }

  const User = await user
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      { new: true }
    )
    .select("-password");

  return res
    .status(200)
    .json(new ApiResponce(200, User, "CoverImage Upload Successfully"));
});

const getUserChannelProfile = asynchandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim) {
    throw new ApiError(401, "Username is missing!!");
  }

  const channel = await user.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "Subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribeTo",
      },
    },
    {
      $addFields: {
        subscribersCounter: {
          $size: "$Subscribers",
        },
        subscribeToCounter: {
          $size: "$SubscribeTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$Subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCounter: 1,
        subscribeToCounter: 1,
        isSubscribed: 1, // for subscribe button
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(402, "Channel is not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponce(200, channel[0], "User Channel fetched Successfully")
    );
});

const getUserWatchHistory = asynchandler(async (req, res) => {
  const User = await user.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId("User._id"),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        User[0].watchHistory,
        "Watch History fetched Successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeUserPassword,
  getCurrentUser,
  updateUserDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};
