import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDb = async()=>{
    try {
        const connectioncontain = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected!! DB Host: ${connectioncontain.connection.host}`)
    } catch (error) {
        console.log("MongoDB Connection failed: ",error)
    }
}
export default connectDb;