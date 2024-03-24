import dotenv from 'dotenv'
import connectDb from './db/index.js'

dotenv.config({
    path:"./env"
})


connectDb()
.then(()=>{
    app.on("Error",error =>{
        console.log("Server Error : ", error)
    })
    app.listen(process.env.PORT ||8043 , ()=>{
        console.log(`Server is running at por ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.error("MongoDB connection Failed !!!",err)
})





// import express from 'express'
// const app = express()
// port = process.env.PORT || 5000
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}`)
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