var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var usersList = [];
var users = {};


// socket parameter is unique to each client
io.on('connection', function (socket) {
    console.log('Client connected');

    // a client joining the server
    socket.on('join', function(name) {
    	socket.username = name;

        // upon join, client is assigned their own room
        socket.join(name); 

        // client is saved to UsersList array, managed by server
    	usersList.push(socket.username);

        // server updates all clients with UsersList
    	io.emit('userlist', usersList);

        // server announces to other clients about new client
    	socket.broadcast.emit('join', { username: socket.username});
    	socket.emit('join', { username: socket.username});
    });

    // a client sending a message to chat room
    socket.on('message', function(data) {
    	console.log('Sent message: ', data.message);
    	socket.broadcast.emit('message', {username: socket.username, message: data.message});
    });

    // when a client is typing, show all clients who is typing in the chatroom
    socket.on('typing', function(name) {
    	io.emit('typing', name);
    });

    // a client sends a message to another specific client
    socket.on('direct message', function(data) {       
        console.log( 'direct msg to: ' + socket.username + ' ' + data.message);
        io.in(usersList[j]).emit('direct message', {username: socket.username, message: data.message});
    });

    // a client disconnects from chatroom
    socket.on('disconnect', function() {

    	for (var i = 0; i < usersList.length; i++) {
    		if (usersList[i] == socket.username) {

                // remove client from list of clients, UsersList array
    			usersList.splice(i, 1);
    		}
    	}

        // update list of clients
    	io.emit('userlist', usersList);
    	console.log('user disconnected');

        // announce who has left
    	io.emit('disconnect', socket.username);
  	});

});


server.listen(process.env.PORT || 8080, function() {
	console.log('Server started at http://localhost:8080');
});