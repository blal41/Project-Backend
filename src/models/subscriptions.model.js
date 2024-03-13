import mongoose,{Schema} from "mongoose";

const sunscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId,  // one to who sunscribe
        ref : "User"   
      },
      channel : {
        type : Schema.Types.ObjectId,  // one to who sunscribe
        ref : "User"   
      },
},{timestamps : true})

export const Subscription = mongoose.model("Subscription",sunscriptionSchema)