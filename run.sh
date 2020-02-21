#!/bin/sh -e

RUNMODE="${1:-start}"

echo "Starting jibrel-com-web service, version: `cat /app/version.txt` on node `hostname`"

echo "Ready"

npm start
