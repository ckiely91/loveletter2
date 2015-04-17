Jasmine.onTest(function () {
  describe('When you create a new GameFactory', function() {
      
      //Set up data.
      var firstPlayerName = "playerID-0000";

      //Set up game.
      var result = GameFactory.createGame(firstPlayerName);

      it("it should have the inProgress flag set to false.", function() {
          expect(result.inProgress).toBe(false);
      });

      it("it should have the owner set to the player ID.", function() {
          expect(result.owner).toBe(firstPlayerName);
      });

      
  });
});
