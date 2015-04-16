Template.lobby.helpers({
	username: function(id) {
		return Meteor.users.findOne(id).username;
	},
	gameFull: function(parentContext) {
		var players = parentContext.currentTurn.length;
		if (players == 4) {
			return true;
		} else {
			return false;
		}
	},
	alreadyInGame: function(parentContext) {
		var players = parentContext.currentTurn;
		if (players.indexOf(Meteor.userId()) > -1) {
			return true;
		} else {
			return false;
		}
	}
});

Template.lobby.events({
	'click #joingame': function(evt,template) {
		console.log(template.data._id);
		console.log(Meteor.userId());
		Meteor.call('joinGame',template.data._id,Meteor.userId());
	}
})