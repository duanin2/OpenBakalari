{
  description = "A Nix-flake-based OpenBakaláři development environment and packaging.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }: flake-utils.lib.eachDefaultSystem (system: let
    pkgs = import nixpkgs {
      inherit system;

      config = {
        android_sdk.accept_license = true;
        allowUnfree = true;
      };
    };
  in {
    devShells = {
      default = let
        libraries = with pkgs;[
          webkitgtk_4_1
          gtk3
          cairo
          gdk-pixbuf
          glib
          dbus
          openssl_3
          librsvg
        ];
        
        packages = with pkgs; [
          curl
          wget
          pkg-config
          dbus
          openssl_3
          glib
          gtk3
          libsoup
          webkitgtk_4_1
          librsvg

          cargo
          rustup
          nodejs
        ];

        jdk = pkgs.openjdk;
        
        androidSdk = pkgs.androidenv.composeAndroidPackages {
          includeEmulator = false;
          platformVersions = [ "26" "27" "28" "29" "30" "31" "32" "33" "34" ];
          platformToolsVersion = "35.0.1";
          buildToolsVersions = [ "34.0.0" ];
          # ndkVersion = "27.0.12077973";
          includeSources = false;
          includeSystemImages = false;
          abiVersions = [ "armeabi-v7a" "arm64-v8a" "x86" "x86_64" ];
          includeNDK = true;
        };
      in pkgs.mkShell rec {
        buildInputs = packages;

        shellHook = ''
export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS

export JAVA_HOME=${jdk}


        '';

        ANDROID_HOME = "${androidSdk.androidsdk}/libexec/android-sdk";
        NDK_HOME = "${ANDROID_HOME}/ndk-bundle";
      };
    };
  });
}
