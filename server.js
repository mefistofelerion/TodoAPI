var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Do iOS course',
	completed: false
	},
	{
	id: 2,
	description: 'Complete Angular course!',
	completed: false
	},
	{
		id: 3,
		description: 'Complete everything',
		completed: true
	}
];

app.get('/', function(req, res){
	res.send('Todo API root');
});

app.get('/todos', function(req, res){
	console.log('getting all todos');
	res.json(todos);
});

app.get('/todo/:id', function(req, res){
	var todoFetched;
	if(typeof todos !== 'undefined' && todos.length > 0){
		todos.forEach(function(todo){
			var paramId = parseInt(req.params.id, 10);
			if(todo.id == paramId){
				todoFetched = todo;
			}
		});
		if(typeof todoFetched !== 'undefined'){
			res.json(todoFetched);	
		}
		else{
			res.send('todo was not found with the given ID');
		}
	}
});

app.listen	(PORT, function(){
	console.log('Server started on port ' + PORT);
})