import dotenv from "dotenv";
import app from "./app.js";


import connectdb from "./db/index.js";

dotenv.config({
    path: './env'
})

connectdb().then(()=>{
    app.listen(process.env.PORT || 8000 , () =>{
        console.log(` server is running on at port : ${process.env.PORT}`)
    })
})
.catch((err) =>{
    console.log("mongodb connection failed : ",err)
})





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