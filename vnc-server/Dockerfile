FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV SCRCPY_VERSION=2.3.1
ENV DISPLAY=:1

RUN apt update && apt install -y \
    adb \
    git \
    meson \
    ninja-build \
    libsdl2-dev \
    libavcodec-dev \
    libavdevice-dev \
    libavformat-dev \
    libavutil-dev \
    libswresample-dev \
    libusb-1.0-0-dev \
    libudev-dev \
    pkg-config \
    ffmpeg \
    openjdk-17-jdk \
    x11vnc \
    xvfb \
    websockify \
    curl \
    && apt clean

RUN git clone --depth=1 --branch v${SCRCPY_VERSION} https://github.com/Genymobile/scrcpy.git /opt/scrcpy \
 && mkdir -p /opt/scrcpy/build \
 && cd /opt/scrcpy && meson setup build \
 && cd /opt/scrcpy && meson compile -C build \
 && cp /opt/scrcpy/build/app/scrcpy /usr/local/bin/scrcpy

RUN apt update && apt install -y curl \
 && mkdir -p /usr/local/share/scrcpy \
 && curl -Lo /usr/local/share/scrcpy/scrcpy-server https://github.com/Genymobile/scrcpy/releases/download/v${SCRCPY_VERSION}/scrcpy-server-v${SCRCPY_VERSION} \
 && chmod +x /usr/local/share/scrcpy/scrcpy-server

EXPOSE 5900 5901

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
