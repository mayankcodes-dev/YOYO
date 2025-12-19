import Hotel from '../models/Hotel.js';
import User from '../models/User.js';

export const registerHotel = async (req, res) =>{
    try{
        const{name,address,contact,city} = req.body;
        
        if(!req.user){
            return res.json({success: false, message: 'authentication required'})
        }
        
        const owner = req.user._id;

        // Check if User Already Registered
        const hotel = await Hotel.findOne({owner})
        if(hotel){
            return res.json({ success: false, message: 'hotel already registered'})
        }

        await Hotel.create({name, address, contact, city, owner});
        await User.findByIdAndUpdate(owner, {role: "hotelOwner"}, {new: true});

        res.json({success: true, message: 'hotel registered successfully'})

    } catch (error){
        res.json({success: false, message: error.message})
    }
}