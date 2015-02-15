var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	// console.log('new user');
	
	socket.on('user_connected', function(user){
		// console.log(user);
		socket.broadcast.emit('new user', user);
	});
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
	socket.on('disconnect', function(){
    	socket.broadcast.emit('disconnected');
	});
});


http.listen(3000, function(){
 	console.log('listening on *:3000');
});