$(function() {

   $('#editType').click(function() {
	$('#type').hide();
	$('#typeForm').show();
   });
   $('#typeUpdate').click(function() {
	if($('#typeSelector').val()){
		$.ajax({
			url: '/activity/type',
			type: 'PUT',
			headers: {'x-auth': window.localStorage.getItem("authToken")},
			data: JSON.stringify({activityType: $('#typeSelector').val()}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(jqXHR, textStatus, errorThrown) {
				$('#type').show();
				$('#typeForm').hide();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$("#error").html("Error: " + jqXHR.body.message);
				$("#error").show()
			}

		});
	}
   });

});

function activityInfoSuccess(data, textSatus, jqXHR) {
   var startTime= new Date(data.startTime);
   var endTime = new Date(data.endTime);
   $("#startTime").html(startTime.toLocaleString('en-us'));
   $("#endTime").html(endTime.toLocaleString('en-us'));
}

$(document).ready(function() {
    $("#typeForm").hide();

   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
   else {
      activityId = getUrlVars()["id"];
   $.ajax({
      url: '/activity/id/'+activityId,
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: activityInfoSuccess,
      error: activityInfoError
   });
   }
});