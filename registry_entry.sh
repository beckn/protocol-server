#!/bin/bash

# Set your variables
registry_url="https://registry-ec.becknprotocol.io/subscribers"
content_type="application/json"
subscriber_id="$subscriber_id"
pub_key_id="$subscriber_id_key"
subscriber_url="$subscriber_uri"
encr_public_key="$private_key"
signing_public_key="$private_key"
valid_from="$valid_from"
valid_until="$valid_until"
type="$type"

# Construct JSON data
json_data=$(cat <<EOF
{
    "subscriber_id": "$subscriber_id",
    "pub_key_id": "$pub_key_id",
    "subscriber_url": "$subscriber_url",
    "domain": "",
    "encr_public_key": "$encr_public_key",
    "signing_public_key": "$signing_public_key",
    "valid_from": "$valid_from",
    "valid_until": "$valid_until",
    "type": "$type",
    "country": "IND",
    "status": "SUBSCRIBED"
}
EOF
)

create_network_participant() {

    response=$(curl --location --request POST "$registry_url/register" \
    --header "Content-Type: $content_type" \
    --data-raw "$json_data" 2>&1)
    
    if [ $? -eq 0 ]; then
        echo "Network Participant Entry is created. Please login to registry"
    else
        echo "Error: $response"
    fi
}
