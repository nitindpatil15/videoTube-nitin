import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema({
    videodoc: {
        type: String,    // file URL
        required: true,
    },
    thumbnail: {
        type: String,   // URL
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});

VideoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

export { Video };