import axios from 'axios';
import Scraper from './scraper/Scraper';

const url = 'https://music.apple.com/us/playlist/radiohead-influences/pl.1631c4a4658f43b88cc409c4ebb9c8fb';

async function getData() {
  const response = await axios.get(url);
  const html: string = response.data;

  console.log(Scraper.getPlaylist(html));
}

getData();
