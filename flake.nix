{
  description =
    "A service to help applications to connect to the Beckn network";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      with builtins;
      let
        inherit (nixpkgs.lib) recursiveUpdate;
        pkgs = nixpkgs.legacyPackages.${system};
        util = import ./util.nix { inherit system pkgs; };
      in rec {
        lib.mkProtocolServer = config:
          pkgs.buildNpmPackage {
            name = "beckn-protocol-server";
            src = ./.;
            npmDepsHash = "sha256-r5l0ok8qI3SJ9hu1/c1mbavvSgSLyeZ8cqKD7HIri5g=";

            configurePhase = ''
              res_path="$out/lib/node_modules/protocol-server_v2"
              mkdir -p $res_path/config

              cat <<EOF > $res_path/config/default.yaml
                ${toJSON config}
              EOF
            '';
            postInstall = ''
              cp package-lock.json $res_path
              cp -r dist/ $res_path

              # Generate script under /bin to run the protocol server
              mkdir -p $out/bin
              cat <<-EOF > $out/bin/protocol-server
              	#!${pkgs.oil}/bin/ysh

              	# Create a temporary directory to run in.
              	const dir = \$(mktemp -u protocol-server.XXXXXX)

              	cp -r $out/lib/node_modules/protocol-server_v2 \$dir
              	chmod -R u+w \$dir

              	cd \$dir {
              	  try {
              	    ${pkgs.nodejs}/bin/node dist/app.js
              	  }
              	}
              	rm -rf \$dir
              EOF

              chmod +x $out/bin/protocol-server
            '';
          };

        lib.mkConfigured = mode: gateway-mode:
          lib.mkProtocolServer (recursiveUpdate
            (util.loadConfig ./config/samples/${mode}-${gateway-mode}.yaml)
            (import ./config-override.nix { inherit mode gateway-mode; }));

        packages.bap-client = lib.mkConfigured "bap" "client";
        packages.bap-network = lib.mkConfigured "bap" "network";
        packages.bpp-client = lib.mkConfigured "bpp" "client";
        packages.bpp-network = lib.mkConfigured "bpp" "network";
        apps = mapAttrs (_: drv: {
          type = "app";
          program = "${drv}/bin/protocol-server";
        }) packages;
      });
}
