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
{
const ngrokurl= await ngrok.connect(80);
console.log("ngrok url : "+ngrokurl);

var thepath,thefile;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



app.post('/send.html',(req, res) => {

console.log("link generation request for "+req.body.fname);
var i;
var k
for ( i=0;i< req.body.fname.length; i++) {
  if (req.body.fname[i]==='\\'){k=i}
}
thefile =req.body.fname.slice(k+1)
thepath = req.body.fname
res.redirect('/send.html');
try{
if(fs.existsSync(thepath)){
j[thefile]=thepath;}
else{j[thefile]="Doesn't exist";}
}
catch(err){console.log(err);}
});




app.get('/favicon.ico',(req, res) => {res.end();});




app.get('/download/:file(*)',(req, res) => {
var fileLocation = j[req.params.file];
var ip =req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
console.log("request to download "+req.params.file+" from "+ip);



/*
If you wish to use pipes to transfer very big files at constant speed using pipes reliably
then uncomment the lines below and comment the line "res.download(fileLocation,y);" immediately after this.

var speed = = {highWaterMark: Math.pow(2,23)}; //this is for 1 MegaBytes per second.
var stream = fs.createReadStream(fileLocation,speed);
res.attachment(y);
stream.pipe(res);
*/


res.download(fileLocation,req.params.file);
});






app.get('/:file(*)',(req, res) => {
var file = req.params.file;
var ip =req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);

if(ip==="::1"||ip==="127.0.0.1"||ip==="::ffff:127.0.0.1")
	{if (file === "") {file= "index.html"}
	var fileLocation = path.join(__dirname,'/',file);
	
	res.render(fileLocation,{ngrokurl:ngrokurl,j:j});
for (var key in j) {
  if (j[key]==="Doesn't exist") {delete j[key];}

}}
else
{res.end("for security reasons this page can only be accessed locally.\n\nIf this is the machine hosting the server try using \"localhost\" or \"127.0.0.1\".");}

console.log("request for "+file+" from "+ip);
}
);


app.listen(80);

opn("localhost", {app: 'chrome'});
}
runngrok();
