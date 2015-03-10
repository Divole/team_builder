module.exports = {
  student_info: get_student_info,
  get_assignments: get_assignments,
  get_teams: get_teams,
  create_team: create_team
};

var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 80,
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database:'team_builder'
});


function getConn(callback){
  pool.getConnection(function(err, connection) {
    callback(connection);
  });
}

function get_teams(assignment_id, course_id, group_id, callback){

  getConn(function(conn){

    var query = [
      'SELECT * FROM course_log cl',
      'LEFT JOIN assignment_log al ON cl.id=al.course_log_id',
      'LEFT JOIN teams t ON al.id=t.assignment_log_id',
      'WHERE cl.course_id=? AND cl.group_id=? AND al.assignment_id=?'].join(' ');

    conn.query(query, [course_id, group_id, assignment_id], function(err, rows, fields) {
      if (err) throw err;

      conn.release();
      callback(rows);
    });
  });
}



function get_assignments( course_id, callback){
  getConn(function(conn){

    var query = [
      'SELECT al.assignment_id, a.full_name, a.description FROM course_log cl',
      'LEFT JOIN assignment_log al ON cl.id=al.course_log_id',
      'INNER JOIN assignments a ON al.assignment_id=a.id WHERE course_id=?'
    ].join(' ');

      conn.query(query, [course_id], function(err, rows, fields) {
        if (err) throw err;

        conn.release();
        callback(rows);
      });
  });
}


function get_student_info(user_name, pass, callback){

  getConn(function(conn){

    var query = [
        'SELECT s.id, g.group_name, u.full_name FROM students s',
        'INNER JOIN groups g ON g.id=s.group_id',
        'INNER JOIN universities u ON u.id=s.school_id',
        'WHERE s.id=? AND s.pass=?'
    ].join(' ');

    conn.query(query, [user_name, pass], function(err, rows, fields) {
      if (err) throw err;

      conn.release();
      callback(rows[0]);
    });
  })
}

function create_team(team, callback){

  getConn(function(conn){

    var obj = {
        id: team.id,
        lead_id: team.lead_id,
        assignment_log_id: team.assignment_log_id,
        project_name: team.project_name,
        description: team.description,
        requirements: team.requirements
      };
      conn.query('INSERT INTO teams SET ?', obj, function(err, res) {
        conn.release();
        if (err) throw err;
        callback('completed');
      });
  });
}
