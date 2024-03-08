import dotenv from "dotenv";


import connectdb from "./db/index.js";

dotenv.config({
    path: './env'
})

connectdb();





// import express from "express"
// const app = express()

// (async () =>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//         app.on("error" , (error) =>{
//             console.log("error : ",error)
//             throw error
//         })

//         app.listen((process.env.PORT,() =>{
//             console.log("the project is running on : ",process.env.PORT)
//         }))
//     }
//     catch(error){
//         console.error("error : ",error )
//         throw error
//     }
// })()