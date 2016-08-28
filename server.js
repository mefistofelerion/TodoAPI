var express = require('express');
var bodyParser = require('body-parser');
var app = express();
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

app.post('/todos', function(req, res){
	var body = req.body;

	if(typeof body !== 'undefined'){
		body.id = todoNextId++;
		todos.push(body);
		res.json('Todo task added');
	}else{
		res.send('empty json sent, nothing was saved');
	}
	
});

app.listen	(PORT, function(){
	console.log('Server started on port ' + PORT);
});