var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

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

app.get('/todos', middleware.requireAuthentication, function(req, res) {
	console.log('getting all todos');
	var query = req.query;

	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(error) {
		res.status('500').send();
	});
});

app.get('/todo/:id', middleware.requireAuthentication, function(req, res) {
	var paramId = parseInt(req.params.id, 10);

	db.todo.findById(paramId).then(function(todo) {
		if (todo) {
			res.json(todo);
		} else {
			res.status('404').send();
		}
	}, function(error) {
		res.status('500').json(error);
	});
});

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	if (body.description.trim().length > 0 && _.isBoolean(body.completed)) {
		db.todo.create({
			description: body.description,
			completed: body.completed
		}).then(function(todo) {
			res.json(todo);
		}, function(e) {
			res.status('400').json(e);
		}).catch(function(error) {
			console.log(error);
		});
	} else {
		res.status('400').send();
	}
});

app.delete('/todo/:id', middleware.requireAuthentication, function(req, res) {
	var paramId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: paramId
		}
	}).then(function(todo) {
		if (todo > 0) {
			res.send(todo + ' rows removed');
		} else {
			res.send('no rows were removed');
		}
	}, function(error) {
		res.status('500').json(error);
	}).catch(function(e) {
		res.status('500').json(e);
	});

});

app.put('/todo/:id', middleware.requireAuthentication,  function(req, res) {
	var body = req.body;
	var todoId = parseInt(req.params.id, 10);
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}


	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(error) {
				res.status('400').json(error);
			});
		} else {
			res.status('404').send();
		}
	}, function() {
		res.status('500').send();
	});
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password')
	db.user.create({
		email: body.email,
		password: body.password
	}).then(function(user) {
		res.json(user.toPublicJSON())
	}, function(error) {
		res.status('400').send(error);
	}).catch(function(e) {
		res.status('500').json(e);
	});
})


// POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');


	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			return res.status('401').send();
		}
	}, function(error) {
		res.status('401').send();
	})


});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Server started on port ' + PORT);
	});
});