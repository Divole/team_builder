module.exports = {
    login: login,
    assignments: assignments,
    teams:teams,
    create_team: create_team
};

var API = require('./api');

function login(request, response) {
    var user = request.body;
    API.login(user, function(data){
        response.send(data);
    });
}

function assignments(request, response) {
    var course = request.body;
    API.get_assignments(course, function(data){
        response.send(data);
    });
}

function teams(request, response) {
    var assignment = request.body;
    API.get_teams(assignment, function(data){
        response.send(data);
    });
}

function create_team(request, response) {
    var team = request.body;
    API.create_team(team, function(data){
        response.send(data);
    });
}