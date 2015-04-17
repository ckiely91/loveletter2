Template.lobby.helpers({
	gameFull: function(parentContext) {
		var players = parentContext.currentTurn.length;
		if (players == 4) {
			return true;
		} else {
			return false;
		}
	},
	readyToStart: function(parentContext) {
		var players = parentContext.currentTurn.length;
		if (players > 1) {
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
	},
	isOwner: function(parentContext) {
		var owner = parentContext.owner,
			id = Meteor.userId();
		if (id === owner) { return true; } else { return false; }
	}
});

Template.lobby.events({
	'click #joingame': function(evt,template) {
		Meteor.call('joinGame',template.data._id,Meteor.userId());
	},
	'click #startgame': function(evt,template) {
		Meteor.call('startGame',template.data._id);
	}
})

Template.gamelog.helpers({
	gamelog : function() {
		return this.log.slice(-10).reverse();
	},
	friendlytime : function(time) {
		return moment(time).fromNow();
	}
});

Template.game.helpers({
	isEliminated: function() {
		if (this.eliminated.indexOf(Meteor.userId()) > -1) {
		return true;
		} else { return false;}
	}
});

Template.deck.events({
	'click .card': function (evt, template) {

		if (template.data.yourTurn) {
			var deck = template.data.deck;
			if (deck.length > 1) {
				if (template.data.players[Meteor.userId()].hand.length <= 1) {
				Meteor.call('takeCard', template.data._id, Meteor.userId());
				} else {
					alert("You've already taken a card this turn.");
				}
			} else {
				//Meteor.call('deckEmpty', template.data._id);
				Meteor.call('takeCard', template.data._id, Meteor.userId());
			}
			
		} else {
			alert("It's not your turn!");
		}
	}
});

Template.hand.events({
	'click .card': function (evt, template) {
		var game = template.data,
			card = this,
			holdingCountess = Helpers.holdingCountess(game),
			allPlayersProtected = Helpers.allPlayersProtected(game);
		
		console.log(allPlayersProtected);

		if (game.yourTurn) {
				if (game.players[Meteor.userId()].hand.length <= 1) {
					alert("You need to draw a card first.");
				} else {
					if (this.type === "Guard") {
						if (allPlayersProtected == true) {
							Meteor.call('playCard', template.data._id, Meteor.userId(), card);
						} else {
							$('#guardModal').modal();
							return;	
						}
					} else if (this.type === "Priest") {
						if (allPlayersProtected == true) {
							Meteor.call('playCard', template.data._id, Meteor.userId(), card);
						} else {
							$('#priestModal').modal();
							return;
						}
					} else if (this.type === "Baron") {
						if (allPlayersProtected == true) {
							Meteor.call('playCard', template.data._id, Meteor.userId(), card);
						} else {
							$('#baronModal').modal();
							return;
						}
					} else if (this.type === "Prince") {
						if (holdingCountess == true) {
							alert("You're holding the Countess, so you have to discard that instead. Sorry buddy.");
							var countessCard = {"type":"Countess","value":7};
							Meteor.call('playCard', template.data._id, Meteor.userId(), countessCard);
						} else {
							$('#princeModal').modal();
							return;
						}
						
					} else if (this.type === "King") {
						if (holdingCountess == true) {
							alert("You're holding the Countess, so you have to discard that instead. Sorry buddy.");
							var countessCard = {"type":"Countess","value":7};
							Meteor.call('playCard', template.data._id, Meteor.userId(), countessCard);
						} else {
							if (allPlayersProtected == true) {
							Meteor.call('playCard', template.data._id, Meteor.userId(), card);
							} else {
								$('#kingModal').modal();
								return;
							}
						}
					} else {
						Meteor.call('playCard', template.data._id, Meteor.userId(), this);
					}
				}
			
			
		}
	}
});

Template.guardModal.helpers({
	otherPlayers : function () {
			var otherplayers = this.currentTurn.slice(),
				currentPlayerIndex = otherplayers.indexOf(Meteor.userId());
			otherplayers.splice(currentPlayerIndex,1);
			return otherplayers;
		},
	protected : function (parentContext, id) {
		var protected = parentContext.protected;
		if (protected.indexOf(id) > -1) {
			return true;
		} else { return false;}
	}
});

Template.guardModal.events({
	'submit form' : function (evt,template) {
		evt.preventDefault();
		var data = $("#guardform :input").serializeArray();
		var targetPlayerId = data[0].value,
			card = {"type":data[1].name,"value":data[1].value},
			guard = {"type":"Guard","value":"1"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), guard, card, targetPlayerId);

		$('#guardModal').modal('hide');
	}
});

Template.priestModal.helpers({
	otherPlayers : function () {
			var otherplayers = this.currentTurn.slice(),
				currentPlayerIndex = otherplayers.indexOf(Meteor.userId());
			otherplayers.splice(currentPlayerIndex,1);
			return otherplayers;
		},
	protected : function (parentContext, id) {
		var protected = parentContext.protected;
		if (protected.indexOf(id) > -1) {
			return true;
		} else { return false;}
	},
	result : function () {
		return Session.get("result");
	}
});


Template.priestModal.events({
	'submit form' : function (evt,template) {
		evt.preventDefault();
		var data = $("#priestform :input").serializeArray();
		var targetPlayerId = data[0].value,
			priest = {"type":"Priest","value":"2"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), priest, 0, targetPlayerId, function (error, result) {
	        Session.set("result",result);
	    });
	},
	'click #priestok' : function () {
		delete Session.keys['result'];
		$('#priestModal').modal('hide');
	}
});

Template.baronModal.helpers({
	otherPlayers : function () {
			var otherplayers = this.currentTurn.slice(),
				currentPlayerIndex = otherplayers.indexOf(Meteor.userId());
			otherplayers.splice(currentPlayerIndex,1);
			return otherplayers;
		},
	protected : function (parentContext, id) {
		var protected = parentContext.protected;
		if (protected.indexOf(id) > -1) {
			return true;
		} else { return false;}
	},
});


Template.baronModal.events({
	'submit form' : function (evt,template) {
		evt.preventDefault();
		var data = $("#baronform :input").serializeArray();
		var targetPlayerId = data[0].value,
			baron = {"type":"Baron","value":"3"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), baron, 0, targetPlayerId);
		$('#baronModal').modal('hide');
	}
});

Template.princeModal.helpers({
	protected : function (parentContext, id) {
		var protected = parentContext.protected;
		if (protected.indexOf(id) > -1) {
			return true;
		} else { return false;}
	},
});


Template.princeModal.events({
	'submit form' : function (evt,template) {
		evt.preventDefault();
		var data = $("#princeform :input").serializeArray();
		var targetPlayerId = data[0].value,
			prince = {"type":"Prince","value":"5"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), prince, 0, targetPlayerId);
		$('#princeModal').modal('hide');
	}
});

Template.kingModal.helpers({
	otherPlayers : function () {
			var otherplayers = this.currentTurn.slice(),
				currentPlayerIndex = otherplayers.indexOf(Meteor.userId());
			otherplayers.splice(currentPlayerIndex,1);
			return otherplayers;
		},
	protected : function (parentContext, id) {
		var protected = parentContext.protected;
		if (protected.indexOf(id) > -1) {
			return true;
		} else { return false;}
	},
});


Template.kingModal.events({
	'submit form' : function (evt,template) {
		evt.preventDefault();
		var data = $("#kingform :input").serializeArray();
		var targetPlayerId = data[0].value,
			king = {"type":"King","value":"6"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), king, 0, targetPlayerId);
		$('#kingModal').modal('hide');
	}
});
