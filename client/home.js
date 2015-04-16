Template.loggedIn.helpers({
    redirectToCreatedGame: function() {
    	var createdGameId = Session.get("createdGameId");
        if (createdGameId) {
        	delete Session.keys['createdGameId'];
        	window.location.href = "/game/" + createdGameId;
        }
    }
});

Template.loggedIn.events({
	'click button': function(){
		console.log("clicked");
	    Meteor.call('createGame', function (error, result) {
	        Session.set("createdGameId",result);
	    });
	}
});
