let express = require('express');
let router = express.Router();
let Device = require("../models/device");
let User = require("../models/users");
let fs = require('fs');
let jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync('jwtkey').toString();

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  return "VOWJ2uehCfMzr8419vSYlVcyAgQdj7vr";
}

// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
  let deviceId = req.params.devid;
  let responseJson = { devices: [] };

  if (deviceId == "all") {
    let query = {};
  }
  else {
    let query = {
      "deviceId" : deviceId
    };
  }
  
  Device.find(query, function(err, allDevices) {
    if (err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
    }
    else {
      for(let doc of allDevices) {
        responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
      }
    }
    res.status(200).json(responseJson);
  });
});

router.get("/recent/:id", function(req, res) {
    let responseJson = {
        success: true,
        message: ""
    };

	HwData.find({deviceId: req.params.id}, function(err, hwdata) {
		if(err) {
			res.status(400).send(err);
		}
		else {
			console.log(hwdata);
			res.status(201).json(hwdata);
		}
	});

});

router.post('/register', function(req, res, next) {
  let responseJson = {
    registered: false,
    message : "",
    apikey : "none",
    deviceId : "none"
  };
  let deviceExists = false;
  
  // Ensure the request includes the deviceId parameter
  if( !req.body.hasOwnProperty("deviceId")) {
    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }

  let email = "";
    
  // If authToken provided, use email in authToken 
  if (req.headers["x-auth"]) {
    try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
      email = decodedToken.email;
    }
    catch (ex) {
      responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }
    
  // See if device is already registered
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device !== null) {
      responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
      return res.status(400).json(responseJson);
    }
    else {
      // Get a new apikey
	   deviceApikey = getNewApikey();
	    
	    // Create a new device with specified id, user email, and randomly generated apikey.
      let newDevice = new Device({
        deviceId: req.body.deviceId,
        userEmail: email,
        apikey: deviceApikey
      });

      // Save device. If successful, return success. If not, return error message.
      newDevice.save(function(err, newDevice) {
        if (err) {
          responseJson.message = err;
          // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
          return res.status(400).json(responseJson);
        }
        else {
          responseJson.registered = true;
          responseJson.apikey = deviceApikey;
          responseJson.deviceId = req.body.deviceId;
          responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
          return res.status(201).json(responseJson);
        }
      });

      User.find({ email: email }, function(err, user) {
	console.log(user);
	for (var u in user) {
		user[u].userDevices.push(JSON.stringify({deviceId: req.body.deviceId, apikey: deviceApikey}));
		console.log(user[u]);
		user[u].save();
	}

      });

	/*User.find({}, function(err, user) {
	console.log(user);

	});*/

    }
  });
});

router.post('/ping', function(req, res, next) {
    let responseJson = {
        success: false,
        message : "",
    };
    let deviceExists = false;
    
    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }
    
    // If authToken provided, use email in authToken 
    try {
        let decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }
    
    request({
       method: "POST",
       uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/pingDevice",
       form: {
	       access_token : particleAccessToken,
	       args: "" + (Math.floor(Math.random() * 11) + 1)
        }
    });
            
    responseJson.success = true;
    responseJson.message = "Device ID " + req.body.deviceId + " pinged.";
    return res.status(200).json(responseJson);
});

router.post('/data', function(req, res, next){
    console.log(req);
    return res.status(200);
});

router.delete("/:id", function(req, res) {
console.log("attempt delete");
	if (!req.headers["x-auth"]) {
		return res.status(401).json({success: false, message: "No authentication token"});
	}

   var authToken = req.headers["x-auth"];
   let responseJson = {
        success: false,
        message : "",
    };

var status = 0


    var decodedToken = jwt.decode(authToken, secret);
      
   //   User.findOne({email: decodedToken.email}, function(err, user) {
      //   if(err || !user) {
    //        return res.status(400).json({success: false, message: "User does not exist."});
  //       }
        // else {
      //      let Device = require("../models/device");
	  //  console.log(user);
	    Device.findOne({ deviceId : req.params.id }, function(err, device) {
		if(err || device == null){
                  responseJson.success = false;
		  responseJson.message = "Could not find device to delete";
               }
		else if (!err && device.userEmail==decodedToken.email && device) {
		  device.remove();
                  responseJson.success = true;
                  responseJson.message = "Device has been successfully removed from the system.";
                  console.log("Delete1");               }
	    });

	    User.findOne({email: decodedToken.email}, function(err, user) {
		  if(err || !user) {
			responseJson.success = false;
		  	responseJson.message = "Could not find device to delete";
			status = 400;
		   }
		else{
			for (var dev in user.devices){
				if (dev.deviceId == req.params.id){
					var index = user.devices.indexOf(5);
					array.splice(index, 1);
                  			responseJson.success = true;
                  			responseJson.message = "Device "+ dev.deviceId+" has been successfully removed from the system.";
                  			console.log("Delete2");
			
				}
			}
		}
	    });
	return res.status(201).json(responseJson);
		   
     //    }
      //});
});


module.exports = router;
