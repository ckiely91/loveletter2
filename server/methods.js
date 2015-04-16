Future = Npm.require('fibers/future');

Meteor.methods({
    'createGame': function() {
        var fut = new Future();
        setTimeout(
            Meteor.bindEnvironment(
                function() {
                	var game = {"test":1};
                    var result = Games.insert(game);
                    console.log(result);
                    fut.return(result);
                },
                function(exception) {
                    console.log("Exception : ", exception);
                    fut.throw(new Error("Async function throw exception"));
                }
            ),
            1000
        )
        return fut.wait();
    }
});