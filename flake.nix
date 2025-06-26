{
	description = "dev flake";

	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
	};

	outputs = { self, nixpkgs }:
		let
			system = "x86_64-linux";
			pkgs = nixpkgs.legacyPackages.${system};
		in {
			devShells.${system}.default  =
				pkgs.mkShell
				{
					buildInputs = [
						pkgs.poppler_utils
						pkgs.zulu23
						pkgs.maven
						pkgs.vscodium-fhs
						# React Frontent
						pkgs.yarn
						pkgs.tailwindcss_4
						pkgs.nodejs_24
					];

					shellHook = ''
			alias code="codium"
			alias r="yarn run build && mvn spring-boot:run"
			echo "use 'r' to run project"
			'';
				};
		};
}
