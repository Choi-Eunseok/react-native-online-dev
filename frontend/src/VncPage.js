import React, { useEffect, useState, useRef } from 'react';
import VncDisplay from 'react-vnc-display';
function VncPage() {
  const vncRef = useRef();
  const [resolution, setResolution] = useState({ width: 480, height: 800 });
  // const vncPort = process.env.REACT_APP_VNC_PORT || 5901;

  useEffect(() => {
    fetch('/vnc_resolution.txt')
      .then(res => res.text())
      .then(text => {
        const match = text.match(/([0-9]+)x([0-9]+)/);
        if (match) {
          setResolution({ width: Number(match[1]), height: Number(match[2]) });
        }
      });
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'ADB_KEY' && vncRef.current) {
        console.log("event.data.key", event.data.key);
        // VncDisplay 내부의 canvas에 키 이벤트를 강제로 트리거
        const canvas = vncRef.current.querySelector('canvas');
        if (canvas) {
          const evt = new KeyboardEvent('keydown', { key: event.data.key });
          canvas.dispatchEvent(evt);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div
      ref={vncRef}
      style={{
        width: resolution.width,
        height: resolution.height,
        background: "black",
        display: "flex",
      }}>
      <VncDisplay
        url={`wss://vnc.react-native.choies.dev`}
        showDotCursor
        scaleViewport={false}
        resizeSession={false}
        style={{
          width: resolution.width,
          height: resolution.height,
          border: "none"
        }}
      />
    </div>
  );
}

export default VncPage;