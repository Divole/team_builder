module.exports = {
    connection: connection
}
var API = require('./api');

function connection(socket) {
    socket.on('user login', function (user){
        API.login(user, function(data){
            if (typeof data == 'undefined') {
                socket.emit('user logged in');
            } else {
                socket.emit('user logged in', data); 
            }
        });           
    });

    socket.on('require course assignments', function(course){
        API.get_assignments(course, function(data){
            socket.emit('course assignments', data);
        });
    });


    socket.on('require teams', function(assignment){
        API.get_teams(assignment, function(data){
            socket.emit('teams for assignment', {teams: data.teams, assignment_id: data.asignment_id, assignment_log_id:data.id});
        });
    });


    socket.on('create team', function(team){
        API.create_team(team, function(data){
            if (response === 'completed') {
                socket.emit('create team response', {response: data});
            };
        });
    });
}