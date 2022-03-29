const mongoose = require('mongoose') 

const userschema = new mongoose.Schema(
    {
        username :{type:String , required : true }, 
        password :{type:String, required : true }
    }, 
    {
        collection: 'user',
        allowedProtoMethods: {
            _id : true
        },
    },

)
const data = mongoose.model('user' , userschema  )
module.exports= data ; 
