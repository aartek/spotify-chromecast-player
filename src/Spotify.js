const util = require('util');
const castv2Cli = require('castv2-client');
const Application = castv2Cli.Application;
const MediaController = castv2Cli.MediaController;
const SpotifyController = require('./SpotifyController');

function Spotify(client, session) {
    Application.apply(this, arguments);

    this.media = this.createController(MediaController);
    this.spotify = this.createController(SpotifyController);

    this.media.on('status', (status) => {
        this.emit('status', status);
    });
}

Spotify.APP_ID = 'CC32E753';
util.inherits(Spotify, Application);

Spotify.prototype.authenticate = function () {
    return this.spotify.authenticate.apply(this.spotify, arguments);
};

Spotify.prototype.play = function () {
    return this.spotify.play.apply(this.spotify, arguments);
};

Spotify.prototype.pause = function () {
    return this.spotify.pause.apply(this.spotify, arguments);
};

Spotify.prototype.getAPI = function () {
    return this.spotify.getAPI.apply(this.spotify, arguments);
};

module.exports = Spotify;
