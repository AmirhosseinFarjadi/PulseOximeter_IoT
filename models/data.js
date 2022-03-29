const mongoose = require('mongoose') 

const pomschema = new mongoose.Schema(
    {
        spo2 :{type:Number , required : true }, 
        bpm:{type:Number,required:true},
        date :{type:Date, default:Date.now},
        _user:{type:mongoose.Schema.ObjectId,required:true}
    }, 
    {
        collection: 'pom',
        allowedProtoMethods: {
            _id : true
        },
    },

)
const data = mongoose.model('pom' , pomschema  )
module.exports= data ; 
