import mongoose, { isValidObjectId } from "mongoose";
import { playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const createPlaylist = asynchandler(async (req, res) => {
  try {
    const user = req.user._id
    if(!user){
      throw new ApiError("User not found", 404)
    }
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
  
  } catch (error) {
    throw new ApiError(500,"Playlist Didn't created!! Try Again!!")
  }});

const getUserPlaylists = asynchandler(async (req, res) => {
  const userId = req.user._id
  // const {playlistId} = req.params;
  if(!userId){
    throw new ApiError(401, "User not found")
  }
  const userPlaylists = await playlist.find({owner: userId})

  return res.status(200)
  .json(new ApiResponce(200,userPlaylists,"Succeffully fetched user playlists"))
});

const getPlaylistById = asynchandler(async (req, res) => {
  const { playlistId } = req.params;
  
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
  try {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist
    if (!(playlistId && videoId)) {
      throw new ApiError(401,"Video and playlist id is required!!!")
    }
  
    const isplaylist = await playlist.findById(playlistId);
    if(!isplaylist){
      throw new ApiError(401,"Invalid Playlist")
    }
  
    await isplaylist.videos.pull(videoId)
    const removedvideo = await isplaylist.save();
  
    return res.status(200)
    .json(200,removedvideo,"Video Removed from Playlist")
    
  } catch (error) {
    throw new ApiError(500,"Try Again")
  }
});

const deletePlaylist = asynchandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    if(!playlistId){
      throw new ApiError(401,"Playlist Id is required!!!")
    }
    const isplaylist = await playlist.findByIdAndDelete(playlistId);
    if(!isplaylist){
      throw new ApiError(401,"Invalid Playlist!!!")
    }
  
    return res.status(200)
    .json(new ApiResponce(200,isplaylist,"Deleted the Playlist Successfully"))
  
  } catch (error) {
    throw new ApiError(500,"Server Error! , Try Again...")
  }

});

const updatePlaylist = asynchandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist
  
    if(!playlistId){
      throw new ApiError(401,"PlaylistId is  required!!!")
    }
    if(!name && !description){
      throw new ApiError(401,"all Fields are required!!!")
    }
    
    const updateplaylist = await playlist.findByIdAndUpdate(playlistId,
      {
        $set:{
          name:name,
          description:description
        },
      },
    {
      new : true
    }
    )
  
    return res.status(200)
    .json(new ApiResponce(200,updateplaylist,"Playlist Updated Successfully"))
  
  } catch (error) {
    throw new ApiError(500,"Server Error! , Try Again...")
  }});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
