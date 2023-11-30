#!/bin/bash

# Set your variables
    local registry_url="$1"
    local content_type="$2"
    local subscriber_id="$3"
    local pub_key_id="$4"
    local subscriber_url="$5"
    local encr_public_key="$6"
    local signing_public_key="$7"
    local valid_from="$8"
    local valid_until="$9"
    local type="${10}"

    local json_data=$(cat <<EOF
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
