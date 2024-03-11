import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse  } from "../utils/ApiResponse.js";



const registerUser = asyncHandler( async (req , res) =>{
    // get user details from user
    //validation
    // check if user is exist : username or email
    //check for images , check for avatar
    // upload them cloudinary
    // create user object - create entry in db
    // remove refresh token and password from response
    // check for user creation
    //return res


    const {fullname , username , email , password} = req.body
    console.log("email: ",email);

    if(
        [fullname,email,username,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400 , "All field are required")
    }

    const existedUser = User.findOne({
        $or : [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(400 , "user with email and username is already exist")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const imagesLocalpath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400 , "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(imagesLocalpath)

    if(!avatar){
        throw new ApiError(400 , "avatar file is required")
    }

    const user = await User.create({
        fullname , 
        avatar : avatar.url ,
        coverImage : coverImage?.url||"",
        email,
        username : username.toLowerCase(),
        password
    })

    const createuser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createuser){
        throw new ApiError(500,"something went wrong while registering user")
    }
    return res.status(201).json(
        new ApiResponse(200, createuser , "user registeres seccessfully")
    )




    // if(fullname==""){
    //     throw new ApiError(400,"fullname is required")
    // }


    // res.status(200).json({
    //     message:"ok"
    // })
})

export {registerUser}