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