var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();


var mySqlClient = mysql.createConnection({
  host: 'dbteam.cgkc5bv4txxd.us-east-1.rds.amazonaws.com',
  user : 'root',
  password: '12121212',
  database: 'dbTeam'
});


app.listen(3300, function (){
    console.log('Example app listening on port 3300!');
}); 


mySqlClient.connect(function (err){
    if(err){
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('Success DB connection');
});

//----------------------------------------------------- 관리자 페이지 시작
// 관리자 ID, PW를 통한 로그인 구현하기


app.get( '/', function(req, res){
	fs.readFile('admin.html', 'utf8', function(error, data){
		if (error) {
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});
app.get('/admin', function(req, res){
	fs.readFile('admin.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

// -------------------------------------------------- 직원 관리 시작
// 직원 수정 기능 추가

app.get( '/emp_list', function(req, res){
	
	fs.readFile('emp_list.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			mySqlClient.query('select * from employee', function(error, results){
				if(error){
					console.log('error : ', error.message);
				}else{
					res.send( ejs.render(data, {
						prodList : results
					}));
				}
			});
			// mySqlClient.query('select * from work', function(error, results){
			// 	if(error){
			// 		console.log('error : ', error.message);
			// 	}else{
			// 		res.send( ejs.render(data, {
			// 			prodList : results
			// 		}));
			// 	}
			// });
		}
	})
});



app.get('/emp_list/delete/:emp_id', function(req, res){
	mySqlClient.query('delete from employee where emp_id = ?', [req.params.emp_id], 
			function(error, result){
				if(error){
					console.log('delete Error');
				}else{
					console.log('delete emp_id = %s', req.params.emp_id);
					res.redirect('/');				
				}
			});
});  // mov_list에 값이 하나라도 있으면 emp delete error 발생 

app.get('/emp_insert', function(req, res){
	fs.readFile('emp_insert.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});


 app.get( '/emp_edit/:emp_id', function(req, res){
 	fs.readFile( 'emp_edit.html', 'utf8', function(error, data){
 		mySqlClient.query('select * from employee where emp_id = ?', [req.params.emp_id], 
 				function(error, result){
 					if(error){
 						console.log('readFile Error');
 					}else{
 						res.send( ejs.render(data, { 
 							employee : result[0] 
 						}));
 					}
 				});
 	});
 });

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/emp_insert', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'insert into employee(emp_id, emp_name,emp_eng_name, start_date, dept, rank, salary) values(?, ?, ?, ?, ?, ?, ?)',
			[ body.emp_id, body.emp_name, body.emp_eng_name, body.start_date ,body.dept ,body.rank, body.salary ], 
			function(error, result){
				if(error){
					console.log('insert error : ', error.message );
				}else{
					res.redirect('/');
				}
	});
	// mySqlClient.query( 'insert into work(emp_id, go_work,off_work,work,work_day) values( ?, ?, ?, ?, ?)',
	// 		[ body.emp_id, body.go_work, body.off_work, body.work ,body.work_day ], 
	// 		function(error, result){
	// 			if(error){
	// 				console.log('insert error : ', error.message );
	// 			}else{
	// 				res.redirect('/');
	// 			}
	// });
});

app.post( '/emp_edit/:emp_id', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'update employee set emp_id=?, emp_name=?, emp_eng_name=?,start_date=?, dept=?, rank=?, salary=? where emp_id =?',
			[ body.emp_id, body.emp_name, body.emp_eng_name, body.start_date ,body.dept ,body.rank, body.salary, body.emp_id ], 
			function(error, result){
				if(error){
					console.log('update error : ', error.message );
				}else{
					res.redirect('/');
				}
	});
});

// ------------------------------------------------  영화 정보 관리 시작
// movie edit 구현
// emp delete 주석 처리 안하면 movie delete 작동 x

app.get( '/mov_list', function(req, res){
	
	fs.readFile('mov_list.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			mySqlClient.query('select * from movie', function(error, results){
				if(error){
					console.log('error : ', error.message);
				}else{
					res.send( ejs.render(data, {
						prodList : results
					}));
				}
			});
		}
	})
});

