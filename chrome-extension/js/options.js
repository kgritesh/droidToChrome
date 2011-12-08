$(document).ready(function(){

  try
  {
    var uuid = window.localStorage.getItem('uuid');
    console.log(uuid);
    if(uuid===null)
    {
      document.location="login.html";
    }
    else
    {
      $('#logout_div').removeClass("hidden");
    }
  }
  catch(e)
  {
      $('#logout_div').removeClass("hidden");
      $('#logout_div').addClass("hidden");
      console.log("Catch " + e);
  }

  $("#login_button").click(function(){
    document.location="login.html";
  });

  $("#logout_button").click(function(){
      window.localStorage.removeItem('uuid');
      document.location="login.html";
  });


});