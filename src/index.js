var express = require("express");
var app = express();
var exec = require("child_process").exec;
var schedule = require("node-schedule");
var spotifyChromecast = require('./spotify-chromecast')
var https = require('https');
var http = require('http')
var fs = require('fs');

var scheduled = null;

app.get("/", function (req, res) {
    res.send("hello!");
});

app.get("/on", function (req, res) {
    turnOnTV().then(function () {
        res.send("Turned on!");
    });
});

app.get("/off", function (req, res) {
    turnOffTV().then(function () {
        res.send("Turned off!");
    });
});

app.get("/status", function (req, res) {
    getStatus().then(function (status) {
        res.send(status);
    })
        .catch(function (err) {
            res.status(500).send(err);
        })
});

app.get("/scheduled-off/:minutes", function (req, res) {
    var date = new Date();
    date.setMinutes(date.getMinutes() + parseInt(req.params.minutes, 10));

    if (scheduled) {
        scheduled.cancel();
    }
    scheduled = schedule.scheduleJob(date, () => {
        turnOffTV();
    });
    res.send(`scheduled to ${date}`);
});

app.get("/schedule-cancel", function (req, res) {
    var date = new Date();
    date.setMinutes(date.getMinutes() + 1);

    if (scheduled) {
        scheduled.cancel();
        scheduled = null;
        res.send(`scheduled cancelled`);
    } else {
        res.send(`there was no scheduled task`);
    }
    res.send(`scheduled to ${date}`);
});


app.get("/spotify-start", function (req, res) {
    var playlists = ['spotify:user:spotify:playlist:37i9dQZF1DWTAMSh8IEIUc', 'spotify:user:spotify:playlist:37i9dQZF1DX50QitC6Oqtn', 'spotify:user:spotify:playlist:37i9dQZF1DX3tuWZaHjp5y', 'spotify:user:spotify:playlist:37i9dQZF1DWSv6cu78Irsc', 'spotify:user:spotify:playlist:37i9dQZF1DWSXBu5naYCM9']
    var playlistUri = playlists[Math.floor(Math.random() * playlists.length)];
    var offset = {position: Math.random() * (10 - 1) + 1};
    handleSpotifyOn(req, res, playlistUri, offset)
});

app.get("/spotify-start/:uri", function (req, res) {
    handleSpotifyOn(req, res, req.params.uri)
});

function handleSpotifyOn(req, res, uri, offset) {
    getStatus()
        .then(function (status) {
            if (status === "on") {
                turnOnSpotify(res, uri, offset);
            }
            else {
                turnOnTV().then(function () {
                    setTimeout(function () {
                        turnOnSpotify(res, uri, offset);
                    }, 10000)
                });
            }
        })
        .catch(function (err) {
            res.status(500).send(err)
        })
}

function turnOnSpotify(res, uri, offset) {
    spotifyChromecast(uri, offset)
        .then(function () {
            res.status(200).send("Music started.");
        })
        .catch(function (err) {
            res.status(500).send(err);
        })
}

function turnOffTV() {
    return new Promise(function (resolve, reject) {
        exec("echo standby 0 | cec-client -s -d 1", function (err, result) {
            if (err) {
                reject(err)
            }
            resolve();
        });

    });
}

function turnOnTV() {
    return new Promise(resolve => {
        exec("echo on 0 | cec-client -s -d 1", (err, result) => {
            if (err) {
                throw new Error(err);
            }
            resolve()
        });
    })
}

function getStatus() {
    return new Promise(resolve => {
        exec("echo pow 0 | cec-client -s -d 1", (err, result) => {
            if (err) {
                throw new Error(err);
            }
            var state = result.split(': ').pop();
            resolve(state)
        });
    })
}


var port = process.env.PORT || 3000;

var sslPath = process.env.SSL_PATH;
if (sslPath) {
    var sslPort = process.env.SSL_PORT || 443;
    var options = {
        key: fs.readFileSync(sslPath + 'privkey.pem'),
        cert: fs.readFileSync(sslPath + 'fullchain.pem')
    };

    var sslServer = https.createServer(options, app);
    sslServer.listen(sslPort, () => console.log("Example app listening on ssl port " + sslPort));
}

var server = http.createServer(app);
server.listen(port, () => console.log("Example app listening on port " + port));
