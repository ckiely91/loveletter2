Helpers = {};

Helpers.otherPlayers = function (game) {
	var id = Meteor.userId(),
		players = game.currentTurn.slice();
		index = players.indexOf[id];
	players.splice(index,1);
	return players;
};

Helpers.allPlayersProtected = function (game) {
	/*var flag = true,
		otherPlayers = Helpers.otherPlayers(game);

	console.log(game.protected.indexOf(otherPlayers[0]));
		for (var i = otherPlayers.length - 1; i >= 0; i--) {
			if (game.protected.indexOf(otherPlayers[i]) == -1) {
				flag = false;
			}
		};
		return flag;*/
	var protectedCount = 0,
		protectedList = game.protected;
		otherPlayers = Helpers.otherPlayers(game);
	for (var i = otherPlayers.length - 1; i >= 0; i--) {
		if (protectedList.indexOf(otherPlayers[i]) > -1) {
			protectedCount++;
		}
	};
	return (protectedCount == otherPlayers.length) ? true : false;
	
};
Helpers.holdingCountess = function (game) {
	var hand = game.players[Meteor.userId()].hand;
	for (var i = hand.length - 1; i >= 0; i--) {

		if ((hand[i].value == 7))
		{
			return true;
		} 
	};
	return false;
}