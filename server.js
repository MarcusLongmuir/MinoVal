var logger = require('tracer').console();
var express = require('express');
var connect = require('connect');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var MinoDB = require('minodb');
var mino = new MinoDB({
    api: true,
    ui: true,
    db_address: 'mongodb://127.0.0.1:27017/minodb'
})

var server = express();
server.set('port', process.env.PORT || 5002);
server.set('views', path.join(__dirname, 'views'));
server.use(express.static(path.join(__dirname, './bower_components')));;
server.use(express.errorHandler());
server.use(bodyParser());3
server.engine('mustache', mustacheExpress());
server.set('view engine', 'mustache');

server.use('/api/', mino.api_server())
server.use('/ui/', mino.ui_server())

var MinoVal = require('./MinoVal');
var minoval = new MinoVal(mino);

server.use('/minoval/', minoval.endpoint_server());
server.use('/minoval/', minoval.example_server());


mino.api.connect(function(){
});

http.createServer(server).listen(server.get('port'), function() {
    console.log('Server started on port ' + server.get('port'));
});