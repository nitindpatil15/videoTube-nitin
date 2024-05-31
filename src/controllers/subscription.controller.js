import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/User.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const toggleSubscription = asynchandler(async (req, res) => {
  const { _id } = req.query;
  const condition = { subscriber: req.user._id, channel: _id };
  if (!_id) {
    throw new ApiError("Invalid Id", 400);
  }

  const subscription = await Subscription.findOne(condition);

  if (!subscription) {
    const newSubscriber = await Subscription.create(condition);

    if (!newSubscriber) {
      throw new ApiError(401, "Something went wrong while subscribing");
    }
    
    return res.status(200)
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
});

// Alerady done in user Controller 


// controller to return subscriber list of a channel
// const getUserChannelSubscribers = asynchandler(async (req, res) => {
//   const { channelId } = req.params;
// });

// controller to return channel list to which user has subscribed
// const getSubscribedChannels = asynchandler(async (req, res) => {
//   const { subscriberId } = req.params;
// });

export { toggleSubscription, 
  // getUserChannelSubscribers, 
  // getSubscribedChannels 
};
