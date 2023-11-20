{ system, pkgs }:
with builtins; rec {
  # Read a YAML file into a set
  fromYAML = file:
    fromJSON (readFile (derivation {
      inherit system;
      name = "beckn-sample-config";
      builder = "${pkgs.oil}/bin/ysh";
      PATH = "${pkgs.busybox}/bin:${pkgs.yq}/bin";
      args = [
        "-c"
        ''
          cat ${file} | yq > $out
        ''
      ];
    }));

  # We remove the client configuration to add it later
  loadConfig = file: removeAttrs (fromYAML file) [ "client" ];
}
