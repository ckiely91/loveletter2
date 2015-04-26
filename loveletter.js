Games = new Meteor.Collection('games');

if (Meteor.isServer) {
	Meteor.publish('games', function (id) {

		return Games.find();
		
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