**Telemetry Configuration**

```
 telemetry:
    network:
      url: "https://webhook.site/d76162a8-3311-49dc-ba69-7c58b254948c"
    raw:
      url: "https://webhook.site/d76162a8-3311-49dc-ba69-7c58b254948c"  
    batchSize: 100
    # In minutes
    syncInterval: 1
    # Either can be LOCAL or REDIS
    storageType: "LOCAL"
    backupFilePath: "backups"
    redis:
      host: localhost
      port: 6379
      db: 4
    messageProperties:
    - key: "key_one"
      path: "message.catalog.descriptor.name"
    - key: "array_key"
      path: "message.intents[].item[].descriptor.name"
```

| Property                       | Description                                                      | Required | Default Value |
|--------------------------------|------------------------------------------------------------------|----------|---------------|
| batchSize            | Number of telemetry events per batch                             | Yes      | 100           |
| syncInterval         | Time interval(in minutes) for telemetry synchronization                    | Yes      | 5             |
| storageType          | Type of storage for telemetry data. Allowed values are LOCAL and REDIS. | Yes      | LOCAL     |
| backupFilePath                 | Path for storing backup telemetry data                           | Yes      | backups       |
| redis.host                     | Hostname or IP address of the Redis server                       | If storageType is REDIS | localhost |
| redis.port                     | Port number for the Redis server                                 | If storageType is REDIS | 6379        |
| redis.db                       | Redis database index                                             | If storageType is REDIS | 4           |
| network.url          | URL for sending telemetry data to the network data platform       | Yes      | -             |
| raw.url          | URL for sending raw telemetry data to participant data platform   | Optional | -             |
| messageProperties          | additional attributes to derive from request contextual object   | Optional | []     |


 <hr />