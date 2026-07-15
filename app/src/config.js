// Point this at your backend server.
// - Same WiFi/local testing: use your computer's LAN IP, e.g. "http://192.168.1.23:3001"
//   (find it with `ipconfig getifaddr en0` on Mac or `ipconfig` on Windows).
// - Deployed backend (Render/Railway/Fly.io): use the https URL it gives you, e.g.
//   "https://quizduel-server.onrender.com"
// Both phones must use the SAME value here to end up in the same game.
export const SERVER_URL = 'http://192.168.1.23:3001';
