import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/User.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const toggleSubscription = asynchandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    if (!channelId) {
      throw new ApiError(400, "Channel Id is required");
    }
    const condition = { subscriber: req.user._id, channel: channelId };
    if (!condition) {
      throw new ApiError("Invalid condition", 400);
    }
  
    const subscription = await Subscription.findOne(condition);
  
    if (!subscription) {
      const newSubscriber = await Subscription.create(condition);
  
      if (!newSubscriber) {
        throw new ApiError(401, "Something went wrong while subscribing");
      }
  
      return res
        .status(200)
        .json(new ApiResponce(200, newSubscriber, "Subscribed a Channel"));
    } else {
      const unsubscribe = await Subscription.findOneAndDelete(condition);
  
      if (!unsubscribe) {
        throw new ApiError(400, "Something went wrong while unsubscribing!");
      }
  
      return res
        .status(200)
        .json(new ApiResponce(200, unsubscribe, "UnSubscribed a Channel!"));
    }
  } catch (error) {
    throw new ApiError(500,"Server Error! , Try Again...")
  }
});

const getSubscribeCount = asynchandler(async (req, res) => {
  try {
    const { channelId } = req.user._id;
    const { username } = req.params;
    if (!username?.trim()) {
      throw new ApiError(401, "Username is missing!!");
    }

    const channel = await User.aggregate([
      {
        $match: {
          username: username.toLowerCase(),
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
              if: {
                $in: [
                  new mongoose.Types.ObjectId(channelId),
                  "$Subscribers.subscriber",
                ],
              },
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

    if (!channel.length) {
      throw new ApiError(402, "Channel does not exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponce(200, channel[0], "User Channel fetched Successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error during fetching channel");
  }
});

export { toggleSubscription, getSubscribeCount };
