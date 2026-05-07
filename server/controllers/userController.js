// get  /api/user/

export const getUserData = async (req, res) =>{
    try{
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({success: true, role, recentSearchedCities})
    }catch(err){ 
        res.json({success: false, message: err.message})
    }  
}
  
// store user recent searched cities
export const storeRecentSearchedCities = async (req, res)=>{
    try{
        const {recentSearchedCity} = req.body;
        const user = req.user;

        // Prevent duplicate cities
        if (user.recentSearchedCities.includes(recentSearchedCity)) {
            return res.json({success: true, message: "City already in recent searches"})
        }

        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchedCity)
        }else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }
        await user.save();
        res.json({success: true, message: "City added"})

    }catch(error){
        res.json({success: false, message: error.message})
    }
}
