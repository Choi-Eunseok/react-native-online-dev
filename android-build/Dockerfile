FROM node:22-slim

ENV DEBIAN_FRONTEND=noninteractive

ARG SDK_VERSION=commandlinetools-linux-11076708_latest.zip
ARG ANDROID_BUILD_VERSION=35
ARG ANDROID_TOOLS_VERSION=35.0.0
ARG NDK_VERSION=27.1.12297006
ARG NODE_VERSION=20.18
ARG WATCHMAN_VERSION=4.9.0
ARG CMAKE_VERSION=3.30.5

ENV ADB_INSTALL_TIMEOUT=10
ENV ANDROID_HOME=/opt/android
ENV ANDROID_SDK_ROOT=${ANDROID_HOME}
ENV ANDROID_NDK_HOME=${ANDROID_HOME}/ndk/$NDK_VERSION

RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ]; then \
        export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-arm64; \
    else \
        export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64; \
    fi

ENV CMAKE_BIN_PATH=${ANDROID_HOME}/cmake/$CMAKE_VERSION/bin

ENV PATH=/usr/bin:${PATH}
ENV PATH=${CMAKE_BIN_PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/emulator:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${PATH}

RUN apt update -qq && apt install -y \
        curl \
        file \
        gcc \
        git \
        g++ \
        gnupg2 \
        libgl1 \
        make \
        openjdk-17-jdk \
        openssh-client \
        python3 \
        python3-distutils \
        unzip \
        xz-utils \
        ninja-build \
        zip \
        ccache \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean;

RUN curl -sS https://dl.google.com/android/repository/${SDK_VERSION} -o /tmp/sdk.zip \
    && mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && unzip -q -d ${ANDROID_HOME}/cmdline-tools /tmp/sdk.zip \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm /tmp/sdk.zip \
    && yes | sdkmanager --licenses \
    && yes | sdkmanager "platform-tools" \
        "platforms;android-$ANDROID_BUILD_VERSION" \
        "build-tools;$ANDROID_TOOLS_VERSION" \
        "cmake;$CMAKE_VERSION" \
        "ndk;$NDK_VERSION" \
    && rm -rf ${ANDROID_HOME}/.android \
    && chmod 777 -R /opt/android

# RUN dpkg --add-architecture amd64

# RUN cat > /etc/apt/sources.list.d/amd64.list <<EOF
# deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse
# deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ jammy-updates main restricted universe multiverse
# deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ jammy-security main restricted universe multiverse
# deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse
# EOF

# RUN apt update -qq || echo "apt update failed, continuing anyway"

# RUN apt install -y aptitude
# RUN aptitude install -y libc6:amd64 zlib1g:amd64
