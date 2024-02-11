#!/bin/bash
source variables.sh

create_network_participant() {
    # Set your variables
        registry_url="$1"
        content_type="$2"
        subscriber_id="$3"
        pub_key_id="$4"
        subscriber_url="$5"
        encr_public_key="$6"
        signing_public_key="$7"
        valid_from="$8"
        valid_until="$9"
        type="${10}"

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

    response=$(curl --location --request POST "$registry_url/register" \
    --header "Content-Type: $content_type" \
    --data-raw "$json_data" 2>&1)
    
    if [ $? -eq 0 ]; then
        
        echo "${GREEN}Network Participant Entry is created. Please login to registry and subscribe you Network Participant.${NC}"
    else
        echo "${RED}Error: $response${NC}"
    fi
}
