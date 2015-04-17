Games = new Meteor.Collection('games');

if (Meteor.isServer) {
	Meteor.publish('games', function () {
        return Games.find();
    });

    Meteor.publish('users', function () {
        return Meteor.users.find();
    });
}

if (Meteor.isClient) {
	Meteor.subscribe('games');
	Meteor.subscribe('users');

	Template.registerHelper("username", function(id) {
	return Meteor.users.findOne(id).username;
	});
}