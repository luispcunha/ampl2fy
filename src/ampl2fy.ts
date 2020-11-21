#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';
import prompts from 'prompts';
import { Song } from './model/Song';
import Scraper from './scraper/Scraper';
import SpotifyAPI from './spotify/api';
import { auth } from './spotify/auth';

dotenv.config();

const clientId = process.env.CLIENT_ID || null;
const clientSecret = process.env.CLIENT_SECRET || null;
const port = process.env.PORT || null;

if (clientId === null) {
  console.log('Please specify a CLIENT_ID environment variable in the .env file');
  process.exit(-1);
}

if (clientSecret === null) {
  console.log('Please specify a CLIENT_KEY environment variable in the .env file');
  process.exit(-1);
}

if (port === null) {
  console.log('Please specify a PORT environment variable in the .env file');
  process.exit(-1);
}

const scope = 'user-read-private playlist-modify-public playlist-modify-private playlist-read-private';

function chooseBestResult(results: any[], song: Song) {
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    const duration = result.duration_ms / 1000;

    if (song.duration < duration + 4 && song.duration > duration - 4) {
      return result;
    }
  }

  return false;
}

auth(clientId, clientSecret, scope, port, async (tokens) => {
  const spotify = new SpotifyAPI(tokens.accessToken);
  const userInfo = await spotify.getUserProfile();
  const userID = userInfo.id;

  console.log(`\nWelcome ${userInfo.display_name}!\n`);

  const input = await prompts({
    type: 'text',
    name: 'url',
    message: 'Which Apple Music playlist would you like to convert?',
    validate: (url: string) => (url.startsWith('https://music.apple.com/us/playlist') ? true : 'That doesn\'t look like a valid url :('),
  });

  console.log('\nFetching playlist data ...\n');
  const response = await axios.get(input.url);
  const html: string = response.data;

  const playlist = Scraper.getPlaylist(html);
  console.log('Apple Music playlist:');
  playlist.songs.forEach((song, i) => {
    console.log(`  ${i + 1}. ${song.title} - ${song.album} - by ${song.artist}`);
  });

  const searchPromises: any[] = [];

  playlist.songs.forEach((song) => {
    searchPromises.push(spotify.searchTrack(song.title, song.artist, 5));
  });

  const searchResults = await Promise.all(searchPromises);

  console.log('\nSpotify songs:');
  const trackURIs: string[] = [];
  for (let i = 0; i < searchResults.length; i += 1) {
    const bestResult = chooseBestResult(searchResults[i], playlist.songs[i]);

    if (bestResult.uri) {
      trackURIs.push(bestResult.uri);
      console.log(`  ${i + 1}. ${bestResult.name} - ${bestResult.album.name} - by ${bestResult.artists[0].name}`);
    } else {
      console.log(`  Didn't find a match for track ${i + 1} :(`);
    }
  }

  const playlistID = await spotify.createPlaylist(userID, playlist.name, playlist.description);
  await spotify.addTracksPlaylist(playlistID, trackURIs);

  console.log('\nSuccessfuly created Spotify playlist!');
});
