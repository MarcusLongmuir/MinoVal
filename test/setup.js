var logger = require('tracer').console();
var globals = require('./globals');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var MinoVal = require('../minoval');

module.exports = function(done) {
	this.timeout(200000);
	MongoClient.connect(globals.db_address, function(err, db) {
		db.dropDatabase(function(err, res) {
			assert.equal(err, null);
			assert.equal(res, true);
			var MinoDB = require('minodb');
			var mino = new MinoDB({
			    api: true,
			    ui: true,
			    db_address: globals.db_address
			}, "testuser")

			var MinoSDK = require('minosdk');
			var sdk = new MinoSDK("MinoDB");
			sdk.set_local_api(mino.api);

			globals.sdk = sdk;
			globals.mino = mino;
			
			mino.api.connect_callbacks.push(function() {
				mino.create_user({
	                username: "testuser",
	                email: "test@minocloud.com",
	                password: "my_password"
				}, function(user_err, user_res){
	                logger.log(JSON.stringify(user_err, null, 4), user_res);

					mino.create_user({
		                username: "otheruser",
		                email: "test@minocloud.com",
		                password: "my_password"
					}, function(user_err, user_res){
					    logger.log(JSON.stringify(user_err, null, 4), user_res);
						
					    var minoval = new MinoVal({
					    	user: "testuser"
					    });
					    globals.mino.add_plugin(minoval);
					    globals.minoval = minoval;
						done();
					})
	            })
			});

		});
	});


}