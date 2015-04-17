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
	Games.update(gameId, {$set: {"lastDiscarded":card}});
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

Turns.discardHandAndDrawNewCard = function (gameId, id) {
	var game = Games.findOne(gameId);
		card = game.players[id].hand[0];

	if (card.value == 8) {
		Turns.playPrincess(gameId,id,card);
	} else if (game.deck.length < 1) {
		var object = {};
		object["players." + id + ".hand"] = {};
		Games.update(gameId, {$pull: object});
		Turns.addCardToHand(gameId, id, game.facedown[0]);
		Turns.log(gameId, Meteor.users.findOne(id) + " discarded a " + card.type + ".")
		Turns.log(gameId, "The deck was empty so " + Meteor.users.findOne(id) + " drew the facedown card.")
	} else {
		var object = {};
		object["players." + id + ".hand"] = {};
		Games.update(gameId, {$pull: object});
	
		var game = Games.findOne(gameId),
			newCard = game.deck[0];
	
		Turns.removeTopOfDeck(gameId);
		Turns.addCardToHand(gameId,id,newCard);
	
		Turns.log(gameId, Meteor.users.findOne(id).username + " discarded a " + card.type + " and they drew a new card.");
	}
};

Turns.swapHands = function (gameId, id, target) {
	var game = Games.findOne(gameId),
		hand1 = game.players[id].hand,
		hand2 = game.players[target].hand;

	var object1 = {};
	object1["players." + id + ".hand"] = hand2;
	Games.update(gameId, {$set: object1});

	var object2 = {};
	object2["players." + target + ".hand"] = hand1;
	Games.update(gameId, {$set: object2});
}

Turns.isProtected = function (game, id) {
	var protectedList = game.protected;

	if (protectedList.indexOf(id) > -1) {
		return true;
	} else {
		return false;
	}
}

Turns.holdingCountess = function(game, id) {
	
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

Turns.eliminatePlayer = function (gameId,id) {
	var game = Games.findOne(gameId),
		currentTurn = game.currentTurn,
		idIndex = currentTurn.indexOf(id);

	currentTurn.splice(idIndex,1);
	Games.update(gameId,{$set:{"currentTurn":currentTurn}});
	Games.update(gameId,{$push:{"eliminated":id}});
	Turns.log(gameId, Meteor.users.findOne(id).username + " was eliminated!")

	if (currentTurn.length == 1) {
		Turns.endRound(gameId);
	} 
}

Turns.endRound = function (gameId) {
	var game = Games.findOne(gameId),
		winner = game.currentTurn[0];

	var object = {};
	object["scores." + id] = 1;
	Games.update(gameId, {$inc: object});
}

Turns.playGuard = function (gameId, id, guess, target) {
	var card = {"type":"Guard","value":"1"};

	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);

	if (! target) {
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Guard but everyone was protected by Handmaids!");
    	Turns.changeCurrentPlayer(gameId);
    	return;
	}

	var game = Games.findOne(gameId),
		targetHand = game.players[target].hand[0].type;

	if (targetHand === guess.type) {
		console.log("Your opponent has that card!");
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Guard against " + Meteor.users.findOne(target).username + " and guessed " + guess.type + ". They were right!");
		Turns.eliminatePlayer(gameId,target);
		Turns.changeCurrentPlayer(gameId);
	} else {
    	console.log("Your opponent doesn't have that card!");
    	Turns.log(gameId, Meteor.users.findOne(id).username + " played a Guard against " + Meteor.users.findOne(target).username + " and guessed " + guess.type + ". They were wrong.");
    	Turns.changeCurrentPlayer(gameId);
	};

};

Turns.playPriest = function (gameId, id, target, card) {
	var game = Games.findOne(gameId);
	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);
	
	if (! target) {
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Priest but everyone was protected by Handmaids!");
    	Turns.changeCurrentPlayer(gameId);
    	return;
	}

	var result = game.players[target].hand[0].type;

	Turns.log(gameId, Meteor.users.findOne(id).username + " played a Priest to look at " + Meteor.users.findOne(target).username + "'s hand.");
	Turns.changeCurrentPlayer(gameId);



	return result;
};

Turns.playBaron = function (gameId, id, target, card) {
	// Compare hands, lower hand is out
	var game = Games.findOne(gameId);

	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);

	if (! target) {
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Baron but everyone was protected by Handmaids!");
    	Turns.changeCurrentPlayer(gameId);
    	return;
	}

	game = Games.findOne(gameId);
	var	opponentHand = game.players[target].hand[0].value,
	userHand = game.players[id].hand[0].value;

	if (userHand > opponentHand) {
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Baron against " + Meteor.users.findOne(target).username + " and " + Meteor.users.findOne(id).username + " had the high card.");
		Turns.eliminatePlayer(gameId,target);
		Turns.changeCurrentPlayer(gameId);
	} else if (userHand < opponentHand) {
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Baron against " + Meteor.users.findOne(target).username + " and " + Meteor.users.findOne(target).username + " had the high card.");
		Turns.eliminatePlayer(gameId,id);
	} else {
		console.log("Cards were equal!");
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Baron but both cards were equal.");
		Turns.changeCurrentPlayer(gameId);
	}
};

Turns.playHandmaid = function (gameId, id, card) {
	// Protection until next turn
	
	Turns.log(gameId, Meteor.users.findOne(id).username + " played a Handmaid and is protected until their next turn.");

	Games.update(gameId, {$push: {"protected":id}});

	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);
	Turns.changeCurrentPlayer(gameId);
};

Turns.playPrince = function (gameId, id, card, target) {
	// One player discards his or her hand
	// Needs to ask current player if they want to discard their own hand
	// Must discard Countess instead if held
	console.log("Discarded Prince");

	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);
	Turns.changeCurrentPlayer(gameId);

	if (target === id) {
		//current player discards hand and draws new card
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Prince to discard their own hand.");
		Turns.discardHandAndDrawNewCard(gameId,id);
	} else {
		//opponent discards hand and draws new card
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a Prince to force " + Meteor.users.findOne(target).username + " to discard their hand.");
		Turns.discardHandAndDrawNewCard(gameId,target);
	}
};

Turns.playKing = function (gameId, id, card, target) {
	//Trade hands
	//Must discard Countess instead if held
	console.log("Discarded King");
	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);
	Turns.changeCurrentPlayer(gameId);

	if (! target) {
		Turns.log(gameId, Meteor.users.findOne(id).username + " played a King but everyone was protected by Handmaids!");
    	return;
	}

	Turns.log(gameId, Meteor.users.findOne(id).username + " played a King against " + Meteor.users.findOne(target).username + ". Players have swapped hands.");

	Turns.swapHands(gameId,id,target);
};

Turns.playCountess = function (gameId, id, card) {
	//Discard if caught with King or Prince
	console.log("Discarded Countess");
	Turns.log(gameId, Meteor.users.findOne(id).username + " played a Countess.");

	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);
	Turns.changeCurrentPlayer(gameId);
};

Turns.playPrincess = function (gameId, id, card) {
	// Lose game if discarded
	console.log("Discarded Princess");
	Turns.log(gameId, Meteor.users.findOne(id).username + " discarded a Princess and was therefore eliminated.");

	Turns.addToDiscard(gameId,id,card);
	Turns.removeFromHand(gameId,id,card);
	Turns.eliminatePlayer(gameId,id);
};