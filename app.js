var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db.js');
var cons = require('consolidate');

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {

    console.log('user connected');
    socket.on('user login', function(user) {
        setTimeout(function () {
        db.student_info(user.user, user.pass, function(data) {
            if (typeof data == 'undefined') {
                socket.emit('user logged in');
            } else {
                socket.emit('user logged in', data); 
            }            
        });
        }, 2000);
       
    });

    socket.on('require course assignments', function(course){
    	db.get_assignments(course.course_id, course.group_id, function(course_assignments){ 
            // console.log('ASSIGNMENT Arrived: ');
            // console.log(course_assignments);
            
           socket.emit('course assignments', course_assignments);
    	});
    });


    socket.on('require teams', function(assignment){
        db.get_teams(assignment.assignment_id, assignment.course_id, assignment.group_id, function(result){
            socket.emit('teams for assignment', {teams: result.teams, assignment_id: result.asignment_id, assignment_log_id:result.id});
        });
    });


    socket.on('create team', function(team){
        // console.log(team);
        db.create_team(team, function(response){
            if (response === 'completed') {
                socket.emit('create team response', {response: response});
            };   
        });
    });
});

http.listen(80, function() {
    console.log('listening on *:80');
});