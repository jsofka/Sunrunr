var express = require('express');
var router = express.Router();
var fs = require('fs');
var Device = require("../models/device");
var Activity = require("../models/activity");
var jwt = require("jwt-simple");
var User = require("../models/users");
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.put('/type', function(req, res, next){
   var responseJson = {
        success : false,
        message : "",
        activityType: ""
    };

    if(!req.body.activityType) {
	responseJson.status = "ERROR";
	responseJson.message = "Invalid Selection";
	return res.status(400).send(JSON.stringify(responseJson));
    }
    else {
	Activity.findById(req.body.activityId, function(err, activity){
		if(err) {
			responseJson.message("ERROR");
			return res.status(501).json(responseJson);
		}
		if(!activity){
			responseJson.message = "Activity type " + req.body.activityType + " does ot exist.";
			return res.status(201).json(responseJson);
		}
		if(req.body.activityType=="walking"|| req.body.activityType=="running"|| req.body.activityType=="biking"){
			activity.activityType=req.body.activityType;
			activity.getCalories(activity);
			activity.TotalUV = getTotalUV(acitvity);
		}
		else {
			responseJson.message = "Invalid activity type";
			return res.status(400).json(responseJson);
		}
		
		activity.save(function(err, activity){
                if (err) {
                    responseJson.status = "ERROR";
                    responseJson.message = "Error saving data in db." + err;
                    return res.status(201).send(JSON.stringify(responseJson));
                }

                responseJson.success = true;
                responseJson.message = "Update successful";
                responseJson.activityType = req.body.activityType
                return res.status(201).send(JSON.stringify(responseJson));
            });
	});
    }
});

function getCalories(activity){
    var sec =(activity.endTime - activity.startTime)/1000;
    var cal = 0;
    if(activity.activityType == "walking"){
        cal = 0.04 * sec;
    } else if(activity.activityType == "running"){
        cal = 0.12 * sec;
    } else if(activity.activityType == "biking"){
        cal = 0.135 * sec;
    }
    return Math.ceil(cal);
}

function getTotalUV(activity){
    var total = 0;
    for(var datapoint of activity.datapoints){
        total +=datapoint.uvExposure;
    }
    totalUV=Math.ceil((total/100)/3600);
    return totalUV;
}

router.get('/all', function(req, res, next) {
    var responseJson = {
        success : false,
        message : ""
    };

// Check for authentication token in x-auth header
    console.log(req.headers);

    if (!req.headers["deviceid"]) {
        return res.status(300).json({success: false, message: "No deviceId"});
    }

    var deviceId = req.headers["deviceid"];
    
        var response = {};

        Activity.find({deviceId: deviceId}, function(err, activities) {
            if(err) {
                return res.status(200).json({success: false, message: "No Activities Found."});
            }
            else {
                // Find devices based on id
                    if (activities && !err) {
                        response.success = true;
                        response.message = "Activity found."
                        // response.deviceId = activity.deviceId;
                        // response.startTime = activity.startTime;
                        // response.endTime = activity.endTime;
                        // response.activityType = activity.activityType;
                        // response.calories = activity.calories;
                        // response.TotalUV = activity.TotalUV;
                        // response.waypoints = activity.datapoints;
                        response.activies = activities;
                        return res.status(200).json(response);
                    }
                    else{
                        return res.status(201).json({success: false, message: "idk bruh."});
                    }
            }
        });
   
});

router.get('/id/:actId', function(req, res, next) {
    var activityId = req.params.actId;
    var responseJson = {
        success : false,
        message : ""
    };

// Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return res.status(401).json({success: false, message: "No authentication token"});
    }

    var authToken = req.headers["x-auth"];
    try {
        var decodedToken = jwt.decode(authToken, secret);
        var response = {};

        User.findOne({email: decodedToken.email}, function(err, user) {
            if(err) {
                return res.status(200).json({success: false, message: "User does not exist."});
            }
            else {
                // Find devices based on id
                Activity.findOne({ userEmail : decodedToken.email, _id: activityId}, function(err, activity) {
                    if (activity && !err) {
                        response.success = true;
                        response.message = "Activity found."
                        response.deviceId = activity.deviceId;
                        response.startTime = activity.startTime;
                        response.endTime = activity.endTime;
                        response.activityType = activity.activityType;
                        response.calories = activity.calories;
                        response.TotalUV = activity.TotalUV;
                        response.waypoints = activity.datapoints;
                        return res.status(200).json(response);
                    }
                    else{
                        return res.status(201).json({success: false, message: "Activity not found."});
                    }
                });
            }
        });
    }
    catch (ex) {
        return res.status(401).json({success: false, message: "Invalid authentication token."});
    }
});

router.post('/add', function(req, res, next){
    var responseJson = {
        success : false,
        message : "",
        threshold: 0
    };

    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.message = "Request missing deviceId parameter.";
	console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("apiKey") ) {
        responseJson.message = "Request missing apiKey parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("startTime") ) {
        responseJson.message = "Request missing startTime parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("endTime") ) {
        responseJson.message = "Request missing endTime parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("totalUV") ) {
        responseJson.message = "Request missing totalUV parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("latitude") ) {
        responseJson.message = "Request missing latitude parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("longitude") ) {
        responseJson.message = "Request missing longitude parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("speed") ) {
        responseJson.message = "Request missing speed parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("uvExposure") ) {
        responseJson.message = "Request missing uvExposure parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("id") ) {
        responseJson.message = "Request missing id parameter.";
console.log(JSON.stringify(responseJson));
        return res.status(201).send(JSON.stringify(responseJson));
    }


    req.body.points = [
        {
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            speed: req.body.speed,
            uvExposure: req.body.uvExposure
        }
    ];

    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device === null) {
            responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
console.log(JSON.stringify(responseJson));
            return res.status(201).send(JSON.stringify(responseJson));
        }

        if (device.apikey != req.body.apiKey) {
            responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
console.log(JSON.stringify(responseJson));
            return res.status(201).send(JSON.stringify(responseJson));
        }

	console.log(device.deviceId);	

        var activity = new Activity({
            userEmail:    device.userEmail,
            deviceId:     device.deviceId,
            startTime:    req.body.startTime,
            endTime:      req.body.endTime,
            activityType: "",
            calories:     0,
            TotalUV:      Number(req.body.totalUV),
            datapoints:    req.body.points,
	    id: Number(req.body.id)
        });
        activity.calories = getCalories(activity);
        activity.TotalUV = getTotalUV(activity);
        responseJson.message = "New activity recorded.";

        User.findOne({"email": device.userEmail}, function(err, user){
            if(err){
                responseJson.status = "ERROR";
                responseJson.message = "Error getting user";
console.log(JSON.stringify(responseJson));
                return res.status(201).json(responseJson);
            } else {
                responseJson.threshold = user.threshold;

                activity.save(function(err, newAct){
                    if (err) {
                        responseJson.status = "ERROR";
                        responseJson.message = "Error saving data in db." + err;
console.log(JSON.stringify(responseJson));
                        return res.status(201).send(JSON.stringify(responseJson));
                    }

                    responseJson.success = true;
                    responseJson.activityId = newAct._id.toString();
console.log(JSON.stringify(responseJson));
                    return res.status(201).send(JSON.stringify(responseJson));
                });
            }
        });
    });
});

router.post('/update', function(req, res, next){
   var responseJson = {
        success : false,
        message : "",
        activityId: "",
    };

   if(req.body.latitude != undefined && req.body.longitude != undefined
	&& req.body.speed != undefined && req.body.uv != undefined){
	
	var newData = {
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		speed: req.body.speed,
		uv: req.body.uv
	}

	Device.findOne({deviceId: req.body.deviceId}, function(err, device){
		if(device == null){
			responseJson.message = "Invalid device Id";
			return res.status(201).send(JSON.stringify(responseJson));
		}
		
		if(device.apikey != req.body.apikey){
			responseJson.message = "Invalid apikey for this device";
			return res.status(201).send(responseJson);
		}

		Activity.findById(req.body.activityId, function(err, activity){
			if(err){
				responseJson.message = "Error";
				return res.status(501).json(responseJson);
			}
			if(!activity){
				responseJson.message = "Activity does not exist";
				return res.status(201).json(reponseJson);
			}
			if(newData){
				activity.points.push(newData);
				activity.calories = getCalories(activity);
				activity.TotalUV = getTotalUV(activity);
				activity.activityType = getType(activity);
			}
			activity.save(function(err, activity) {
				if (err) {
            				responseJson.status = "ERROR";
            				responseJson.message = "Error saving data in db.";
            				return res.status(201).send(JSON.stringify(responseJson));
          			}
          			else {
            				responseJson.status = "OK";
            				responseJson.message = "Data saved in db.";
            				return res.status(201).send(JSON.stringify(responseJson));
          			}

			});
		});
	});

   }
});

module.exports = router;
