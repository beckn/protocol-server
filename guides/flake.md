# Flake Guide
This is a guide for setting up the Beckn Protocol Server using the [Nix](https://nixos.org/) flake.

### Requirements
- Nix version 2.4 or above. You need to enable [Flakes](https://nixos.wiki/wiki/Flakes) in the Nix configuration.

- MongoDB version 4.4 or above
- RabbitMQ version 3.8 or above
- Redis version 6.2 or above

(Optional)
- Docker version 20.10 or above

### Download
As the Protocol Server repository is Public, clone the repository and checkout to v2 branch.

```bash
git clone https://github.com/beckn/protocol-server.git
```

```bash
cd protocol-server
```

```bash
git checkout master
```

### Install

You can utilize Docker to deploy the MongoDB, RabbitMQ and Redis services. We've included an illustrative docker-compose file located in `docker/docker-compose.yaml`. Copy `docker/docker-compose.yaml` to the project root and run `docker compose up`

Please set the user name and password as per requirement in docker-compose.yaml file inside docker_data directory.

As we are using Nix, you need not install NodeJS.

> TODO: Allow setting this up via Nix?

### Key-Pair Generation

Beckn Protocol Server comes with key generation scripts for the Network participants. You can use the scripts to generate the keys for the Network participants.

**NOTE:** To generate the key pairs, the above steps must be completed.

```bash
npm run generate-keys
```

#### Sample Output

```
Generating Key Pairs...

Key Pairs Generated

Your Public Key :

taRF+XAJ3o2E3NDWPj5fPGq5HTVNqa/DKPx8VTpMvlg=

Your Private Key :

Uh/qEeDz5LrZapUKal2vY4fxffIONciN1JWMMSVvcwu1pEX5cAnejYTc0NY+Pl88arkdNU2pr8Mo/HxVOky+WA==

Please save your keys in a secure location.
```

Once this is done, edit `config-override.nix` and set `public-key` and `private-key` to what you generated.

## Configure

### Register Local BAP and BPP Networks:
- Access the [Registry URL](https://registry.becknprotocol.io/login).
- Log in using your Gmail ID.

### Create Network Participants:
- In the Registry, navigate to the admin tab and select "Network Participant."
- Click the "+" icon to create entries for both the BAP and BPP networks.
- Enter ParticipantIDs for each network, for BAP Network and BPP Network. (Note: We will call this as "subscriberIDs" going further.)

### Configure Network Roles:
- Edit the created entries for BAP and BPP networks.
- Select the "Network Role Tab."
- Choose the network domain (leave it blank for universal BAP/BPP).
- Set the Type as "BAP" for BAP network and "BPP" for BPP network.
- Enter the respective "SubscriberID" created in step [Create Network Participants](https://github.com/beckn/protocol-server/tree/devops#create-network-participants)
- Set the Status field to "subscribed."

### Set Up Local Tunneling:
Since we have Nix, we don't need to install anything globally. Run the following command to get a nix shell.

```bash
nix shell nixpkgs#nodePackages.localtunnel
```

Now run `lt --port <BAP/BPP network port> --subdomain <any subdomain>` for both BAP and BPP *networks*. Use the same subdomain each time for consistency.

### Update Registry URLs:
- Copy the generated URLs and paste them in the URL field on the respective network role tab in the Registry.
- Save the changes.

### Configure Participant Keys:
- In the Registry, navigate to the participant key tab for both BAP and BPP networks.
- Click the "+" icon to add a participant key entry.
- Provide a key (used as uniqueKey in default.yml).
- Copy the generated public keys in step [Key-Pair Generation](https://github.com/beckn/protocol-server/blob/master/README.md#key-pair-generation) and paste them in the "Signing Public Key" and "Encryption Public Key" fields.
- Set the Valid from date to the current date and the Valid until date to a date at least one year ahead.
- Check the "Verified" checkbox and save the entry.

### Update Configuration Files which we have copied at home directory
Edit `config-override.nix` to add all the things we generated. It should look like this after everything;
```nix
{ mode, gateway-mode }:
{
  ....
  client = (if mode == "bpp" then {
    webhook = { url = /* Your webhook url */ };
  } else {
    ....
  });
} //
# BAP/BPP specific configuration
(if mode == "bap" then
# BAP
{
  public-key = /* Your public key */;
  private-key = /* Your private key */;

  subscriberUri = /* BAP Subscriber URI */;
  subscriberId = /* BAP Subscriber ID */;

  uniqueKey = /* Your unique key */;
} else
# BPP
{
  public-key = /* Your public key */;
  private-key = /* Your private key */;

  subscriberUri = /* BPP Subscriber URI */;
  subscriberId = /* BPP Subscriber ID */;

  uniqueKey = /* Your unique key */;
})

```

### Run
Now you can run `nix` to start up whatever you need
```
nix run .#bap-client	# BAP Client
nix run .#bap-network	# BAP Network
nix run .#bpp-client	# BPP Client
nix run .#bpp-network	# BPP Network
```
