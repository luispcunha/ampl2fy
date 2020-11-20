import axios from 'axios';
import dotenv from 'dotenv';
import prompts from 'prompts';
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

auth(clientId, clientSecret, scope, port, async (tokens) => {
  console.log(tokens.accessToken);

  const spotify = new SpotifyAPI(tokens.accessToken);
  const userInfo = await spotify.getUserProfile();
  const userID = userInfo.id;

  console.log(`Welcome ${userInfo.display_name}!`);

  const info = await spotify.createPlaylist(userID, 'teste', 'just created', false);
  console.log(info);

  // const input = await prompts({
  //   type: 'text',
  //   name: 'url',
  //   message: 'Which Apple Music playlist would you like to convert?',
  //   validate: (url: string) => (url.startsWith('https://music.apple.com/us/playlist') ? true : 'That doesn\'t look like a valid url :('),
  // });

  // const response = await axios.get(input.url);
  // const html: string = response.data;

  // console.log(Scraper.getPlaylist(html));
});
