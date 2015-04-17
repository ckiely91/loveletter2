Turns = {};

Turns.log = function (gameId, message) {
	var time = new Date();
	Games.update(gameId, {$push: {"log":{"time":time,"message":message}}});
};

Turns.addCardToHand = function (gameId, id, card) {
		var object = {};
		object["players." + id + ".hand"] = card;
		Games.update(gameId, {$push: object});
};

Turns.removeTopOfDeck = function (gameId) {
	Games.update(gameId, {$pop: {"deck": -1}});
};

Turns.addToDiscard = function (gameId, id, card) {
	var object = {};
		object["players." + id + ".discard"] = card;
	Games.update(gameId, {$set: object});
};

Turns.removeFromHand = function (gameId, id, card) {
	var game = Games.findOne(gameId),
		hand = game.players[id].hand;
		hand2 = [],
		cardFound = false;

	for (var i = hand.length - 1; i >= 0; i--) {

		if ((hand[i].value == card.value) && (cardFound == false))
		{
			cardFound = true;
		} else {
			hand2.push(hand[i]);
		}
	};

	var object = {};
	object["players." + id + ".hand"] = hand2;
	Games.update(gameId, {$set: object});
};

Turns.isProtected = function (game, id) {
	var protectedList = game.protected;

	if (protectedList.indexOf(id) > -1) {
		return true;
	} else {
		return false;
	}
}

Turns.changeCurrentPlayer = function (gameId) {
	var game = Games.findOne(gameId),
		currentPlayer = game.currentTurn[0],
		newCurrentPlayer = game.currentTurn[1];

	Games.update(gameId, {$pop: {"currentTurn": -1}});
	Games.update(gameId, {$push: {"currentTurn": currentPlayer}});

	//checking if new current player is protected by handmaiden; if so, unprotect them
	var newCurrentPlayerProtected = Turns.isProtected(game,newCurrentPlayer);

	if (newCurrentPlayerProtected == true) {
		Games.update(gameId, {$pull: {protected:newCurrentPlayer}});
	}; 
};


Turns.playGuard = function (gameId, id, guess, target) {
	var game = Games.findOne(gameId),
		card = {"type":"Guard","value":"1"},
		targetHand = game.players[target].hand[0].type;

	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);

	if (Turns.isProtected(game,target) == true) {
		return;
	};

	if (targetHand === guess.type) {
		console.log("Your opponent has that card!");
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Guard against " + Meteor.users.findOne(target).username + " and guessed " + guess.type + ". They were right!");
		Turns.eliminatePlayer(gameId,target);
	} else {
    	console.log("Your opponent doesn't have that card!");
    	Turns.log(gameId, Meteor.users.findOne(id).username + " played a Guard against " + Meteor.users.findOne(target).username + " and guessed " + guess.type + ". They were wrong.");
    	Turns.changeCurrentPlayer(gameId);
	};

};

Turns.playPriest = function (gameId, id, target, card) {
	//Look at a hand
	console.log("Discarded Priest");
	var game = Games.findOne(gameId),
		result = game.players[target].hand[0].type;

	Turns.log(gameId, Meteor.users.findOne(id).username + " played a Priest to look at " + Meteor.users.findOne(target).username + "'s hand.");
	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);
	Turns.changeCurrentPlayer(gameId);

	return result;
};