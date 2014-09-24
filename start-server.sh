#!/usr/bin/env bash

nohup ./myprogram python backend/src/app.py backend/var/conf/fontana.conf > tmp/tulane.log 2> tmp/tulane.err < /dev/null &