app.get('/mov_list/delete/:mov_id', function(req, res){
	mySqlClient.query('delete from movie where mov_id = ?', [req.params.mov_id], 
			function(error, result){
				if(error){
					console.log('delete Error');
				}else{
					console.log('delete mov_id = %s', req.params.mov_id);
					res.redirect('/');				
				}
			});
});


app.get('/mov_insert', function(req, res){
	fs.readFile('mov_insert.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/mov_insert', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'insert into movie(mov_id, mov_name, open_date, genre, grade, director, actor) values(?, ?, ?, ?, ?, ?, ?)',
			[ body.mov_id, body.mov_name, body.open_date, body.genre, body.grade, body.director, body.actor], 
			function(error, result){
				if(error){
					console.log('insert error : ', error.message );
				}else{
					res.redirect('/');
				}
	});
});

 app.get( '/mov_edit/:mov_id', function(req, res){
 	fs.readFile( 'mov_edit.html', 'utf8', function(error, data){
 		mySqlClient.query('select * from movie where mov_id = ?', [req.params.mov_id], 
 				function(error, result){
 					if(error){
 						console.log('readFile Error');
 					}else{
 						res.send( ejs.render(data, { 
 							movie : result[0] 
 						}));
 					}
 				});
 	});
 });

app.post( '/mov_edit/:mov_id', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'update movie set mov_id=?, mov_name=?, open_date=?, genre=?, grade=?, director=?, actor=? where mov_id =?',
			[ body.mov_id, body.mov_name, body.open_date, body.genre ,body.grade ,body.director, body.actor, body.mov_id ], 
			function(error, result){
				if(error){
					console.log('update error : ', error.message );
				}else{
					res.redirect('/');
				}
	});
});
// ------------------------------------------------- 비품 관리 시작 

app.get( '/sup_list', function(req, res){
	
	fs.readFile('sup_list.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			mySqlClient.query('select * from supplies', function(error, results){
				if(error){
					console.log('error : ', error.message);
				}else{
					res.send( ejs.render(data, {
						prodList : results
					}));
				}
			});
		}
	})
});

app.get('/sup_list/delete/:sup_id', function(req, res){
	mySqlClient.query('delete from supplies where sup_id = ?', [req.params.sup_id], 
			function(error, result){
				if(error){
					console.log('delete Error');
				}else{
					console.log('delete sup_id = %s', req.params.sup_id);
					res.redirect('/');				
				}
			});
});


app.get('/sup_insert', function(req, res){
	fs.readFile('sup_insert.html', 'utf8', function(error, data){
		if(error){
			console.log('readFile Error');
		}else{
			res.send(data);
		}
	})
});

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.post( '/sup_insert', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'insert into supplies(sup_id, ci_id, sub_name, size, total, price, sup_in) values(?, ?, ?, ?, ?, ?, ?)',
			[ body.sup_id, body.ci_id, body.sub_name, body.size, body.total, body.price, body.sup_in], 
			function(error, result){
				if(error){
					console.log('insert error : ', error.message );
				}else{
					res.redirect('/');
				}
	});
});

app.get( '/sup_edit/:sup_id', function(req, res){
 	fs.readFile( 'sup_edit.html', 'utf8', function(error, data){
 		mySqlClient.query('select * from supplies where sup_id = ?', [req.params.sup_id], 
 				function(error, result){
 					if(error){
 						console.log('readFile Error');
 					}else{
 						res.send( ejs.render(data, { 
 							supplies : result[0] 
 						}));
 					}
 				});
 	});
 });

app.post( '/sup_edit/:sup_id', function(req, res){
	var body = req.body;
	
	mySqlClient.query( 'update supplies set sup_id=?, ci_id=?, sup_name=?, size=?, total=?, price=?, sup_in=? where sup_id =?',
			[ body.sup_id, body.ci_id, body.sup_name, body.size ,body.total, body.price, body.sup_in, body.sup_id ], 
			function(error, result){
				if(error){
					console.log('update error : ', error.message );
				}else{
					res.redirect('/');
				}
	});
});