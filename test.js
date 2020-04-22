var express = require('express');
var fs = require('fs');
var morgan = require('morgan');

//Define the app
var app = express();

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// Constants
var PORT = 3000;

//Use static middleware to serve static content - using absolute paths here (you may want something different)
app.use('/assets', express.static('/assets'));


// Video Server test page
app.get('/', function (req, res) {
    console.log("In Get!!!");
    res.send('Hello world from Video server\n');
});

//Start web server
var server = app.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
