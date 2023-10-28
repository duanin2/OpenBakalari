{ pkgs ? import <nixpkgs> { } }: let
  nodegui-qt = pkgs.qt6Packages.env "qt-nodegui-${pkgs.qt6Packages.qtbase.version}" (with pkgs.qt6Packages; [ qtsvg ]);
  
  fhs = pkgs.buildFHSUserEnv {
    name = "fhs-env";
    targetPkgs = pkgs: with pkgs; [
      node2nix
      nodejs
      pnpm
      yarn
      cmake
    ];

    multiPkgs = pkgs: with pkgs; [
      libGL
      libxkbcommon
      fontconfig
      xorg.libX11
      xorg.libxcb
      glib
      freetype
      dbus
      (zlib.overrideAttrs (finalAttrs: prevAttrs: {
        version = "1.2.9";

        src = let
          inherit (finalAttrs) version;
        in fetchurl {
          urls = [ "https://www.zlib.net/fossils/zlib-${version}.tar.gz" ];
          hash = "sha256-c6swLvMe0edIldKvVvUvWFPyawNw8+8hlUNHrOxeqiE=";
        };
      }))
      nodegui-qt
      
      mesa
    ];

    runScript = "env QT_INSTALL_DIR=${nodegui-qt} bash";
  };
in pkgs.stdenv.mkDerivation {
  name = "fhs-env-derivation";

  # https://nix.dev/anti-patterns/language.html#reproducability-referencing-top-level-directory-with
  src = builtins.path { path = ./.; };

  nativeBuildInputs = [ fhs ];

  installPhase = ''
    mkdir --parent $out
    cp -r ${fhs}/bin/fhs-env $out/fhs-env
  '';
}
