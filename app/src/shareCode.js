import { Platform, Share } from 'react-native';

// react-native's Share API isn't implemented the same way on web (and some
// browsers/webviews — including Telegram's — don't support navigator.share).
// This tries the best option available and silently does nothing if none work;
// the room code is always visible on screen regardless.
export async function shareRoomCode(code) {
  const message = `Заходи в игру! Код комнаты: ${code}`;

  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: message });
        return true;
      } catch (err) {
        // user cancelled, or unsupported — fall through to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(message);
        return 'copied';
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  try {
    await Share.share({ message });
    return true;
  } catch (err) {
    return false;
  }
}
