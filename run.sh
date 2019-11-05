#!/bin/sh -e

RUNMODE="${1:-start}"

echo "Starting jibrel-com-web service, version: `cat /app/version.txt` on node `hostname`"

dockerize -template /app/ecosystem.tpl.config.js:/app/ecosystem.config.js

echo "Ready"

pm2-runtime /app/ecosystem.config.js
