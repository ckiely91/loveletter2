Router.configure({
	layoutTemplate: 'layout'
});

Router.map(function () {
	this.route('home', {path: '/'});
	this.route('play', {
		path: '/game/:_id',
		data: function() {
			var game = Games.findOne(this.params._id);

			if (game) {
				if (game.players) {
					game.player = game.players[Meteor.userId()];
					game.yourTurn = game.currentTurn[0] === Meteor.userId();
				}
				return game;
			}
			return{};
		}

	});
});