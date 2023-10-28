{
  description = "A Nix-flake-based Node.js development environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }: flake-utils.lib.eachDefaultSystem (system: let
    overlays = [
      (final: prev: rec {
        nodejs = prev.nodejs_18;
        pnpm = prev.nodePackages.pnpm;
        yarn = (prev.yarn.override { inherit nodejs; });
      })
    ];
    
    pkgs = import nixpkgs { inherit overlays system; };
    pkgsAllowUnfree = import nixpkgs {
      inherit overlays system;
      config = { allowUnfree = true; };
    };
  in {
    packages.fhs = import ./fhs.nix { inherit pkgs; };
    
    devShells = {
      default = pkgsAllowUnfree.mkShell {
        buildInputs = with pkgsAllowUnfree; [ self.packages.${system}.fhs ];

        shellHook = ''
echo "entering the nix devShell"

export PATH=${self.packages.${system}.fhs}:$PATH
exec fhs-env
        '';
      };
    };
  });
}
