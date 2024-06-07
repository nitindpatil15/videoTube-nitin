import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name:{
        type:String,
        required:[true,"Please provide a name for the playlist"],
    },
    description:{
        type:String,
        required:true
    },
    videos:[{
        type:Schema.Types.ObjectId,  // Array of video Ids
        ref:"Video"                   // Reference
    }],
    owner:{
        type:Schema.Types.ObjectId,  // Array of user Ids
        ref:"User"                   // Reference
    }
}, { timestamps: true });

export const playlist = mongoose.model("playlist", playlistSchema);
