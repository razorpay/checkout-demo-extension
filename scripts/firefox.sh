#!/bin/bash

function cleanup () {
  K=$(ps a | grep Xephyr | grep :$DIS | awk '{print $1}')
  echo 'Killing Xephyr process '$K
  kill -9 $K
  exit
}

trap cleanup EXIT SIGINT SIGTERM SIGKILL SIGHUP

DIS=$(cat /tmp/display_screen)
DIS=$(( $DIS + 1 ))
echo $DIS > /tmp/display_screen
X='Xephyr -br -ac -noreset -screen 1280x720 :'$DIS
$($X) &
sleep 1
DISPLAY=:$DIS /usr/bin/firefox