GameFactory = {};

GameFactory.createGame = function (id) {
	return {
		currentTurn: [id],
		inProgress: false,
		lobby: true,
		started: new Date()
	}
}