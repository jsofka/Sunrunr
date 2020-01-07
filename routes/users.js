let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync('jwtkey').toString();

router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
       res.status(401).json({success : false, message : "Can't connect to DB."});         
    }
    else if(!user) {
       res.status(401).json({success : false, message : "Email or password invalid."});         
    }
    else {
      bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
         if (err) {
           res.status(401).json({success : false, message : "Error authenticating. Contact support."});         
         }
         else if(valid) {
            var authToken = jwt.encode({email: req.body.email}, secret);
            res.status(201).json({success:true, authToken: authToken});
         }
         else {
            res.status(401).json({success : false, message : "Email or password invalid."});         
         }
         
      });
    }
  });
});

/* Register a new user */
router.post('/register', function(req, res, next) {
   
   bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
         res.status(400).json({success : false, message : err.errmsg});         
      }
      else {
        var newUser = new User ({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash
        });
        
        newUser.save(function(err, user) {
          if (err) {
             res.status(400).json({success : false, message : err.errmsg});         
          }
          else {
             res.status(201).json({success : true, message : user.fullName + "has been created"});                      
          }
        });
      }
   });   
});

router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(400).json({success: false, message: "User does not exist."});
         }
         else {
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
	    userStatus['threshold'] = user.threshold;
	    userStatus['userDevices'] = user.userDevices;
            
            // Find devices based on decoded token
		      Device.find({ userEmail : decodedToken.email}, function(err, devices) {
			      if (!err) {
			         // Construct device list
			         let deviceList = []; 
			         for (device of devices) {
				         deviceList.push({ 
				               deviceId: device.deviceId,
				               apikey: device.apikey,
				         });
			         }
			         userStatus['userDevices'] = deviceList;
			      }
			      
               return res.status(200).json(userStatus);            
		      });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

router.put("/threshold" , function(req, res) {
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   if(!req.body.threshold){
      return res.status(400).json({success: false, message: "No threshold provided."});
   }

   var authToken = req.headers["x-auth"];
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var responseJson = {};
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err || !user) {
            return res.status(200).json({success: false, message: "User does not exist."});
         }
         else {
            user.threshold = req.body.threshold;
            user.save(function(err, user){
               if (err) {
                  responseJson.success = false;
                  responseJson.message = "Error: Communicating with database";
                  return res.status(201).json(responseJson);
               }
               else{
                  responseJson.success = true;
                  responseJson.message = "Threshold Updated Successfully";
                  return res.status(201).send(JSON.stringify(responseJson));
               }
            });
         }
      });

   }
   catch{
	responseJson.success = false;
        responseJson.message = "Error: Unknown";
        return res.status(404).json(responseJson);

   }
});

router.delete("/devices/delete/:id" , function(req, res) {

    User.update({}, function(err, users){
	{$pull: {userDevices: req.params.id}}  
	console.log(users);
	}
    );

});

router.post("/threshold" , function(req, res) {
	var responseJson = {};
	console.log(req.body);
      
      User.find({}, function(err, user) {
	for (var u in user){

		for (var device in user[u].userDevices){
			//console.log(user[u].userDevices[device]);
			if(user[u].userDevices[device].deviceId == req.body.coreid){
				responseJson.message = user[u].threshold;
				return res.status(201).json(responseJson);
			}
		}
		
        }
      });
	
	responseJson.message = "Error: Could not find threshold";
	return res.status(400).json(responseJson);

});


module.exports = router;
