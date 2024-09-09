#!/bin/bash

REMOTE_PATH=/home/mika/haiku.frontiernerds.com

scp -r $(ls -1) mika@orbit.ericmika.com:$REMOTE_PATH
ssh mika@orbit.ericmika.com "$REMOTE_PATH/start.sh"
