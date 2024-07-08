import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET} from '../constants.js'

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cause it 's a url
      required: true,
    },
    coverImage: {
      type: String, // cause it 's a url
    },
    watchhistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    playlist: [
      {
        type: Schema.Types.ObjectId,
        ref:"playlist"
      }
    ],
    refreshtoken: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } else {
    next();
  }
});

// for checking password isCorect?
UserSchema.methods.isPasswordCorrect = async function (password) {
  console.log("provided Password: ",password)
  console.log("Store hash password: ",this.password)
  return await bcrypt.compare(password, this.password);
};




// Method to generate an access token for the user
UserSchema.methods.generateAccessToken = function() {
  // Define the payload for the access token
  const payload = {
    _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    // Add any other relevant claims
  };

  // Sign the access token using a secret key
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '60m' }); // Adjust expiry as needed

  return accessToken;
};

// Method to generate a refresh token for the user
UserSchema.methods.generateRefreshToken = function() {
  // Generate a random string for the refresh token
  const payload = {
    _id: this._id
  };
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET); 

  return refreshToken;
};
const User = mongoose.model("User", UserSchema);
export default User