var socket = io();

socket.on('new user', function(user){
	$('#connected').append($('<li>').text(user.user + ' has connected...'));
});

socket.on('disconnected', function(){
	$('#connected').append($('<li>').text('user disconnected'));

});
$('#user_form').submit(function(){
	socket.emit('user_connected', {'user': $('#name').val()});
	return false;
});

$('#msg_form').submit(function(){
	socket.emit('chat message', {'msg': $('#m').val()});
	$('#m').val('');
	return false;
});
	socket.on('chat message', function(msg){
	$('#messages').append($('<li>').text(msg.msg));
});