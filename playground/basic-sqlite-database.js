var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull : false,
		defaultValue: false
	}
});

sequelize.sync({
	force: false
}).then(function() {


    Todo.findAll({
    	where:{
    		completed:false
    	}
    }).then(function(todos){
    	todos.forEach(function(todo){
    		if(todo){
    			console.log(todo.toJSON());
    		}else{
    			console.log('no todo was found');
    		}
    	});
    }).catch(function(error){
    	console.log('no todo was found in db');
    })	
	// console.log('everything is synced');
	// Todo.create({
	// 	description: 'Completed nodejs course',
	// 	completed: false
	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: 'take out trash'
	// 	});
	// }).then(function(){
	// 	// return Todo.findById(1);
	// 	return Todo.findAll({
	// 		where: {
	// 			completed:false
	// 		}
	// 	})
	// }).then(function(todo){
	// 	if(todo){
	// 		console.log(todo.toJSON());
	// 	}else{
	// 		console.log('no todo found');
	// 	}
	// }).catch(function(e){
	// 	console.log(e);
	// })
});