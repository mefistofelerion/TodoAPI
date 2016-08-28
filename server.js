var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var todos = [];

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.get('/', function(req, res){
	res.send('Todo API root');
});

app.get('/todos', function(req, res){
	console.log('getting all todos');
	res.json(todos);
});

app.get('/todo/:id', function(req, res){
	var paramId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos,{id: paramId});
	if(matchedTodo){
		res.json(matchedTodo);
	}else{
		res.status('404').send();
	}
});

app.post('/todos', function(req, res){
	var body = req.body;

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0	){
		return res.status('400').send();
	}

	var todo = _.pick(body, 'description', 'completed');

	if(typeof todo !== 'undefined'){
		todo.id = todoNextId++;
		todo.description = todo.description.trim();
		todos.push(todo);
		res.json('Todo task added');
	}else{
		res.status('400').send('empty json sent, nothing was saved');
	}
	
});

app.delete('/todo/:id', function(req,res){
	var paramId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos,{id: paramId});
	if(typeof matchedTodo !== 'undefined'){
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}else{
		console.log('no todo task was found');
		res.status('404').send();
	}
});

app.listen	(PORT, function(){
	console.log('Server started on port ' + PORT);
});