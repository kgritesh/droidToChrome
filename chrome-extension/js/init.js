var port_number = 3000;
var ipaddress = "http://localhost:"  + port_number ;

$(document).ready(function(){
  if(localStorage.getItem('first_run')){
    initsockets();
    return;
  }
  localStorage.setItem('first_run', 'true');
  chrome.tabs.create({url: "options.html"});
});