import User from "../models/User.js";

//middelware to check if user is authenticated

const protect = async (req, res, next) => {
    const {userId}= req.auth();
    if(!userId){
        return res.json({success: false, message: 'not authenticated'})
    }else{
        const user = await User.findById(userId);
        if(!user){
            return res.json({success: false, message: 'user not found'})
        }
        req.user = user;
        next()
    }
}

export default protect;