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
    'startRound': function(gameId) {
        Turns.startRound(gameId);
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
    },
    'startGame': function(gameId) {
        var game = Games.findOne(gameId),
            players = game.currentTurn;
        if (players.length < 2 || players.length > 4) {
            console.log("Wrong number of players in game.");
            return;
        }

        var round = GameFactory.createFirstRound(gameId,players[0]);
        Games.update(gameId,{$set:round});
    },
    takeCard: function (gameId, id) {
        var game = Games.findOne(gameId),
            deck = game.deck;
        if (game.currentTurn[0] !== id) return;
        if (game.players[id].hand.length > 1) return;

        var card = deck.shift();
        Turns.addCardToHand(gameId, id, card);
        Turns.removeTopOfDeck(gameId);
    },
    playCard: function (gameId, id, card, guess, target) {
        var game = Games.findOne(gameId),
            type = card.type;

        if (game.currentTurn[0] != id) {
            return;
        }

        if (type === "Guard") {
            Turns.playGuard(gameId,id,guess,target);
        } else if (type === "Priest") {
            var fut = new Future();
            setTimeout(
                Meteor.bindEnvironment(
                    function() {
                        var result = Turns.playPriest(gameId,id,target,card);
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
        } else if (type === "Baron") {
            Turns.playBaron(gameId,id,target,card);
        } else if (type === "Handmaid") {
            Turns.playHandmaid(gameId,id,card);
        } else if (type === "Prince") {
            Turns.playPrince(gameId,id,card,target);
        } else if (type === "King") {
            Turns.playKing(gameId,id,card,target);
        } else if (type === "Countess") {
            Turns.playCountess(gameId,id,card);
        } else if (type === "Princess") {
            Turns.playPrincess(gameId,id,card);
        } else {
            console.log ("Wut");
            return;
        };
    },
});