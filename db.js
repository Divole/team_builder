
module.exports = {
  student_info: get_student_info,
  get_assignments: get_assignments,
  get_teams: get_teams,
  create_team: create_team
};


function getConn(callback){
  var rethinkdb = require('rethinkdb');
  rethinkdb.connect({ host: 'localhost', port: 28015, db: 'team_builder' }, 
    function(err, conn) {
    if(err) throw err;
    callback(conn);
  });
}

function get_teams(assignment_id, course_id, group_id, callback){

  getConn(function(conn){
    var rethinkdb = require('rethinkdb');

    rethinkdb.db('team_builder').table('course_log')
    .filter({course_id: course_id})
    .filter({group_id: group_id})
    .merge(function (course_log){
      return {
        assignment_teams:rethinkdb.db('team_builder').table('assignment_log')
        .getAll(course_log('id'), {index: 'course_log_id'})
        .filter({asignment_id: assignment_id})
        .pluck('id','asignment_id')
        .merge(function (assignment){
          return {
          teams:rethinkdb.db('team_builder').table('teams')
          .getAll(assignment('id'), {index: 'assignment_log_id'})
          .coerceTo('array')}
      })
        .coerceTo('array')}
    })
    .pluck('assignment_teams')
    .run(conn, function(err2, cursor){
      cursor.toArray(function(err, results) {
        if (err) throw err;

        cursor.close();
        conn.close();

        if(typeof results != "undefined") {

          var obj = results[0].assignment_teams[0];
          callback(obj);
        }
      });      
    });
  });
}



function get_assignments( course_id, group_id, callback){
  getConn(function(conn){

    var rethinkdb = require('rethinkdb');

      rethinkdb.db('team_builder').table('course_log').filter({course_id: course_id}).pluck('id')
      .merge(function (course_rec){
        return {
          assignments: rethinkdb.db('team_builder').table('assignment_log')
          .getAll( course_rec('id'), {index: 'course_log_id'})
          .pluck('asignment_id','start_time', 'deadline')
          .eqJoin('asignment_id', rethinkdb.db('team_builder').table('assignments'))
          .zip()
          .without('id')
          .coerceTo('array')
        }
      })
      .without('id')
      .run(conn, function(err2, cursor){

      cursor.toArray(function(err, results) {
        if (err) throw err;
        cursor.close();
        conn.close();
        callback(results[0]);
      });
    });
  })
}


function get_student_info(user_name, pass, callback){

  getConn(function(conn){

    var rethinkdb = require('rethinkdb');
      
    rethinkdb.db('team_builder').table('students').filter({id: user_name, pass: pass})
    .without('pass')
    .eqJoin('group_id', rethinkdb.db('team_builder').table('groups'))
    .without({'right': {'id': true}})
    .without({'right': {'description': true}})
    .zip()
    .eqJoin('school_id', rethinkdb.db('team_builder').table('universities'))
    .without({'right': {'id': true}})
    .without({'right': {'logo_url': true}})
    .zip()  
    .merge(function (stud){
      return {
        courses:rethinkdb.db('team_builder').table('course_log').getAll(stud('group_id'), {index: 'group_id'})
        .eqJoin('course_id', rethinkdb.db('team_builder').table('courses'))
        .without({'left': {'id': true}})
        .without({'left': {'group_id': true}})
        .without({'right': {'id': true}})
        .without({'right': {'description': true}})
        .zip()
        .coerceTo('array')}
    })
    .without('school_id')
    .run(conn, function(err1, cursor){
      cursor.toArray(function(err2, results) {
        cursor.close();
        conn.close();
        callback(results[0]);
      });
    });
  })
}




function create_team(team, callback){

  getConn(function(conn){

    var rethinkdb = require('rethinkdb');

    rethinkdb.db('team_builder').table("teams").insert(
      {
        lead_id: team.lead_id,
        assignment_log_id: team.assignment_log_id,
        project_name: team.project_name,
        description: team.description,
        members_num: 3,
        requirements: team.requirements,
        members: team.members

      }).run(conn, function(err){
        conn.close();
        if (err) {
          callback(err);
        }else{
          callback('completed');  
        }
        
      });
  });
}

function create_course(conn, course_id, course_name, description){
  rethinkdb.table("teams").insert(
    {
      id: course_id, 
      course_name: course_name,
      description: description    
    }).run(conn, function(){
      console.log('done');
    }
  )
}

function create_lecturer(conn, user_name, pass,first_name, last_name, school_id){
  rethinkdb.table("lecturers").insert(
    {
      id: user_name, 
      pass: pass,
      first_name: first_name,
      last_name: last_name, 
      school_id: school_id
    }).run(conn, function(){
      console.log('done');
    }
  )
}

function create_student(conn, user_name, pass,first_name, last_name, school_id, group_id){
  rethinkdb.table("students").insert(
    {
      id: user_name, 
      pass: pass,
      first_name: first_name,
      last_name: last_name, 
      school_id: school_id, 
      group_id: group_id

    }).run(conn, function(){
      console.log('done');
    }
  )
}

function create_university(conn, school_id, full_name, logo_url){
  rethinkdb.table("universities").insert(
    {
      id: school_id, 
      full_name: full_name,
      logo_url: logo_url
    }).run(conn, function(){
      console.log('done');
    }
  )
}

function create_assignment(conn, assignment_id, full_name, description){
  rethinkdb.table("assignments").insert(
    {
      id: assignment_id, 
      full_name: full_name,
      description: description
    }).run(conn, function(){
      console.log('done');
    }
  )
}

function create_group(conn,group_id, school_id, group_name, description){
  rethinkdb.table("groups").insert(
    {
      id: group_id, 
      school_id: school_id,
      group_name: group_name,
      description:description
    }).run(conn, function(){
      console.log('done');
    }
  )
}


function create_assignment_log_record(conn, record_id, asignment_id, group_id, deadline){
  rethinkdb.table("assignment_log").insert(
    {
      id: record_id, 
      asignment_id: asignment_id,
      group_id:group_id,
      start_time: rethinkdb.now(),
      deadline: deadline
    }).run(conn, function(){
      console.log('done');
    }
  )
}

function populate_students_table(conn){
  var names = ['dovil','ram', 'doma', 'manu', 'bubu', 'gugu', 'lalami', 'nanami', 'lala', 'mam', 'lala'];
  var passes = ['eiyiu', 'weer','wwwrxc','yiiyi','wedddd','uyuim', 'uikjk', 'uidsf','hkhfdskh','weer', 'dududi'];
  var i = 0;
  while(i < names.length){
    rethinkdb.table("students").insert(
      {id: names[i], pass: passes[i], school_id: 'KEA', group_id: 'KEA_01_ABC'}
      ).run(conn, function(){
        console.log('done');
      })
    i++;
  }
}

function close_conection(conn){
  conn.close();
}
