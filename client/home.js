Template.home.helpers({
    redirectToCreatedGame: function() {
    	var createdGameId = Session.get("createdGameId");
        if (createdGameId) {
        	delete Session.keys['createdGameId'];
        	window.location.href = "/game/" + createdGameId;
        }
    }
});

Template.home.events({
	'click #createGame': function(){
	    Meteor.call('createGame', Meteor.userId(), function (error, result) {
	        Session.set("createdGameId",result);
	    });
	},
    'submit form': function(evt, template){
        evt.preventDefault();
        console.log(evt);
        var id = evt.target[0].value;
        window.location.href="/game/" + id;
    }
});
