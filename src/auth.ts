import express from 'express';
import querystring from 'querystring';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import axios from 'axios';

dotenv.config();

const stateKey = 'spotify_auth_state';

const app = express();
app.use(cors()).use(cookieParser());

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = 'user-read-private user-read-email';
  const redirectUri = `http://localhost:${process.env.PORT}/callback`;

  const query = querystring.stringify({
    response_type: 'code',
    client_id: process.env.CLIENT_ID,
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
  const redirectUri = `http://localhost:${process.env.PORT}/callback`;

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
        Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
      },
    });

    const accessToken = response.data.access_token;

    console.log(accessToken);

    res.redirect('/success');
  } catch (err) {
    console.log(err);
  }
});

app.get('/success', (req, res) => {
  res.send('Logged in successfuly!');
});

app.get('/fail', (req, res) => {
  res.send('Failed to log in!');
});

app.listen(process.env.PORT, () => {
  console.log(`Access http://localhost:${process.env.PORT}/login and log in to your Spotify account.`);
});
