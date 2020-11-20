import express from 'express';
import querystring from 'querystring';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import axios from 'axios';

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

// eslint-disable-next-line no-unused-vars
type CallbackType = (t: AuthTokens) => void;

function auth(
  clientId: string,
  clientSecret: string,
  scope: string,
  port: string,
  callback: CallbackType,
): void {
  const stateKey = 'spotify_auth_state';

  const app = express();
  app.use(cors()).use(cookieParser());
  const server = app.listen(process.env.PORT, () => {
    console.log(`Access http://localhost:${port}/login and log in to your Spotify account.`);
  });

  app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);

    const redirectUri = `http://localhost:${port}/callback`;

    const query = querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
    });
    const authUrl = `https://accounts.spotify.com/authorize?${query}`;

    res.redirect(authUrl);
  });

  app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/fail');
      return;
    }

    res.clearCookie(stateKey);
    const redirectUri = `http://localhost:${port}/callback`;

    try {
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: `${code}`,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      });

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      res.redirect('/success');

      callback({
        accessToken,
        refreshToken,
      });
    } catch (err) {
      console.log(err);
    } finally {
      server.close();
    }
  });

  app.get('/success', (req, res) => {
    res.send('Logged in successfuly!');
  });

  app.get('/fail', (req, res) => {
    res.send('Failed to log in!');
  });
}

export { AuthTokens, auth };
