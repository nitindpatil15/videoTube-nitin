import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const createTweet = asynchandler(async (req, res) => {
  //TODO: create tweet
  try {
    const { content } = req.body;
  
    if (!content) {
      throw new ApiError("All Field are Required");
    }
  
    const newTweet = await Tweet.create({
      content,
    });
  
    newTweet.owner = req.user?._id;
    newTweet.save();
  
    return res
      .status(200)
      .json(new ApiResponce(200, newTweet, "Tweet Created Successfully"));
  
  } catch (error) {
    throw new ApiError(500,"Server Error")
  }});

const getUserTweets = asynchandler(async (req, res) => {
  // TODO: get user tweets
  const {owner} = req.query

  if(!owner){
    throw new ApiError(401,"Id is Required")
  }

  try {
    const tweets = await Tweet.find({owner})
  
    return res.status(200)
    .json(new ApiResponce(200,{tweets},"Fetched all user tweets"))
  
  } catch (error) {
    throw new ApiError(500, "An error occurred while fetching the tweets");
  }});

const updateTweet = asynchandler(async (req, res) => {
  try {
    const { _id } = req.query;
    const { content } = req.body;

    if (!_id) {
      throw new ApiError("All Field are Required");
    }
    if (!content) {
      throw new ApiError("All Field are Required");
    }

    const tweetUpdate = await Tweet.findByIdAndUpdate(
      _id,
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponce(200, { tweetUpdate }, "Tweet Updated Successfully ")
      );
  } catch (error) {
    throw new ApiError(500, "Server Error");
  }
});

const deleteTweet = asynchandler(async (req, res) => {
  try {
    const { _id } = req.query;

    if (!_id) {
      throw new ApiError(402, "Select Proper id");
    }

    const TweetDelete = await Tweet.findByIdAndDelete(_id);

    return res
      .status(200)
      .json(new ApiError(200, { TweetDelete }, "Tweet Removed Successfull"));
  } catch (error) {
    throw new ApiError(500, "Server Error");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
