let accessToken;
const clientID = 'f5a04a4c62e94f6e96ee16b429d59bc9';
const redirectUri = 'http://localhost:3000/';


const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }
        // check for access token match 
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
        // This clears the parameters from the URL, so the app doesn’t try grabbing the access token after it has expired
        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`
            window.location = accessUrl;
        }
    },

    search(searchTerm) {
        const accessToken = this.getAccessToken();
        const endPoint = `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;
        return fetch(endPoint, { 
            headers: {Authorization: `Bearer ${accessToken}`}
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if(!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));
        });
          
    },
    savePlaylist(playlistName, trackUris) {
        if(!playlistName || !trackUris.length) {
            return;
        }
        const accessToken = Spotify.getAccessToken();
        const headers =  { Authorization: `Bearer ${accessToken}` };
        let userId;

       return fetch('https://api.spotify.com/v1/me', {headers: headers})
       .then(response => {
           return response.json();
       }).then(jsonResponse => {
           userId = jsonResponse.id
           return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({name: playlistName})
        }).then(response => response.json()).then(jsonResponse => {
            const playlistId = jsonResponse.id
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({uris: trackUris})
            })    
        })
       })
    }
};


export default Spotify;