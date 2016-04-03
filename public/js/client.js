var socket = io();
$(document).ready(function() {
    $("#lobby").hide();
    $("#game").hide();
    $("#name").focus();
    $("form").submit(function(event){
        event.preventDefault();
    });
});
$('#login-form').submit(function() {
    var name = $("#name").val();
    if (name != "") {
        socket.emit("join", name);
    }
    $("#lobby").show();
    $("#login").hide();
    $("#greeting").text("Hello, " + name + "!");
});
$("#ready").click(function() {
    socket.emit("ready up", "/#"+socket.id);
    $(this).hide();
});
socket.on('update waiting', function(players){
    $("#waiting").empty();
    for (var player in players) {
        var status = " is not ready.";
        if (players[player].ready) {
            status = " is ready!";
        }
        $('#waiting').append("<li>"+players[player].name+status+"</li>");
    }
});
socket.on('update game', function(players) {
    $("#lobby").hide();
    $("#game").show();
    $("#act-done").show();
    $(".act").show();
    $("label").show();
    $("#players").empty();
    for (var player in players) {
        var name = players[player].name;
        var life = players[player].life;
        var form = "";
        if (player == "/#"+socket.id) {
            name = "*"+name+"*";
        }
        else {
            form = "<input type='checkbox' class='act' id='atk-"+player+"' name='atk-"+player+"'><label for='atk-"+player+"'>Attack "+players[player].name+"</label><br/><input type='checkbox' class='act' id='blk-"+player+"'><label for='blk-"+player+"'>Block "+players[player].name+"</label>";
        }
        $("#players").append("<div class='player-card'><h4>"+name+"</h4><p>Life: "+life+"</p>"+form+"</div>");
    }
});
$("#act-done").click(function() {
    var myActs = $(".act");
    var attacks = new Array();
    var blocks = new Array();
    for (var i = 0; i < myActs.length; i++) {
        if (myActs[i].id.substring(0,3) == "atk" && myActs[i].checked) {
            attacks.push(myActs[i].id.substring(4));
        }
        else if (myActs[i].id.substring(0,3) == "blk" && myActs[i].checked) {
            blocks.push(myActs[i].id.substring(4));
        }
    }
    var sendActions = {
        id: "/#"+socket.id,
        attacks: attacks,
        blocks: blocks
    }
    $("#act-done").hide();
    $(".act").hide();
    $("label").hide();
    socket.emit("send actions", sendActions);
});