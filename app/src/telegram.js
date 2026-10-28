// Safely talks to the Telegram Mini Apps JS SDK when the game is opened
// inside Telegram (window.Telegram.WebApp). Everywhere else — Expo Go, a
// plain browser, a native build — these calls are simply no-ops.
export function initTelegramWebApp() {
  if (typeof window === 'undefined' || !window.Telegram || !window.Telegram.WebApp) {
    return null;
  }
  const tg = window.Telegram.WebApp;
  try {
    tg.ready();
    tg.expand();
    if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
    if (tg.setHeaderColor) tg.setHeaderColor('#0f172a');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#0f172a');
  } catch (err) {
    // Telegram SDK quirks shouldn't ever break the game itself.
  }
  return tg;
}
