import axios from 'axios';
import program from 'commander';
import dotenv from 'dotenv';
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

program
  .version('1.0.0')
  .option('-pl, --playlist <url>', 'Apple Music playlist URL');
program.parse(process.argv);

const url = program.playlist;

auth(clientId, clientSecret, port, async (tokens) => {
  console.log(tokens);

  if (url === undefined) {
    return;
  }

  const response = await axios.get(url);
  const html: string = response.data;

  console.log(Scraper.getPlaylist(html));
});
