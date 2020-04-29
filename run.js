const express = require('express');
const app = express();
var path = require('path');
const ngrok = require('ngrok');
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended : true}));
var fs = require('fs');
var opn = require('opn');
var j = {};

async function runngrok ()
{const ngrokurl= await ngrok.connect(80);
console.log(ngrokurl);

var os = require('os');
var ifaces = os.networkInterfaces();
var thepath;
var myip;
var thefile;
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      //console.log(ifname + ':' + alias, iface.address);
	myip=iface.address;
	
    } else {
      // this interface has only one ipv4 adress
      //console.log(ifname, iface.address);
	myip=iface.address;
    }
    ++alias;
  });
});
console.log(myip);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.post('/send.html',(req, res) => {
console.log("post:"+req.body.fname);
var i;
var k
for ( i=0;i< req.body.fname.length; i++) {
  if (req.body.fname[i]==='\\'){k=i}
}
thefile =req.body.fname.slice(k+1)
thepath = req.body.fname
res.redirect('/send.html');
j[thefile]=thepath;
});



app.get('/favicon.ico',(req, res) => {res.end();
console.log(":"+"favicon.ico");
});

app.get('/download/:file(*)',(req, res) => {
var file = j[req.params.file];
console.log(":"+fileLocation);
var k
for ( i=0;i< file.length; i++) {
  if (file[i]==='\\'){k=i;}
}
var y =file.slice(k+1)

var fileLocation = path.join(file);
console.log(":"+fileLocation);

/*
If you wish to use pipes to transfer very big files at constant speed using pipes reliably
then uncomment the lines below and comment the line "res.download(fileLocation,y);" immediately after this.

var speed = = {highWaterMark: Math.pow(2,23)}; //this is for 1 MegaBytes per second.
var stream = fs.createReadStream(fileLocation,speed);
res.attachment(y);
stream.pipe(res);
*/


res.download(fileLocation,y);
});






app.get('/:file(*)',(req, res) => {
var file = req.params.file;
var ip =req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
console.log(ip);
if(ip==="::1"||ip==="127.0.0.1"||ip==="::ffff:127.0.0.1")
	{if (file === "") {file= "index.html"}
	var fileLocation = path.join(__dirname,'/',file);
	console.log(file);
	res.render(fileLocation,{ngrokurl:ngrokurl,j:j});}
else
{res.end("for security reasons this page can only be accessed locally.\n\nIf this is the machine hosting the server try using \"localhost\" or \"127.0.0.1\".");}
	

});


app.listen(80);
opn("localhost", {app: 'chrome'});
}
runngrok();
