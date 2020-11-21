import axios, { AxiosInstance } from 'axios';
import { Song } from '../model/Song';

export default class SpotifyAPI {
  instance: AxiosInstance;

  constructor(accessToken: string) {
    this.instance = axios.create({
      baseURL: 'https://api.spotify.com',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async getUserProfile() {
    const info = await this.instance.get('v1/me');
    return info.data;
  }

  async createPlaylist(user: string, name: string, description: string, isPublic = false) {
    const response = await this.instance.post(`v1/users/${user}/playlists`, {
      name, description, public: isPublic,
    });
    return response.data.id;
  }

  async search(query: string, type: string, limit: number) {
    const results = await this.instance.get('v1/search', {
      params: {
        q: query, type, limit,
      },
    });

    return results;
  }

  async addTracksPlaylist(playlistID: string, uris: string[]) {
    const response = await this.instance.post(`v1/playlists/${playlistID}/tracks`, { uris });

    return response.status;
  }

  async searchClosestTrack(song: Song): Promise<string> {
    const query = `${song.title}`; // album:${song.album} artist:${song.artist}`;
    const results = await this.search(query, 'track', 1);
    return results.data.tracks.items[0].uri;
  }
}
