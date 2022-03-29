const express = require('express')
const path = require('path');
fs = require('fs');
const app = express()
const port = 3000
var bodyParser= require("body-parser");
const e = require('express');
const mongoose = require('mongoose');
let loggedUser = null;
let lastSpo2 = "0";
let lastBpm = "0";
const db = 'mongodb://localhost:27017/PulseOximetr?readPreference=primary&appname=MongoDB%20Compass&ssl=false'
const liveData=  {
  bpm:0,
  spo2:0
};


mongoose.connect(db, {useNewUrlParser: true,useUnifiedTopology: true})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));



app.use(bodyParser.urlencoded({extended:true}));
const pomModel = require('./models/data');
const userModel = require("./models/user");




app.set('views',path.join(__dirname,'views')); 
app.set('view engine','hbs');
app.use(express.static('public'));

app.get('/', function (req, res) { 

res.render('index'); 

});

app.get('/login', function (req, res) { 
  res.render('login');
  
  }) ;
app.use(bodyParser.urlencoded({ extended: false })) 

var bpm ;
var spo2;
/*
var corona  = false  ;
app.get('/test', function (req, res) {
  console.log(bpm)
  console.log("this get test method run") 
  
  var eger = parseInt( spo2 , 10);

  console.log(typeof(spo2))
  if (eger < 93 )
    corona = true ; 
  else
    corona  = false ; 
  res.render('index' , {bpm,spo2 , corona }); 
}) */

app.post('/', function(req, res) {  
  liveData.bpm = req.body.bpm;
  liveData.spo2 = req.body.spo2;
  console.log(req.body);
  if(!loggedUser){

  } else{
    bpm = JSON.stringify(req.body.bpm);
    spo2 = JSON.stringify(req.body.spo2);
    if(bpm.indexOf("0.00") == -1 && spo2.indexOf("0") == -1){
      if(lastBpm != bpm && lastSpo2 != spo2){
    console.log(bpm,spo2)
    console.log("Your Spo2 and bpm for save in is:")
    
    const newatt = new pomModel ({spo2 : parseFloat(spo2.replace("\"","")),bpm: parseFloat(bpm.replace("\"","")),_user:loggedUser._id })
  
    newatt.save() ; 
    res.send('post the pom data, thanks..!!');
    lastSpo2=spo2;
    lastBpm=bpm;
      }
  } 
    
  }
}) 

app.get("/live",(req,res) => {
  res.json(liveData);
})



app.get("/dashboard",async (req,res) => {
  if(!loggedUser){
    res.redirect("/login");
  }else{
    let data = await pomModel.find({
      _user:loggedUser._id
    }).sort({date:-1}).limit(10)

    let spoArray = [];
    let bpmArray = [];
    let dateArray = [];

    for (let dt of data){
      spoArray.push(dt.spo2);
      bpmArray.push(dt.bpm);
      dateArray.push(dt.date.toString());
    }
    res.render('dashboard',{data,spoArray,bpmArray,dateArray})
  }
 
});
var configData;
var LEDThreshold;

app.post("/dashboard",(req,res) => {
  res.render('dashboard')
  console.log(req.body)
  configData = req.body.PDS;
  LEDThreshold = req.body.LED;
});

app.get("/configWemos",(req,res) => {
  res.json({num : configData,
  led : LEDThreshold})
});
app.post("/register",async (req,res) => {
  const {user,pass} = req.body;
  try{
    let checkUserExist = await userModel.findOne({username:user});
    if(checkUserExist){
      res.render('login',{
        error:"Karbar mojood"
      })
    }else{
      let createdUser = await userModel.create({username:user,password:pass});
      loggedUser = createdUser;
      res.redirect("/dashboard");
    }

  }catch(err){
    console.log(err.message);
  }
})

app.post("/login",async (req,res) => {
  const {user,pass} = req.body;
  try{
    let dbUser = await userModel.findOne({username:user,password:pass});
    if(!user){
      res.render('login');
    }else{
      loggedUser = dbUser;
      res.redirect("/dashboard");
    }

  }catch(err){
    console.log(err.message);
  }
})



module.exports = app;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })