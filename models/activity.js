var db = require("../db");

var activitySchema = new db.Schema({
    userEmail:    String,
    deviceId:     String,
    startTime:    String,
    endTime:      String,
    activityType: String,
    calories:     Number,
    TotalUV:      Number,
    id: Number,
    datapoints:    [
                     {
                        latitude: Number,
                        longitude: Number,
                        uvExposure: Number,
                        speed: Number,
                     }
                  ]

});

var Activity = db.model("Activity", activitySchema);

module.exports = Activity;
