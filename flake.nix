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
			      pkgs.zulu23
			      pkgs.maven
			      pkgs.vscodium-fhs
          ];

          shellHook = ''
			alias code="codium"
            alias r="mvn spring-boot:run"
            echo "use 'r' to run project"
          '';
        };
  };
}
