import dotenv from 'dotenv'
import connectDb from './db/index.js'
import { app } from './app.js'
import {PORT} from './constants.js'

dotenv.config({
    path:"./env"
})


connectDb()
.then(()=>{
    app.on("Error",error =>{
        console.log("Server Error : ", error)
    })
    app.listen(PORT ||8043 , ()=>{
        console.log(`Server is running at port http://localhost:${PORT}`)
    })
})
.catch((err) => {
    console.error("MongoDB connection Failed !!!",err)
})





// import express from 'express'
// const app = express()
// port = PORT || 5000
// (async () => {
//     try {
//         await mongoose.connect(`${MONGODB_URI}`)
//         app.on("error",(error)=>{
//             console.log("Error",error)
//             throw error;
//         })
//         app.listen(port, () => {
//             console.log(`Server started on port ${port}/${DB_NAME}`)
//         })
//     } catch (error) {
//         console.log("Error: ",error)
//         throw error;
//     }
// })()