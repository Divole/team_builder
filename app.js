//require('newrelic');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var http_logic = require('./http_logic');
var websocket_logic = require('./websocket_logic');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/test/login', http_logic.login);

app.post('/test/assignments', http_logic.assignments);

app.post('/test/teams', http_logic.teams);

app.post('/test/create_team', http_logic.create_team);


io.on('connection', websocket_logic.connection);


http.listen(80, function() {
    console.log('listening on *:80');
});