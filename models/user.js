const mongoose = require("mongoose");

const userSchema= mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    tweets: {
        type: [
            {
                created_at: String,
                text: String,
                user: {
                  id: Number,
                  id_str: String,
                  name: String,
                  screen_name: String,
                //   profile_background_image_url: String,
                //   profile_image_url: String,
                },
                retweet_count: Number,
                favorite_count: Number,
              }
            
        ]
    }
    
});
module.exports=mongoose.model("Users", userSchema);