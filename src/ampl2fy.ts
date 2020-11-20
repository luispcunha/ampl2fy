import axios from 'axios';
import program from 'commander';
import dotenv from 'dotenv';
import Scraper from './scraper/Scraper';

(async () => {
  dotenv.config();

  program
    .version('1.0.0')
    .option('-pl, --playlist <url>', 'Apple Music playlist URL');

  program.parse(process.argv);

  const url = program.playlist;

  const response = await axios.get(url);
  const html: string = response.data;

  console.log(Scraper.getPlaylist(html));
})();
