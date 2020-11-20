import axios from 'axios';
import dotenv from 'dotenv';
import prompts from 'prompts';
import Scraper from './scraper/Scraper';
import { auth } from './auth/auth';

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

auth(clientId, clientSecret, port, async (tokens) => {
  console.log(tokens);

  const input = await prompts({
    type: 'text',
    name: 'url',
    message: 'Which Apple Music playlist would you like to convert?',
    validate: (url: string) => (url.startsWith('https://music.apple.com/us/playlist') ? true : 'That doesn\'t look like a valid url :('),
  });

  const response = await axios.get(input.url);
  const html: string = response.data;

  console.log(Scraper.getPlaylist(html));
});
