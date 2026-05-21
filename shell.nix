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
  ];

  shellHook = ''
    if [ -f .env ]; then
      set -a
      source .env
      set +a
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
    aube install
  '';
}
