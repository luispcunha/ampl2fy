import axios, { AxiosInstance } from 'axios';

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

  async createPlaylist(user: string, name: string, description: string, isPublic: boolean) {
    const response = await this.instance.post(`v1/users/${user}/playlists`, {
      name, description, public: isPublic,
    });
    return response;
  }

  async searchTracks(query: string, limit: number) {
    const results = await this.instance.get('v1/search', {
      params: {
        q: query, type: 'track', limit,
      },
    });

    return results.data.tracks.items;
  }
}
