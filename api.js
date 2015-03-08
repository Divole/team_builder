var db = require('./db');

module.exports = {
    login: function(user, callback) {
        db.student_info(user.user, user.pass, function(data) {
            callback(data);                     
        });
    },
    get_assignments: function(course, callback){
        db.get_assignments(course.course_id, course.group_id, function(course_assignments){            
            callback(course_assignments);
        });
    },
    get_teams: function(assignment, callback){
        db.get_teams(assignment.assignment_id, assignment.course_id, assignment.group_id, function(result){
            callback(result);
        });
    },
    create_team: function(team, callback){
        db.create_team(team, function(response){
            callback(response);  
        });
    }

}