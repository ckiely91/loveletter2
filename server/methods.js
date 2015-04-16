Future = Npm.require('fibers/future');

Meteor.methods({
    'createGame': function(id) {
        var fut = new Future();
        setTimeout(
            Meteor.bindEnvironment(
                function() {
                	var game = GameFactory.createGame(id);
                    var result = Games.insert(game);
                    console.log(result);
                    fut.return(result);
                },
                function(exception) {
                    console.log("Exception : ", exception);
                    fut.throw(new Error("Async function throw exception"));
                }
            ),
            1000
        )
        return fut.wait();
    },
    'joinGame': function(gameId,id) {
        var game = Games.findOne(gameId);
            players = game.currentTurn;

        if (players.length == 4) {
            console.log("The game is at the maximum amount of players");
            return;
        }

        if (players.indexOf(id) > -1) {
            console.log("Player is already in the game.");
            return;
        }

        Games.update(gameId,{$push:{"currentTurn":id}});
    }
});