#!/bin/bash
cd /home/kavia/workspace/code-generation/bear-data-viewer-157938-157961/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

