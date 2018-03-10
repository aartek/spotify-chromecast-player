var util = require('util');
var castv2Cli = require('castv2-client');
var RequestResponseController = castv2Cli.RequestResponseController;
var SpotifyWPAT = require('./spotify-wat');
var SpotifyWebApi = require('spotify-web-api-node');

function SpotifyController(client, sourceId, destinationId) {
	RequestResponseController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.spotify.chromecast.secure.v1');
}

util.inherits(SpotifyController, RequestResponseController);

SpotifyController.prototype.authenticate = function ({ username, password, device_name }) {
	var that = this;
	return new Promise(function (resolve, reject) {
		if (that.access_token != null) {
			return resolve();
		}

		that.device_name = device_name;

		SpotifyWPAT.getAccessToken(username, password).then(function (access_token) {
			that.access_token = access_token;

			that.api = new SpotifyWebApi({
				accessToken: that.access_token
			});

			// Send setCredentials request using web AT
			that.send({
				type: 'setCredentials',
				credentials: access_token
			});

			// Once Chromecast replies, get the list of the devices
			that.on('message', function (message) {
				if (message.type === 'setCredentialsResponse') {

					that.api.getMyDevices().then(function (response) {
						var devices = response.body.devices;
						var device = devices.find(e => e.name === that.device_name);
						that.device = device;

						resolve(that);
					})
				}
			});
		})

	});
};

SpotifyController.prototype.getAPI = function () {
	return this.api;
};

SpotifyController.prototype.play = function (opt) {
	var that = this;
	opt.deviceId = this.device.id;
	return that.api.play(opt);
};

SpotifyController.prototype.pause = function () {
	return this.api.pause({
		deviceId: this.device.id
	});
};

module.exports = SpotifyController;