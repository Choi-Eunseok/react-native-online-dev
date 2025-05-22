#!/bin/bash
set -euo pipefail

sleep 10

ADB_IP=${ADB_IP:-"localhost"}
ADB_PORT=${ADB_PORT:-5555}
METRO_PORT=${METRO_PORT:-8081}

echo "Connecting to adb at $ADB_IP:$ADB_PORT..."
adb connect "$ADB_IP:$ADB_PORT"

echo "Connected to adb at $ADB_IP:$ADB_PORT"

cd /app/MobileApp
yarn install

echo "Installing APK to device..."
npx react-native run-android --no-packager

echo "✅ Done! APK installed to device."

adb -s "$ADB_IP:$ADB_PORT" reverse --remove-all

echo "adb -s $ADB_IP:$ADB_PORT reverse tcp:8081 tcp:$METRO_PORT"
adb -s "$ADB_IP:$ADB_PORT" reverse tcp:8081 tcp:$METRO_PORT