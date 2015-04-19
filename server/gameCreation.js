GameFactory = {};

GameFactory.createGame = function (id) {
	time =  new Date();
	return {
		currentTurn: [id],
		owner: id,
		inProgress: false,
		lobby: true,
		log: [{"time":time,"message":"Lobby created."}],
		started: new Date()
	}
};

GameFactory.createFirstRound = function (gameId, firstPlayer) {
	var game = Games.findOne(gameId),
		playerIds = game.currentTurn;

	//shuffle player turn order
	var index = playerIds.indexOf(firstPlayer);
	playerIds.splice(index,1);
	playerIds = _.shuffle(playerIds);
	playerIds.unshift(firstPlayer);

	var allcards = createLLDeck(gameId, playerIds.length),
	deck = allcards[0],
	facedown = allcards[1],
	faceup = allcards[2],
	players = createPlayers(playerIds),
	scores  = createScores(playerIds);

	GameFactory.dealPlayers(players, deck);

	return {
		deck: deck,
		faceup: faceup,
		facedown: facedown,
		players: players,
		currentTurn: playerIds,
		inProgress: true,
		lobby: false,
		protected: [],
		scores: scores
	}
};

GameFactory.createNewRound = function (gameId,winner) {
	var game = Games.findOne(gameId),
		playerIds = game.eliminated;

	if (! winner) {
		var winner = game.currentTurn[0];
	}
		
	playerIds = playerIds.concat(game.currentTurn);
	var index = playerIds.indexOf(winner);
	playerIds.splice(index,1);

	//shuffle player turn order
	playerIds = _.shuffle(playerIds);
	playerIds.unshift(winner);

	var allcards = createLLDeck(gameId, playerIds.length),
		deck = allcards[0],
		facedown = allcards[1],
		faceup = allcards[2],
		players = createPlayers(playerIds);

	GameFactory.dealPlayers(players, deck);

	return {
		deck: deck,
		faceup: faceup,
		facedown: facedown,
		players: players,
		currentTurn: playerIds,
		protected: [],
		eliminated: [],
		lastTurn: false,
		betweenRounds: false
	}
}

function createPlayers(ids) {
	var o = {};

	ids.forEach(function (id) {
		o[id] = {
			hand: []
		};
	});

	return o;
}

function createScores(ids) {
	var array = [];

	ids.forEach(function (id) {
		var o = {"id":id,"score":0};
		array.push(o);
	});

	return array;
}

GameFactory.dealPlayers = function (players,deck) {
	for (var i = 0; i < 1; i++) {
		Object.keys(players).forEach(function (id) {
			players[id].hand.push(deck.shift());
		});
	}
};

function createLLDeck (gameId, playerNo) {
	var cards = [
			{ type: 'Guard', value: 1 },
			{ type: 'Guard', value: 1 },
			{ type: 'Guard', value: 1 },
			{ type: 'Guard', value: 1 },
			{ type: 'Guard', value: 1 },
			{ type: 'Priest', value: 2 },
			{ type: 'Priest', value: 2 },
			/*{ type: 'Baron', value: 3 },
			{ type: 'Baron', value: 3 },
			{ type: 'Handmaid', value: 4 },
			{ type: 'Handmaid', value: 4 },
			{ type: 'Prince', value: 5 },
			{ type: 'Prince', value: 5 },
			{ type: 'King', value: 6 },
			{ type: 'Countess', value: 7 },
			{ type: 'Princess', value: 8 }*/
			];
	cards = _.shuffle(cards);

	if (playerNo == 2) {
		var facedown = cards.splice(1,1),
			faceup = cards.splice(1,3);
		Turns.log(gameId,"One card was removed from the deck face down, and three cards were removed face up.");
		return [cards,facedown,faceup];
	} else {
		var facedown = cards.splice(1,1);
		Turns.log(gameId,"One card was removed from the deck face down.");
		return [cards,facedown];
	}
}