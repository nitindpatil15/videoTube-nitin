import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import User from "../models/User.model.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponce } from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const createTweet = asynchandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if(!content){
        throw new ApiError("All Field are Required")
    }

    const newTweet = await Tweet.create({
        content,
    })

    newTweet.owner = req.user?._id
    newTweet.save()

    return res.status(200)
    .json(new ApiResponce(200,newTweet, "Tweet Created Successfully"))
})

const getUserTweets = asynchandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asynchandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asynchandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}