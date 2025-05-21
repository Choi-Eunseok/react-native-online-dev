#!/bin/bash

sleep 10

ADB_IP=${ADB_IP:-"android"}
ADB_PORT=${ADB_PORT:-5555}

echo "Connecting to adb at $ADB_IP:$ADB_PORT..."
adb connect "$ADB_IP:$ADB_PORT"

RESOLUTION=$(adb shell wm size | grep -oE '[0-9]+x[0-9]+')
echo "Detected resolution: $RESOLUTION"

WIDTH=$(echo "$RESOLUTION" | cut -d'x' -f1)
HEIGHT=$(echo "$RESOLUTION" | cut -d'x' -f2)

echo "Starting Xvfb..."
Xvfb :1 -screen 0 ${WIDTH}x${HEIGHT}x24 &
export DISPLAY=:1
sleep 2

echo "Launching scrcpy..."
scrcpy \
  --window-title="Android" \
  --window-borderless \
  --no-audio \
  --window-width=$WIDTH \
  --render-driver=opengl \
  --turn-screen-off &
sleep 2

echo "Starting x11vnc..."
x11vnc -display :1 -noxdamage -forever -shared -nopw -rfbport 5900 &
sleep 2

echo "Starting websockify..."
websockify 0.0.0.0:5901 localhost:5900
