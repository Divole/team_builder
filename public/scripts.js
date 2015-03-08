var socket = io();
/*
full_name: 	"KEA Copengagen School of Design and Technology"
group_id: 	"KEA_01_ABC"
group_name: "Software Development BA"
id: 		"lala"
courses: 	[{
	course_id: 		"KEA_002a"
	course_name: 	"Testing"
	end_date: 		null
	start_date: 	null
}]
*/
var user_info = null;
/*
{
	course_id: 		"KEA_002a"
	course_name: 	"Testing"
	end_date: 		null
	start_date: 	null,
	assignments: [{
		asignment_id: 	"KEA_00002"
		deadline: 		"2015-03-18T00:00:00.000Z"
		description: 	"Create a simple aplication and write performance tests for it."
		full_name: 		"Performance Testing"
		start_time: 	"2015-03-1
	}]
}
*/
var selected_course_info = null;
/*
{
	asignment_id: 	"KEA_00002"
	deadline: 		"2015-03-18T00:00:00.000Z"
	description: 	"Create a simple aplication and write performance tests for it."
	full_name: 		"Performance Testing"
	start_time: 	"2015-03-1
}
*/
var selected_assignment_info = null;

var selected_assignment_log_id = null;
var selected_course_log_id = null;

$('#user_form').submit(function() {
    socket.emit('user login', {
        'user': $('#user_name').val(),
        'pass': $('#pass').val()
    });

    return false;
});


socket.on('user logged in', function(userData) {
	if (userData) {
    	user_info = userData;
    	$.get('templates/display_group_view.html', function(template) {
    		new EJS({text: template}).update('main_div',user_info);
	   	});
		
	}else{
		alert('User name or password might be incorrect. Please try aggain.');
		$('#user_name').val('');
    	$('#pass').val('');
	};
})


socket.on('teams for assignment', function(team_response){
	// console.log('TEAMS: \n', team_response);
	display_assignment_teams(team_response);	
})


socket.on('course assignments', function(course_assignments) {

	selected_course_info.assignments = course_assignments.assignments;

	$.get('templates/display_course_assignments.html', function(template) {
		new EJS({text: template}).update('main_container', selected_course_info);
    });     
});

socket.on('create team response', function(response){
	if(response.response === 'completed'){
		get_teams(selected_assignment_info.assignment_id);
		$('#top_body_layer').css('display', 'none');
	}
});





function get_course_assignments(course_id) {

	for(var i = 0; i<user_info.courses.length; i++){
		if(user_info.courses[i].course_id === course_id){
			selected_course_info = user_info.courses[i];
			break;
		}
	}
    socket.emit('require course assignments', {
        'course_id': course_id,
        'group_id': user_info.group_id
    });
}



function get_teams(assignment_id){
	
	var course_id = selected_course_info.course_id;
	var group_id = user_info.group_id;
	set_selected_assignment_data(assignment_id, selected_course_info.assignments);
	socket.emit('require teams', {
        'assignment_id': assignment_id,
        'course_id': course_id,
        'group_id': group_id
    });    
}



function create_new_team(assignment_log_id){

	var project_name = $('#ct_project_name').val();
	var description = $('#ct_description').val();
	var requirements = $('#ct_requirements').val();
	var lead_id = user_info.id;
	var members = [];
	var obj = {
		'assignment_log_id': selected_assignment_log_id,
		'description': description,
		'lead_id': lead_id,
		'members': members,
		'project_name':project_name,
		'requirements':requirements,
		'assignment_log_id':assignment_log_id
	}
	socket.emit('create team', obj);
}



function display_team_view(assignment_log_id){
	var data = user_info;
	data.assignment_log_id = assignment_log_id;
	$.get('templates/create_team_view.html', function(template) {
		new EJS({text: template}).update('pop_up_container', data);
	});
    $('#top_body_layer').css('display', 'block');
}



function display_assignment_teams(response){
	var data = JSON.parse(JSON.stringify(selected_course_info));

	for( var i= 0; i < data.assignments.length; i++){
		if (data.assignments[i].assignment_id !== response.assignment_id) {
			data.assignments.splice(i,1);
		}
	}
	data.assignment = data.assignments[0];
	delete data.assignments;

	data.student_id = user_info.id;

	var teams = response.teams;
	for(var i = 0; i < teams.length; i++){
		if(teams[i].lead_id === data.student_id || teams[i].members.indexOf(data.student_id) !== -1){
			data.my_team = teams[i];
			teams.splice(i,1);
			break;
		}
	}

	data.other_teams = teams;
	data.group_name = user_info.group_name;
	data.assignment_log_id = response.assignment_log_id;

	$.get('templates/display_assignment_teams.html', function(template) {
		new EJS({text: template}).update('main_container', data);
	});

}


function set_selected_assignment_data(assignment_id, assignments_array){

	for(var i = 0; i < assignments_array.length; i++){
		if(assignments_array[i].asignment_id == assignment_id){
			selected_assignment_info = assignments_array[i];
			break;
		}
	}
}