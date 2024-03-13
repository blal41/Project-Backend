import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse  } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const generateAccessandRefreshtoken = async(userId) =>{
    try {

       const user =  await User.findById(userId)

       const accessToken = user.generateaccesstoken()
       const refreshToken = user.generateRefreshtoken()

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave  :false})

       return {accessToken , refreshToken}
        
    } catch (error) {
        throw new ApiError(500 , "something went wrong while generate a token")
    }
}


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

    const existedUser = await User.findOne({
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




   
})

const loginuser = asyncHandler (async (req , res) => {
    // req body = data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookies

    const {username , password ,email} = req.body 

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    const  user = await User.findOne({
        $or : [{ username} , {email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user cradientals")
    }

    const{accessToken , refreshToken} = await generateAccessandRefreshtoken(user._id)

    const loggeduser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken , options)
    .json(
        new ApiResponse (
            200 , {
                user : loggeduser , accessToken , refreshToken
            },
            "user Loggedin Successfully"
        )
    )

     
})

const logoutUser = asyncHandler(async (req , res) => {
    await User.findByIdAndUpdate(
        req.user._id , 
        {
            $set :{
                refreshToken : undefined
            }

        },
        {
            new : true
        }

       
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200 , {},"user LogOut Successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.ACCESS_TOKEN_SECRET);
        
        const user= User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401 , "Invalid Refresh token")
        }
    
        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401 , "Refresh token is expired")
            
        }
    
        const options ={
            httpOnly :true,
            secure : true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessandRefreshtoken(user._id)
    
        return res.status(200).cookie("accessToken",accessToken , options).cookie("refreshToken",newrefreshToken,options).json(
            new ApiResponse(200,{accessToken , refreshToken : newrefreshToken} , "access token refreshed")
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "invalid refresh token")
        
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) =>{
    const {oldPassword , newPassword } = req.body

    const user =  await User.findById(req.user?._id)

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(401 , "Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave :false})

    return res.status(200).json(new ApiResponse (200 , {} , "password is updated"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(200 , req.user , "current user fetced successfully")
})

const updateAccountDetails = asyncHandler(async(req, res) =>{
    const{fullname , email} = req.body

    if(!fullname || !email){
        throw new ApiError(400 , "all field are required")
    }

    User.findByIdAndUpdate(req.user?._id, {
         $set : {
            fullname,
            email
         }
    } ,
    {new : true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200 , user , "account detail successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) =>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400 , "avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400 , "error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id , {
        $set :{
            avatar : avatar.url
        }
    },{new : true}).select("-password")


    return res.status(200).json(new ApiResponse(200 , user , "Avatar is updated successfully"))

})

const updateUserCoverImage = asyncHandler(async(req, res) =>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400 , "CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400 , "error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id , {
        $set :{
            coverImage : coverImage.url
        }
    },{new : true}).select("-password")

    return res.status(200).json(new ApiResponse(200 , user , "coverImage is updated successfully"))
})

export {registerUser , loginuser , logoutUser ,refreshAccessToken ,changeCurrentPassword , getCurrentUser ,updateUserAvatar , updateUserCoverImage}