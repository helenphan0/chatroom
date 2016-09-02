
$(document).ready(function() {
    var socket = io();
    var input = $('input.chatmessage');
    var username = $('input.user');
    var messages = $('#messages');
    var name;

    function scrollTop() {
       messages[0].scrollTop = messages[0].scrollHeight;
    };

    $('.grey-out').fadeIn(500);
    $('.user').fadeIn(500);
    $('#username').on("keydown", function (e) {
        return e.which !== 32;
    });
    $('.user').submit(function(){
        event.preventDefault();
        name = $('#username').val();
        socket.emit('join', name);
        $('.grey-out').fadeOut(300);
        $('.user').fadeOut(300);
        input.focus();
    });
    
    var myMessage = function(message) {
        messages.append('<div class="my-msg">' + new Date().toLocaleString() + ' __ ' + ' [' + name + ']: ' + message + '</div>');
        scrollTop();
    }

    var addMessage = function(data) {
        messages.append('<div class="add-msg">' + new Date().toLocaleString() + ' __ ' + ' [' + data.username + ']: ' + data.message + '</div>');
        scrollTop();
    };

    var directMessage = function(data) {
        messages.append('<div class="direct-msg">' + new Date().toLocaleString() + ' __ ' + ' [' + data.username + ']: ' + data.message + '</div>');
        scrollTop();
    };

    var joined = function(data) {
        messages.append('<div class="join">' + new Date().toLocaleString() + ' ------> ' + data.username + ' joined.' + '</div>');
        scrollTop()
    };

    var disconnected = function(name) {
        messages.append('<div class="dc">' + new Date().toLocaleString() + ' ------- ' + name + ' disconnected.' + '</div>');
        scrollTop();
    };

    var userlist = function(names) {
        var html = '<p class="chatbox-header">' + 'Users' + '</p>';
        for (var i = 0; i < names.length; i++) {
            html += '<li>' + names[i] + '<span class="typing hidden" style="display: none;">' + ' is typing..' + '</span></li>';
        };
        $('ul').html(html);
    };

    var typing = function(name) {
        var span = '<span class="typing hidden" style="display: none;">' + ' is typing..' + '</span>';
        var li = $('li').filter(function() {
            return $(this).html() === name + span;
        });
        li.children('span').fadeIn(0);
        li.children('span').fadeOut(750);
    };

    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }
        else if (input.val() == '') {
            return;
        }
        var message = $('input.chatmessage').val();
        var str = message.split(' ');

        if (str[0] == '/m') {
            var directname = str[1];
            var directmsg = str.slice(2).join(' ');
            socket.emit('direct message', {username: directname, message: directmsg});   
        }
        else {
            myMessage(message);
            socket.emit('message', {username: name, message: message});
        };

        input.val('');

    });

    input.on('keypress', function(event) {
        socket.emit('typing', name);
    });

    $('#users-box').on('click', 'li', function() {
        var target = $(this).text().split(' ');
        target = target.slice(0,1);
        target = target[0];
        input.val('/m ' + target + ' ');
        input.focus();
    });


    socket.on('typing', typing);
    socket.on('message', addMessage);
    socket.on('direct message', directMessage);
    socket.on('join', joined);
    socket.on('disconnect', disconnected);
    socket.on('userlist', userlist);
});