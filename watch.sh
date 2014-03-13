#!/bin/sh
echo "hello"
while inotifywait -e modify ./couchapi.js; do
    echo "changed"
    # docco ./couchapi.js
done
