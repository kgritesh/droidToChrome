$(document).ready(function(){
  $(".login_form").submit(function(){
    var username = $('#username').val();
    var password = $('#password').val();
    var device_name = $('#device_name').val();
    if(!username || !password || !device_name){
      show_status_message("Please fill all the required details");
      return false;
    }
    var address = ipaddress + "/login/extension/";
    console.log("reaching Here", ipaddress);
    $.ajax({
      type: "POST",
      url: address,
      data: $(this).serialize(),
      dataType: "json",
      error: function(jqXHR, textStatus, errorThrown){
	console.log(jqXHR.responseText);
	show_status_message("Error while sending request to the server: " + errorThrown);
      },
      success:function(response){
	if(response.success){
	  console.log("Response From the Server", JSON.stringify(response));
	  show_status_message("Login Successful. You can now close this tab")
	  setTimeout(function(){console.log("reaching Here");
				document.location="options.html"
			       },  2000);
	  localStorage.setItem('uuid', response.response.uuid);
	}
	else{
	  console.log("Response From the Server", JSON.stringify(response));
	  show_status_message("Login Unsuccessful: " + response.error);
	}
      }
    });
    return false;
  });

  function show_status_message(msg){
    $("#status_message").html(msg);
    console.log(msg);
    $("#status_message").attr("visibility", "visible");
  }
});