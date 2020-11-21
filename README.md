# ampl2fy
Add **A**pple **M**usic **p**lay**l**ists to Spoti**fy**.

# Running the app
0. Make sure you have Node.js and npm installed, and clone the repository. 
1. Create a Client ID and Secret on the Spotify developer dashboard.
2. Add http://localhost:PORT/callback to the Redirect URIs on the application settings, being PORT whichever port you'd like to use.
3. Create a .env file with variables CLIENT_ID, CLIENT_SECRET, and PORT.
3. Install the dependencies with `npm i`.
4. Compile with `npm run build`.
5. Run with `npm start`.

# Usage

- Follow the link on the console to login to Spotify. Then, you will be prompted for a playlist URL (such as https://music.apple.com/us/playlist/talking-heads-influences/pl.843aa9cdc41d447690088ad920086378), and a namesake private playlist will be added to your library with the songs of the Apple Music playlist.
- The Spotify track that matches the Apple Music song is found by searching for tracks by name and artist. The first result that has a similar duration is used. However, due to song titles not always being consistent between both services, sometimes a matching song can't be found, in which case no song will be added to the playlist.
