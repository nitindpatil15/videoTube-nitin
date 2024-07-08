import {Video} from "../models/Video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponce } from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const getChannelStats = asynchandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const user = req.user._id
    try {
        const totalVideos = await Video.countDocuments({owner:user});
        const totalSubscribers = await Subscription.countDocuments({subscriber:user});
        const totalLikes = await Like.countDocuments({user});
        const totalViews = await Video.aggregate([
          { $match: { owner: user} },
          { $group: { _id: null, total: { $sum: "$views" } } }
        ]);
    
        return res.status(200)
        .json(new ApiResponce(200,{
          totalVideos,
          totalSubscribers,
          totalLikes,
          totalViews: totalViews[0]?.total || 0,
        },"All data Fetched!!"));
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})

const getChannelVideos = asynchandler(async (req, res) => {
    try {
        const userId = req.user._id
        if(!userId){
            throw new ApiError("Unauthorized", 401)
        }
    
        const channelsallvideos = await Video.find({owner:userId})
        if(!channelsallvideos){
            throw new ApiError("No videos found", 201)
        }
    
        return res.status(200)
        .json(new ApiResponce(200,channelsallvideos,"All videos from channel are fetched successfully!!!"))
    
    } catch (error) {
        throw new ApiError(500,"Server error , try after sometimes!!!")
    }})

export {
    getChannelStats, 
    getChannelVideos
    }