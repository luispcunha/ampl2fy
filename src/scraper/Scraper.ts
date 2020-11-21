import cheerio from 'cheerio';
import { Playlist } from '../model/Playlist';
import { Song } from '../model/Song';

export default class Scraper {
  static getPlaylist(html: string): Playlist {
    const $ = cheerio.load(html);

    const titles: string[] = [];
    const artists: string[] = [];
    const titlesElem = $('div.song-wrapper.two-lines');
    titlesElem.each((i, elem) => {
      const title: string = $(elem).find('.song-name').text().trim();
      const artist: string = $(elem).find('.dt-link-to').text().trim();
      titles.push(title);
      artists.push(artist);
    });

    const albums: string[] = [];
    const albumsElem = $('div.col.col-album').not('.typography-footnote');
    albumsElem.each((i, elem) => {
      const album: string = $(elem).find('.dt-link-to').text().trim();
      albums.push(album);
    });

    const durations: number[] = [];
    const durationsElem = $('div.col.col-time').not('.typography-footnote');
    durationsElem.each((i, elem) => {
      const durationSplit = $(elem).find('.time-data').text()
        .trim()
        .split(':')
        .reverse();

      let duration = 0;
      durationSplit.forEach((num, exp) => {
        duration += 60 ** exp * parseInt(num, 10);
      });

      durations.push(duration);
    });

    const songs: Song[] = [];
    titles.forEach((title, i) => {
      songs.push({
        title,
        album: albums[i],
        artist: artists[i],
        duration: durations[i],
      });
    });

    const description = $('div.product-page-header__notes > div > div > span > p').children().remove().end()
      .text()
      .trim();

    const name = $('#page-container__first-linked-element').text().trim();

    return {
      name,
      description,
      songs,
    };
  }
}
