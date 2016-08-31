var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
var db = require('./db.js');
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var todos = [];

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API root');
});

app.get('/todos', function(req, res) {
	console.log('getting all todos');
	var query = req.query;

	var where = {};

	if(query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true;
	}else if(query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed = false;
	}

	if(query.hasOwnProperty('q') && query.q.length > 0){
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({where : where}).then(function(todos){
		res.json(todos);
	}, function(error){
		res.status('500').send();
	});
});

app.get('/todo/:id', function(req, res) {
	var paramId = parseInt(req.params.id, 10);

	db.todo.findById(paramId).then(function(todo){
		if(todo){
			res.json(todo);
		}else{
			res.status('404').send();
		}
	}, function(error){
		res.status('500').json(error);
	});	
});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	if (body.description.trim().length > 0 && _.isBoolean(body.completed)) {
		db.todo.create({
			description: body.description,
			completed: body.completed
		}).then(function(todo) {
			res.json(todo);
		}, function(e) {
			res.status('400').json(e);
		}).catch(function(error){
			console.log(error);
		});
	} else {
		res.status('400').send();
	}
});

app.delete('/todo/:id', function(req, res) {
	var paramId = parseInt(req.params.id, 10);
	
	db.todo.destroy({where: {
		id: paramId
	}}).then(function(todo){
		if(todo > 0){
			res.send(todo + ' rows removed');
		}else{
			res.send('no rows were removed');
		}
	}, function(error){
		res.status('500').json(error);
	}).catch(function(e){
		res.status('500').json(e);
	});

});

app.put('/todo/:id', function(req, res) {
	var body = req.body;
	var paramId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: paramId
	});

	if (!matchedTodo) {
		return res.status('404').send();
	}

	var todo = _.pick(body, 'description', 'completed');
	var validAttributes = {};

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status('400').send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status('400').send();
	}

	_.extend(matchedTodo, validAttributes);
	res.send('todo was updated');

});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Server started on port ' + PORT);
	});
});