var SpotifyWebApi = require('spotify-web-api-node');
var lyr = require('lyrics-fetcher');
var chalk = require('chalk');
var config = require('./config');

var parseArgs = require('minimist');

var args = parseArgs(process.argv.slice(2));

var userID = args.user || config.user;
var playlistID = args.playlist || config.user;
var spotifyURI = args.uri || config.uri;

// spotify:user:staedlermars:playlist:4GKNHHY0Hueyd14nNKsgP7

if (spotifyURI) {
  var splitURI = spotifyURI.split(':');
  var userID = splitURI[1] === 'user' ? splitURI[2] : undefined;
  var playlistID = splitURI[3] === 'playlist' ? splitURI[4] : undefined;
}

if (!userID || !playlistID) {
  var err = new Error();
  err.name = 'NotEnoughDetails';
  err.message = 'Please supply a playlist and user';
  throw Error(err);
}

var profanities = ['shit', ' ass ', ' damn', 'fuck', 'bitch', ' cunt'];

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : args.clientid || config.spotifyClientId,
  clientSecret : args.clientsecret || config.spotifyClientSecret,
});

spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    console.log('The access token expires in ' + data.body.expires_in);
    console.log('The access token is ' + data.body.access_token);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body.access_token);

    return spotifyApi.getPlaylist(userID, playlistID);
  }, function(err) {
    console.log(chalk.red('Something went wrong when retrieving an access token', err));
  }).then(function (data) {
    data.body.tracks.items.forEach(function (track, idx) {

      var artistName = track.track.artists[0].name;
      // Remove a part of the track name that might be like " - Remastered etc"
      var trackName = track.track.name
                        .split(' - ')[0]
                        .split(' (feat. ')[0];
      fetchLyrics(artistName, trackName);

    });
  }, function (err) {
    console.log(chalk.red('Something went wrong getting the playlist!', err));
  });

function fetchLyrics (artistName, trackName) {
  lyr.fetch(artistName, trackName, function (err, lyrics) {
    if (err) {
      console.log(chalk.red("Error", err));
    } else if (lyrics !== "Sorry, We don't have lyrics for this song yet.") {
      var foundProfanities = profanities.filter(function (pro) { return lyrics.indexOf(pro) !== -1; });
      if (foundProfanities.length > 0) {
        console.log(artistName, '-', trackName, 'contains:', chalk.red(foundProfanities.join(', ')));
      } else {
        console.log(artistName, '-', trackName, 'is clean');
      }
    } else {
      console.log(chalk.red("Couldn't find artist", artistName, '-', trackName, ' - trying a name variation.'));
      fetchLyrics(artistName.replace('&', 'and'), trackName);
    }
  });
}
