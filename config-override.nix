{ mode, gateway-mode }:
{
  server = {
    # Assign a different port to each process
    port = builtins.getAttr "${mode}-${gateway-mode}" {
      bap-client = 5001;
      bap-network = 5002;
      bpp-client = 5003;
      bpp-network = 5004;
    };
  };

  client = (if mode == "bpp" then {
    # Set up a webhook for BPP
    webhook = { url = "your-webhook"; };
  } else {
    # Otherwise use MongoDB
    synchronous = {
      mongoURL =
        "mongodb://tvast:password@0.0.0.0:27017/ps?authSource=admin";
    };
  });
} //
# BAP/BPP specific configuration
(if mode == "bap" then
# BAP
{
  public-key = "YourPublicKey";
  private-key = "YourPrivateKey";

  subscriberUri = "your.subscriber.uri";
  subscriberId = "your-bap-subscriber-id";

  uniqueKey = "your.unique.key";
} else
# BPP
{
  public-key = "YourPublicKey";
  private-key = "YourPrivateKey";

  subscriberUri = "your.subscriber.uri";
  subscriberId = "your-bpp-subscriber-id";

  uniqueKey = "your.unique.key";
})
