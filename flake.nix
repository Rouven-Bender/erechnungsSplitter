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
            alias build="mvn compile assembly:single"
            alias b="build"
            alias e="java -cp target/erechnungssplitter-1.0-SNAPSHOT-jar-with-dependencies.jar bender.rouven.App"
            alias r="build && e"
            echo "Hello World"
          '';
        };
  };
}
