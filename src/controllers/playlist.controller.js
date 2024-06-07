import mongoose, { isValidObjectId } from "mongoose";
import { playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const createPlaylist = asynchandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name || description)) {
    throw new ApiError(401, "All Fields are Required");
  }
  const newPlayList = await playlist.create({
    name,
    description,
    videos: [],
    owner: req.user._id,
  });

  if (!newPlayList) {
    throw new ApiError(401, "Playlist not created");
  }

  return res
    .status(200)
    .json(new ApiResponce(200, newPlayList, "Playlist is Created!!"));
});

const getUserPlaylists = asynchandler(async (req, res) => {
  const {userId} = req.params;
  if(!userId){
    throw new ApiError(401,"userId is required!")
  }

  const userplaylist = await playlist.findById(userId)
  if(!userplaylist){
    throw new ApiError(402,"userId is Invalid")
  }

  return res.status(200)
  .json(new ApiResponce(200,userplaylist,"Succeffully fetched user playlists"))
});

const getPlaylistById = asynchandler(async (req, res) => {
  const { playlistId } = req.query;
  
  if(!playlistId){
    throw new ApiError(401,"Playlist Id is required")
  }

  const PlaylistById = await playlist.findById(playlistId)
  if(!PlaylistById){
    throw new ApiError(401,"Invalid playlist Id!")
  }

  return res.status(200)
  .json(new ApiResponce(200,PlaylistById,"Successfully Fetched Playlist By id "))
});

const addVideoToPlaylist = asynchandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId)) {
    throw new ApiError(401, "All Fields are Required");
  }

  const isplaylist = await playlist.findById(playlistId);
  if (!isplaylist) {
    throw new ApiError(401, "Invalid Playlist");
  }

  // Using $addToSet to ensure uniqueness in the videos array
  const result = await playlist.updateOne(
    { _id: playlistId, videos: { $ne: videoId } },
    { $addToSet: { videos: videoId } }
  );

  if (result.nModified === 0) {
    throw new ApiError(401, "This Video is already in the playlist!");
  }

  return res.status(200)
  .json(new ApiResponce(200,result,"Video Added to Playlist!"))
});

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asynchandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asynchandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
