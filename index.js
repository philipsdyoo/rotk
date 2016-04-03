var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/public", express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});

app.get('/about', function(req, res){
    res.sendFile(__dirname + '/views/about.html');
});

var players = {};
var free = true;
var actions = {};

io.on('connection', function(socket){
    if (free) {
    	socket.on("join", function(name){
            players[socket.id] = {
            	name: name,
            	life: 100,
            	ready: false,	//ready in lobby
            	done: false		//done making a move
            };
            //console.log(players);
            io.emit("update waiting", players);
        });

        socket.on("ready up", function(clientid) {
        	players[clientid].ready = true;
        	io.emit("update waiting", players);
        	var number = Object.keys(players).length;
        	var current = 0;
        	for (var player in players) {
    	        if (players[player].ready) {
    	            current = current + 1;
    	        }
        	}
        	if (number == current) {
        		io.emit("update game", players);
                free = false;
        	}
        });
    }
    socket.on("send actions", function(action) {
        actions[action.id] = {
            attacks: action.attacks,
            blocks: action.blocks
        };
        var number = Object.keys(players).length;
        var current = Object.keys(actions).length;
        if (number == current) {
            for (var actor in actions) {
                for (var i = 0; i < actions[actor].attacks.length; i++) {
                    var target = actions[actor].attacks[i];
                    if (actions[target].blocks.indexOf(actor) < 0) {
                        //HIT
                        players[target].life -= 3;
                    }
                }
                players[actor].life -= actions[actor].attacks.length + actions[actor].blocks.length;
            }
            io.emit("update game", players);
        }
    });

    socket.on("disconnect", function(){
        //console.log(players[socket.id].name + " disconnected");
        delete players[socket.id];
        io.emit("update waiting", players);
        free = true;
    });
});

http.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});