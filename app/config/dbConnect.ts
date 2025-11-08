//importing modules
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

//details from the env
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const dbName = 'Ticket_booking_system'

const connectionString = `mongodb+srv://${username}:${password}@cluster0.ewwcraz.mongodb.net/${dbName}`


//db connection
export const connectDb = mongoose.connect(connectionString)
    .then(res => {
        if (res) {
            console.log(`Database connection succeffully ✔ to ${dbName}`)
        }

    }).catch(err => {
        console.log(err)
        console.error(`🔴 Connection failed: No internet connection or MongoDB server unreachable.`);

    });
