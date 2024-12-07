{
  description = "Sample Nix Flake";

  inputs = {
      nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
  let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
  in
  {
      devShells.${system}.default  =
      pkgs.mkShell
        {
          buildInputs = [
            pkgs.poppler_utils
            pkgs.go
          ];

          shellHook = ''
            echo "Hello World"
          '';
        };
  };
}
