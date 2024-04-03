import mongoose ,{Schema} from "mongoose";
import { Jwt } from "jsonwebtoken";
import bcrypt from 'bcrypt'

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,  // cause it 's a url
        required: true,
    },
    coverimage: {
        type: String,  // cause it 's a url
    },
    watchhistory: [
        {
            type : Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    refreshtoken: {
        type: String
    }
},{timestamps: true})


UserSchema.pre("save",async function(next){
    if(this.isModified('password')){
        this.password = bcrypt.hash(this.password,10)
        next()
    }
    else{
        next()
    }
})

// for checking password isCorect?
userSchema.methods.isCorrectPassword= async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function (){
    jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function (){
    jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model( 'User', UserSchema );