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

  // TODO: get video, upload to cloudinary, create video
  let videoLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.videodoc) &&
    req.files.videodoc.length > 0
  ) {
    videoLocalpath = req.files.videodoc[0].path;
  }

  if (!videoLocalpath) {
    throw new ApiError(400, "videoLocalpaths is Required");
  }
  let thumbnailLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalpath = req.files.thumbnail[0].path;
  }

  if (!thumbnailLocalpath) {
    throw new ApiError(400, "thumbnailLocalpath is Required");
  }

  const video = await uploadOnCloudinary(videoLocalpath)
  const thumbnail = await uploadOnCloudinary(thumbnailLocalpath)

  if(!video){
    throw new ApiError("Failed to Upload Video")
  }
  if(!thumbnail){
    throw new ApiError("Failed to Upload Video")
  }

  const createVideo = await Video.create({
    videodoc:video?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration:video?.duration
  })
  
  createVideo.owner = req.user?._id
  createVideo.save()

  console.log(createVideo)

  return res
    .status(200)
    .json(new ApiResponce(200, createVideo, "Video Uploaded Successfully"));});

const getVideoById = asynchandler(async (req, res) => {
  const { _id } = req.params;
  //TODO: get video by id

  const video = await Video.findById(_id)

  return res.status(200)
  .json(new ApiResponce(200, video,"Video fetched by videoId"))
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
