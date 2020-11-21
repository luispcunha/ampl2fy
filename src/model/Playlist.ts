import { Song } from './Song';

export interface Playlist {
  name: string
  description: string
  songs: Song[]
}
