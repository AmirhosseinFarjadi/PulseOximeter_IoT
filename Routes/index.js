const express = require('express')
const express = require('express');
const router = express.Router();
const {ensureAuth} = require('../config/auth')
const { MongoClient, ObjectID } = require("mongodb");

const uri = "mongodb://localhost:27017/PulseOximetr?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const client = new MongoClient(uri, { useNewUrlParser: true});
client.connect(err => {
  useUnifiedTopology: true
  const collection = client.db("PulseOximetr").collection("users");
  console.log('Connected to DB');
  client.close();
});

router.get('/', function(req,res){
 
  MongoClient.connect(uri, function(err, db) {
   if (err) throw err;
    var dbo = db.db("ClothingStore");
    var dbo2=db.db("ClothingStore");
    var dbo3=db.db("ClothingStore");
    dbo.collection("BestProducts").find({}).toArray(function(err ,bestpro ){  
    dbo2.collection("NewProducts").find({}).toArray(function (err ,newpro  ){
    dbo3.collection("HotProducts").find({}).toArray(function (err ,hotpro  ){

			res.render('./partials/index', {NewProducts : newpro ,BestProducts: bestpro , HotProducts : hotpro  })
		})
})
  })
})
})

router.get("/dashboard",ensureAuth, (req,res) => {
  res.render("./partials/dashboard", {name: req.user.name});
}) 
router.post('/',ensureAuth, function (req, res) {

    MongoClient.connect(uri, function(err, db) {
   if (err) throw err;
   var dbo = db.db("ClothingStore");
   var myobj = { title: req.body.title, image: "uploads/newProduct.jpg",price: req.body.price };
   dbo.collection("BestProducts").insertOne(myobj, function(err, res) {
     if (err) throw err;
     console.log("1 document inserted");
     db.close();
   });
 });
 res.redirect("/")
});

router.delete('/:id', ensureAuth, function(req,res){

    MongoClient.connect(uri, function(err, db) {
      if (err) throw err;
      var dbo = db.db("ClothingStore");
      dbo.collection("BestProducts").deleteOne({
        _id: ObjectID(req.params.id)
      }).then(result => {
        if (result.deletedCount === 0) {
          return res.json('No quote to delete')
        }
        res.json(`Deleted Darth Vadar's quote`)
      })
      .catch(error => console.error(error))
    });
    res.redirect("/")
  });


module.exports = router;