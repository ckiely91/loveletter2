Games = new Meteor.Collection('games');

if (Meteor.isServer) {
	Meteor.publish('games', function (id) {

		return Games.find({}, {fields: {currentTurn:1, owner:1, inProgress:1,lobby:1,log:1,started:1,faceup:1, protected:1, scores:1, discards:1, lastDiscarded:1, eliminated:1, betweenRounds:1, lastRoundWinner:1, lastTurn:1, bigWinner:1, players:1, deck:1 }})

    });

    Meteor.publish('users', function () {
        return Meteor.users.find({}, {fields: {profile: 1, username: 1}});
    });
}

if (Meteor.isClient) {

	Meteor.subscribe('games', Meteor.userId());
	Meteor.subscribe('users');

	Template.registerHelper("username", function(id) {
	return Meteor.users.findOne(id).username;
	});

	Template.registerHelper("sortArray", function (array,iterator,desc) {
		var sortedArray = _.sortBy(array, iterator);
		if(desc == true) {
			sortedArray.reverse();
		}
		return sortedArray;
	});
}