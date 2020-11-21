import axios, { AxiosInstance } from 'axios';

type SearchResultType = 'album' | 'artist' | 'track' | 'playlist' | 'show' | 'episode';

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

  async search(query: string, type: SearchResultType[], limit: number) {
    const results = await this.instance.get('v1/search', {
      params: {
        q: query, type: type.join(','), limit,
      },
    });

    return results;
  }

  async addTracksPlaylist(playlistID: string, uris: string[]) {
    const response = await this.instance.post(`v1/playlists/${playlistID}/tracks`, { uris });

    return response.status;
  }

  async searchTrack(title: string, artist: string, limit: number) {
    const cleanTitle = title.replace(/[,.!?]/g, ' ');

    const query = `${cleanTitle} artist:${artist}`;
    const results = await this.search(query, ['track'], limit);

    return results.data.tracks.items;
  }
}
