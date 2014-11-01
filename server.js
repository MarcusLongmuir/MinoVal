var logger = require('tracer').console();
var express = require('express');
var connect = require('connect');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

var MinoDB = require('minodb');
var db_address = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/minodb';
var minodb = new MinoDB({
    api: true,
    ui: true,
    db_address: db_address
})

var server = express();
server.set('port', process.env.PORT || 5002);
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade')
server.use(errorHandler());
server.use(bodyParser());

server.use('/mino/', minodb.server())

var MinoVal = require('./minoval');

var minoval = new MinoVal();
minodb.add_plugin(minoval);

server.get('/*', function(req, res) {
    res.send("MinoVal 404");
})

http.createServer(server).listen(server.get('port'), function() {
    console.log('Server started on port ' + server.get('port'));
});