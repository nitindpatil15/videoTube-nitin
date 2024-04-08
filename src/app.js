import express from "express";
import cookieParser from "cookie-parser";
import cors from  "cors";

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    Credential:true
}))
// Config settings In CORS() middleware 
// for setting limits on data 
app.use(express.json({limit:"16kb"}))

// parse incoming requests in url of browser
app.use(express.urlencoded({extended:true , limit:"16kb"}))

// for any kind of static files , public is folder
app.use(express.static("public"))

// Accessing cookies from user browser which can only  be accessed by server side code using the following method
app.use(cookieParser())



// Routes import 
import userRouter from './routes/user.route.js'


// Router Declaration 
app.use("/api/v1/users", userRouter);

export {app}