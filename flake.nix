{
  description = "dev flake";

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
			pkgs.zulu23
          ];

          shellHook = ''
            echo "Hello World"
          '';
        };
  };
}
