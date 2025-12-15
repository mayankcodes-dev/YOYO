import Hotel from '../models/Hotel.js';
import User from '../models/User.js';

export const registerHotel = async (req, res) =>{
    try{
        console.log('🔵 registerHotel called');
        console.log('req.user:', req.user);
        console.log('req.body:', req.body);
        
        const{name,address,contact,city} = req.body;
        
        // Validate user is authenticated
        if(!req.user){
            console.log('❌ No user in request');
            return res.json({success: false, message: 'authentication required'})
        }
        
        const owner = req.user._id;
        console.log('owner:', owner);

        // Check if User Already Registered
        const hotel = await Hotel.findOne({owner})
        if(hotel){
            console.log('Hotel already exists for owner:', owner);
            return res.json({ success: false, message: 'hotel already registered'})
        }

        console.log('Creating hotel with:', {name, address, contact, city, owner});
        const newHotel = await Hotel.create({name, address, contact, city, owner});
        console.log('✅ Hotel created:', newHotel);
        
        const updatedUser = await User.findByIdAndUpdate(owner, {role: "hotelOwner"}, {new: true});
        console.log('✅ User updated to hotelOwner:', updatedUser?._id);

        console.log('✅ Sending success response');
        res.json({success: true, message: 'hotel registeres successfully'})

    } catch (error){
        console.error('❌ Error in registerHotel:', error.message);
        res.json({success: false, message: error.message})
    }
}