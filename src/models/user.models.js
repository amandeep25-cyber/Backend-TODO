import mongoose from "mongoose"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema(
    {
        fullName:{
            type: String,
            required: true  
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true,
            min: [8,"Enter atleast 8 character"]
        },
        avatar:{
            type: String,

        },
        refreshToken:{
            type: String,
            
        }
    },
    {
        timestamps:true
    }
)

userSchema.pre('save',async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hashSync(this.password,10)
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compareSync(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            fullName: this.fullName,
            email: this.email
        },
        process.env.ACCESS_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_EXPIRY_KEY
        })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        
        },
        process.env.REFRESH_SECRET_KEY,
        {
            expiresIn: process.env.REFRESH_EXPIRY_KEY
        })
}

export const User = mongoose.model("User",userSchema)