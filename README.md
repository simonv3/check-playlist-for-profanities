```
node index.js --clientid=<spotify-client-id> --clientsecret=<spotify-client-secret> [--user=<spotify-user-id> --playlist=<spotify-playlist-id> | --uri=<spotify-playlist-uri>]
```

or a `config.json` with:

```
{
  "spotifyClientId": "<spotify-client-id>",
  "spotifyClientSecret": "<spotify-client-secret"
}
```

and then:

```
node index.js [--user=<spotify-user-id> --playlist=<spotify-playlist-id> | --uri=<spotify-playlist-uri>]
```
