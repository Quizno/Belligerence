(function() {
	'use strict';

	module.exports = {
		generateResponse: function(message, data, success, code) {
			this.header = 'Server response.';
			this.message = message || 'No message specified.';
			this.success = (success === undefined) ? true : success;
			this.count = (data ? (data.count || 0) : 0);
			this.data = ((data.rows || data) || '');
			this.code = (this.success ? (code || 200) : (code || 400));
		},
		setupPassport: function(app) {
			var config = require('./../config.js'),
				passport = require('passport'),

				nextTickFunction = function(identifier, profile, done) {
					process.nextTick(function () { profile.identifier = identifier;	return done(null, profile);	});
				},

			baseURL = (process.env.PROTOCOL + "://" + process.env.ADDRESS + ":" + process.env.APP_PORT + "/");

			if (process.env.NODE_ENV === "production") { baseURL = (process.env.PROTOCOL + "://" + process.env.ADDRESS + "/"); }

			passport.serializeUser(function(user, done) { done(null, user);	});
			passport.deserializeUser(function(obj, done) { done(null, obj);	});

			passport.use(this.getPassportSteam(baseURL, nextTickFunction));

			app.use(passport.initialize());
			app.use(passport.session());
		},
		getPassportSteam: function(baseURL, nextTickFunction) {
			var SteamStrategy = require('passport-steam').Strategy,
				steam_API_Key = process.env.API_KEY_STEAM;

			return new SteamStrategy({
				apiKey: steam_API_Key,
				returnURL: (baseURL + "auth/steam/return"),
				realm: baseURL
		  	}, nextTickFunction);
		},
		mountSession: function() {
			var session = require('express-session'),
				RedisStore = require('connect-redis')(session),

				sessionObject = {
					resave: false,
					saveUninitialized: true,
					https: true,
					proxy: true,

					name: process.env.SESSION_NAME,
					secret: process.env.SESSION_SECRET
				};

			if (process.env.NODE_ENV === "production") {
				var redisConnect = { url: process.env.REDISTOGO_URL, logErrors: true };
				sessionObject.store = new RedisStore(redisConnect);
			}

			return session(sessionObject);
		},
		closeServer: function() {
			console.log("SERVER STOPPED.");
			process.exit(0);
		},
		openServer: function(app) {
			console.log('Express server listening on port ' + app.get('port') + '.');
		}
	};

})();