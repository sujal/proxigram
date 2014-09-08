#!/bin/bash

echo "about to call"

curl -N -X POST -H "Accept-Encoding: identity" \
  -H "Content-Length: 120" \
  -H "X-Hub-Signature: 5392d3443733ccd5ec4d681653373cb97f20d8a0" \
  -H "User-Agent: Python-urllib/2.7" \
  -H "Connection: close" \
  -H "Content-Type: application/json" \
  -d '[{"changed_aspect": "media", "subscription_id": 1701296, "object": "user", "object_id": "51591702", "time": 1336141871}]' \
  "http://chromaticlove.dev/instagram/realtime"

echo "call complete"




