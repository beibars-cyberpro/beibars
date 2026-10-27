#!/bin/bash
cd "$(dirname "$0")"

if [ ! -f "src/config.js" ]; then
  cp src/config.example.js src/config.js
  echo "First run: created src/config.js from the example."
  echo "Edit src/config.js and put in your computer's IP address, then run this again."
  echo "(Open the 'app' folder in Finder, open src/config.js with TextEdit.)"
  read -p "Press Enter to close this window..."
  exit 0
fi

echo "Starting the app... scan the QR code below with Expo Go on your phone."
echo ""
npm install
npx expo start
