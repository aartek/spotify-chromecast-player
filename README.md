# Spotify Chromecast player (POC)

This app is able to turn on TV through [hdmi-cec](https://en.wikipedia.org/wiki/Consumer_Electronics_Control), find the TV and stream the music using Google Cast protocol.
App provides endpoints to
- turn on tv
```
http://localhost:3000/on
```
- turn off tv
```
http://localhost:3000/off
```
- check tv status (standby/on)
```
http://localhost:3000/status
```
- schedule turning off
```
http://localhost:3000/scheduled-off/{number_of_minutes}

i.e http://localhost:3000/scheduled-off/45 will turn off tv after 45 minutes

```
- cancel scheduled task
```
http://localhost:3000/schedule-cancel
```
- **play random Spotify playlist using Google Cast protocol**
It turns on the TV, starts streaming a playlist from predefined, hardcoded set, and turns on the shuffle mode
```
http://localhost:3000/spotify-start

```

- **play specified Spotify playlist using Google Cast protocol**
Like above but you can specify playlist uri with the url path
```
http://localhost:3000/spotify-start/{spotify-playlist-uri}

```


## Raspberry PI prerequisites

- Node.js 6.x
- cec-client (to turn on/off tv through hdmi)
```
sudo apt-get install cec-utils
```
- libavahi
```

sudo apt-get install libavahi-compat-libdnssd-dev
```


## How to start

Install dependencies
```
npm install
```

Export env variables
```
export DEVICE_NAME="49PUS6401/12"  #name of your chromecast device
export SSL_PATH="/etc/letsencrypt/live/example.com/"  # (Optional) directory with your cert
export SPOTIFY_USERNAME=...
export SPOTIFY_PASSWORD=...
````

Start the app
```
npm start
```


App should be available under http://localhost:3000. You can change the default port defining PORT env variable

## Let's encrypt
How to generate ssl certificate
https://medium.com/@yash.kulshrestha/using-lets-encrypt-with-express-e069c7abe625

## About
Based on this article https://developers.caffeina.com/reverse-engineering-spotify-and-chromecast-protocols-to-let-my-vocal-assistant-play-music-ada4767efa2 and this repo https://github.com/kopiro/spotify-castv2-client