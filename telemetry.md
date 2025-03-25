**Introduction**

Following are the two types of telemetry can be enabled in the protocol server:

1. Network Telemetry: Generates the telemetry event as per the open network telemetry specifications.
2. Raw Telemetry: Generates raw payload event.

**Telemetry Configuration**

Add the below configuration in the `default-<bap/bpp>-client.yml` and `default-<bap/bpp>-network.yml` to enable telemetry. [example](/config/samples/bap-client.yaml#L128)

To disable telemetry, provide empty value for the network and raw url.

**Example configuration**

```
 telemetry:
    network:
      url: ""
    raw:
      url: ""
    batchSize: 2
    # In minutes
    syncInterval: 1
    # Either can be LOCAL or REDIS
    storageType: "LOCAL"
    backupFilePath: "backups"
    redis:
      db: 4
    messageProperties:
    - key: "provider.name"
      path: "message.order.provider.descriptor.name"
    - key: "item.quantity"
      path: "message.order.items[].quantity.selected.measure.value"
 service:
   name: "network_service"
   version: "1.0.0"

```

| Property          | Description                                                             | Required                | Default Value |
| ----------------- | ----------------------------------------------------------------------- | ----------------------- | ------------- |
| network.url       | URL for sending telemetry data to the network data platform             | Optional                | -             |
| raw.url           | URL for sending raw telemetry data to participant data platform         | Optional                | -             |
| batchSize         | Number of telemetry events per batch                                    | Yes                     | 100           |
| syncInterval      | Time interval(in minutes) for telemetry synchronization                 | Yes                     | 5             |
| storageType       | Type of storage for telemetry data. Allowed values are LOCAL and REDIS. | Yes                     | LOCAL         |
| backupFilePath    | Path for storing backup telemetry data                                  | Yes                     | backups       |
| redis.db          | Redis database index                                                    | If storageType is REDIS | 4             |
| messageProperties | additional attributes to derive from request contextual object          | Optional                | []            |
| service.name      | service name producing the event                                        | Yes                     | -             |
| service.version   | service version producing the event                                     | Yes                     | -             |

 <hr />
