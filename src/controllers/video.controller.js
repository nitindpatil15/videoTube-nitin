import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asynchandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asynchandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are Required");
  }

  // const existedUser = await User.findOne({
  //   $or: [{ email }, { username }],
  // });
  // if (existedUser) {
  //   throw new ApiError(409, "Username or Email already exists.");
  // }

  // TODO: get video, upload to cloudinary, create video
  let videoLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.Video) &&
    req.files.Video.length > 0
  ) {
    videoLocalpath = req.files.Video[0].path;
  }

  if (!videoLocalpath) {
    throw new ApiError(400, "Avatar is Required");
  }

  const video = await uploadOnCloudinary(videoLocalpath)

  if(!video){
    throw new ApiError("Failed to Upload Video")
  }

  return res
  .status(200)
  .json(new ApiResponce(200,{},"Video Uploaded Successfully"))
});

const getVideoById = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asynchandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
