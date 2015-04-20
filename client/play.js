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

Template.betweenRounds.events({
	'click #startRound': function(evt,template) {
		Meteor.call('startRound',template.data._id);
	}
})


Template.gamelog.helpers({
	gamelog : function() {
		return this.log.slice(-8).reverse();
	},
	friendlytime : function(time) {
		return moment(time).fromNow();
	}
});

Template.gamelog.events({
	'click #viewLog' : function() {
		$('#gamelogModal').modal();
	}
});

Template.gamelogModal.helpers({
	gamelog : function() {
		return this.log.slice().reverse();
	},
	friendlytime : function(time) {
		return moment(time).fromNow();
	}
});

Template.game.helpers({
	isEliminated: function() {
		if (this.eliminated){
			if (this.eliminated.indexOf(Meteor.userId()) > -1) {
		return true;
		} else { return false;}
		}
	}
});

Template.game.events({
	'click #viewDiscards' : function() {
		$('#discardModal').modal();
	}
});

Template.playerTurn.helpers({
	protected : function (parentContext, id) {
		var protected = parentContext.protected;
		if (protected.indexOf(id) > -1) {
			return true;
		} else { return false;}
	}
})

Template.deck.helpers({
	cardsLeft : function () {
		var deck = this.deck;

		if (deck.length == 0) {
			return "No cards left";
		} else if (deck.length == 1) {
			return "1 card left";
		} else {
			return deck.length + " cards left.";
		}
	},
	cardsLeftCount: function () {
		return this.deck.length;
	}
})



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
				Meteor.call('deckEmpty', template.data._id);
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
					alert("Click the deck to draw a card first.");
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

					if (template.data.lastTurn == true) {
						Meteor.call('endRoundEmptyDeck', template.data._id);
					}
				}
			
			
		}
	}
});

Template.discardModal.helpers({
	discardCards: function (parentContext)  {
		var result = [];

		for (var i = parentContext.players.length - 1; i >= 0; i--) {
			result.push(parentContext.discards[i].discards);
		};

		return result;
	}
})

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
		var data = $("#guardform :input").serializeArray();
		var targetPlayerId = data[0].value,
			cardType = data[1].value,
			guard = {"type":"Guard","value":"1"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), guard, cardType, targetPlayerId);
		evt.preventDefault();
		document.getElementById("guardform").reset();
		

		if (template.data.lastTurn == true) {
			Meteor.call('endRoundEmptyDeck', template.data._id);
		} 

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
	'click .priestbutton' : function (evt,template) {
		var targetPlayerId = evt.target.value,
			priest = {"type":"Priest","value":"2"};
		
		Meteor.call('playCard', template.data._id, Meteor.userId(), priest, 0, targetPlayerId, function (error, result) {
	        Session.set("result",result);
	    });

	    if (template.data.lastTurn == true) {
			$('#priestModal').modal('hide');
			Meteor.call('endRoundEmptyDeck', template.data._id);
		}
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
	'click .baronbutton' : function (evt,template) {
		var targetPlayerId = evt.target.value,
			baron = {"type":"Baron","value":"3"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), baron, 0, targetPlayerId);
		document.getElementById("baronform").reset();
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
	'click .princebutton' : function (evt,template) {
		var targetPlayerId = evt.target.value,
			prince = {"type":"Prince","value":"5"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), prince, 0, targetPlayerId);

		if (template.data.lastTurn == true) {
			Meteor.call('endRoundEmptyDeck', template.data._id);
		}

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
	'click .kingbutton' : function (evt,template) {
		var targetPlayerId = evt.target.value,
			king = {"type":"King","value":"6"};
			
		Meteor.call('playCard', template.data._id, Meteor.userId(), king, 0, targetPlayerId);
		document.getElementById("kingform").reset();

		if (template.data.lastTurn == true) {
			Meteor.call('endRoundEmptyDeck', template.data._id);
		} 

		$('#kingModal').modal('hide');
	}
});