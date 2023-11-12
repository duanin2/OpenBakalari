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
        jdk = pkgs.openjdk;
        qt = pkgs.qt6.full;
        androidComposition = pkgs.androidenv.composeAndroidPackages {
          includeEmulator = false;
          platformVersions = [ "26" "27" "28" "29" "30" "31" "32" "33" "34" ];
          platformToolsVersion = "33.0.3";
          buildToolsVersions = [ "33.0.0" ];
          ndkVersion = "25.1.8937393";
          includeSources = true;
          includeSystemImages = false;
          abiVersions = [ "armeabi-v7a" "arm64-v8a" ];
          includeNDK = true;
        };
      in pkgs.mkShell rec {
        buildInputs = with pkgs; [
          qt
          jdk
          androidComposition.androidsdk
          
          qtcreator
        ];

        JAVA_HOME = "${jdk}/lib/openjdk";

        ANDROID_SDK_ROOT = "${androidComposition.androidsdk}/libexec/android-sdk";
        ANDROID_NDK_ROOT = "${ANDROID_SDK_ROOT}/ndk-bundle";
      };
    };
  });
}
