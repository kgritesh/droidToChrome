var ipaddress = "http://192.168.43.248:3000";
function run(){
  var bkg = chrome.extension.getBackgroundPage();
  try
    {
      var uuid = window.localStorage.getItem('uuid');
      if(uuid!=null){
	bkg.console.log(uuid);
	var socket = io.connect(ipaddress,
			       {'reconnect': true,
				'reconnection delay': 500,
				'max reconnection attempts': 10,
				port: 8080 });
	socket.emit('auth', {"uuid":uuid});
	socket.on('urls', function (data) {
	  console.log(data);
	  chrome.tabs.create({'url': data.url},function(tab) {});
	});
     }
  }
  catch(e){
    bkg.console.log(e);
  }
}

