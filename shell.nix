let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-unstable";
  pkgs = import nixpkgs { config = {
    allowUnfree = true;
  }; overlays = []; };
in

pkgs.mkShellNoCC {
  packages = with pkgs; [
    aube
    bun
    mongodb-ce
    mongosh
    imagemagick
    ollama
    procps
    ffmpeg
    whisper-cpp
    curl
    cacert
  ];

  shellHook = ''
    export SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
    export NIX_SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"

    if [ -f .env ]; then
      set -a
      source .env
      set +a
    fi

    mkdir -p ./.mongodb

    if ! mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
      mongod \
        --dbpath ./.mongodb \
        --bind_ip 127.0.0.1 \
        --port 27017 \
        --logpath ./.mongodb/db.log \
        --logappend &
    fi

    mongosh "$MONGO_APP" --eval "
      if (!db.getUser('$MONGO_USER')) {
        db.createUser({
          user: '$MONGO_USER',
          pwd: '$MONGO_PASS',
          roles: [
            { role: 'readWrite', db: '$MONGO_APP' }
          ]
        });
      }
    "

    ollama pull "$AI_MODEL"

    if [ ! -f models/ggml-base.en.bin ]; then
      mkdir -p models
      curl -L -o models/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
    fi

    aube install
  '';
}
