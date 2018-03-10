/**
 https://developers.caffeina.com/reverse-engineering-spotify-and-chromecast-protocols-to-let-my-vocal-assistant-play-music-ada4767efa2
 **/
var Client = require('castv2-client').Client;
var Spotify = require('./Spotify');
var mdns = require('mdns');

module.exports = function turnOnTvAndPlayUri(uri, offset) {
    return new Promise(function (resolve, reject) {

        //fix for raspberry: https://stackoverflow.com/a/36605224/1937797
        var sequence = [
            mdns.rst.DNSServiceResolve(),
            'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families: [4]}),
            mdns.rst.makeAddressesUnique()
        ];

        var browser = mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence});

        browser.on('serviceUp', function (service) {
            console.log('found device "%s" at %s:%d', service.txtRecord.fn, service.addresses[0], service.port);

            console.log(service.txtRecord.fn);
            if (service.txtRecord.fn === process.env.DEVICE_NAME) {
                ondeviceup(service.addresses[0], service.txtRecord.fn);
                browser.stop();
                if (browserTimeout) {
                    clearTimeout(browserTimeout);
                }
            }
        });

        browser.start();
        var browserTimeout = setTimeout(function () {
            browser.stop();
            reject('Timeout. Couldn\t find device ' + process.env.DEVICE_NAME + ' in 10s.');
        }, 10000); //Stop looking for devices after 10s.

        function ondeviceup(host, device_name) {
            var client = new Client();
            client.connect(host, function () {
                console.log('connected, launching Spotify app on ' + device_name + '...');
                client.launch(Spotify, function (err, player) {

                    player
                        .authenticate({
                            username: process.env.SPOTIFY_USERNAME,
                            password: process.env.SPOTIFY_PASSWORD,
                            device_name: process.env.DEVICE_NAME
                        })
                        .then(function () {
                            console.log('Authentication OK');
                            return player.play({
                                context_uri: uri,
                                offset: offset || 0
                            });
                        })
                        .then(function () {
                            console.log('Play OK');
                            return new Promise(function (resolve) {
                                setTimeout(function () {
                                    player.getAPI().setShuffle({state: true});
                                    resolve();
                                }, 5000);
                            })
                        })
                        .then(function () {
                            console.log('Shuffle OK');
                            resolve(player);
                        })
                        .catch(function (err) {
                            console.error('An error occurred', err);
                            reject(err);
                        })
                });
            });

            client.on('error', function (err) {
                console.log('Error: %s', err.message);
                client.close();
                reject(err);
            });
        }
    })
};