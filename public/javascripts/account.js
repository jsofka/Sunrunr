function myFunction() {
	var x = document.getElementById("lightbox");
	if (x.style.display === "none") {
	  x.style.display = "block";
	} else {
	  x.style.display = "none";
	}
  }

function sendReqForAccountInfo() {
  $.ajax({
    url: '/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function sendReqForActivityInfo() {
 activityId = getUrlVars()["id"];
    $.ajax({
        url: '/activity/id/'+ activityId,
        type: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        responseType: 'json',
        success: activitySuccess,
        error: activityError
    });
}

function sendReqAllActs(deviceId){
     $.ajax({
         url: '/activity/all',
         type: 'GET',
         headers: { 'deviceId': deviceId, 'x-auth': window.localStorage.getItem("authToken") },
         responseType: 'json',
         success: activitiesAllSuccess,
         error: activitiesAllError
     });
}

function activitiesAllSuccess(data, textSatus, jqXHR) {
	console.log("res acts all")
	console.log(data);
        activities = JSON.stringify(data.activies);
        data.activies.forEach(el => {activitySuccess(el);});
}

function activitiesAllError(jqXHR, textStatus, errorThrown) {
	console.log("all error");
}

function activitySuccess(activity) {
    	//console.log(data);
//	for (var activity of data.activities) {
	var lengthSeconds=activity.duration/1000;
        var hours = Math.floor(lengthSeconds/3600);
        var minutes = Math.floor((lengthSeconds%3600)/60);
        var seconds = Math.floor((lengthSeconds%3600)%60);

	if(activity.activityType == "walking"){
            calories = 0.04 * lengthSeconds; //0.04 calories per second found online
        } else if(activity.activityType == "running"){
            calories = 0.12 * lengthSeconds; //Found online
        } else if(activity.activityType == "biking"){
            calories = 0.135 * lengthSeconds; //Found online
        }

	var card = "<ul class=\"collection with-header\" id=\"devices\">" 
            + "<li class=\"collection-header\">"
            + "<h5>Activity: <span class=\"card-title\">" + activity.activityType + "</span></h5>"
            + "</li>"
            + "<li class=\"collection-header\">"
            + "<h5>Activity Duration: " + hours.pad(2) + ":" + minutes.pad(2) + ":" + seconds.pad(2) + "</h5>"
	    + "</li>"
            + "<li class=\"collection-header\">" 
            + "<h5>Total Calories Burned:" + calories + "</h5>" 
            + "</li>"
            + "<li class=\"collection-header\">"
	    + "<h5>Total UV Exposure: " + "</h5>"
            + "</li>"
            + "<li class=\"collection-header\">" 
            + "<button class=\"btn btn-primary\"><a href=\"activity.html?id=" + activity.activityId + "\">Activity Details</a></button>"
            + "</li>"
            + "</ul>";

        $("#listActivities").append(card);

    //}
}

function activityError(jqXHR, textStatus, errorThrown) {
	if( jqXHR.status === 401 ) {

  }
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  }
}

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  $("#thresholdVal").html(data.threshold);
  $("#main").show();
console.log(data);
  
  // Add the devices to the list before the list item for the add device button (link)
  for (var device of data.userDevices) {
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      device.deviceId + ", APIKEY: " + device.apikey);
  }
  sendReqAllActs(device.deviceId);
}

function accountInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  } 
}

// Registers the specified device with the server.
function registerDevice() {
console.log($("#deviceId").val());
	if ($("#deviceId").val() == ""){
		$("#error").html("Error: Device ID Missing");
       		$("#error").show();
		return;
	}

  $.ajax({
    url: '/devices/register',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify({ deviceId: $("#deviceId").val() }), 
    dataType: 'json'
   })
     .done(function (data, textStatus, jqXHR) {
       // Add new device to the device list
       $("#addDeviceForm").before("<li class='collection-item'>ID: " +
       $("#deviceId").val() + ", APIKEY: " + data["apikey"]);
	hideAddDeviceForm();
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 
}

function pingDevice(event, deviceId) {
   $.ajax({
        url: '/devices/ping',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Pinged.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}


function deleteDevice() {
console.log($("#delDeviceId").val());
   $.ajax({
        type: "DELETE",
        url: "devices/" + $("#delDeviceId").val(),
	headers: { 'x-auth': window.localStorage.getItem("authToken") }, 
    	success: function (data, textStatus, jqXHR) {
            console.log("Deleted.");
		hideAddDeviceForm();
		location.reload();
        },
	error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });    
}

function details(event, deviceId) {
   $.ajax({
        type: "GET",
        url: "/devices/recent/" + deviceId
    }).done(function(data) {
        // Successfully deleted song
     	console.log(data)
    }).fail(function(jqXHR) {
        $("#error").html("The song could not be deleted.");
    });    
}


// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();  // Hide the add device link
  $("#addDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function showDelDeviceForm() {
  $("#delDevice").val("");        // Clear the input for the device ID
  $("#delDeviceControl").hide();   // Hide the add device link
  $("#delDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideDelDeviceForm() {
  $("#delDeviceControl").show();  // Hide the add device link
  $("#delDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}


function updateThreshold() {
  $.ajax({
        url: '/users/threshold',
        type: 'PUT',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { threshold: $("#uvSetting").val() }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            $("#thresholdVal").html($("#uvSetting").val()); 
            console.log("Success");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });}


// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendReqForAccountInfo();
    //sendReqForActivityInfo();
    //addData();
  }

hideAddDeviceForm();
  hideDelDeviceForm();
  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#delDevice").click(showDelDeviceForm);
  $("#registerDevice").click(registerDevice); 
    $("#deleteDevice").click(deleteDevice);
 
  $("#cancel").click(hideAddDeviceForm); 
$("#cancelDel").click(hideDelDeviceForm);
  $("#uvInput").click(updateThreshold); 
});

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
