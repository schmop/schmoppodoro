#!/bin/bash

# Simple script to use the pomodoro technique using rofi

pomodoro="$HOME/schmoppodoro/cli.ts"

file="/tmp/pomodoro.json"
state=$(jq -r '.state' $file 2>/dev/null)
if [[ -z $state ]]; then
    state="stopped"
fi
# state one of: "stopped", "running", "paused"
options=()
if [[ $state = "stopped" ]]; then
    options+=("Start a new pomodoro")
elif [[ $state = "running" ]]; then
    options+=("Pause the active pomodoro")
    options+=("Stop the active pomodoro")
elif [[ $state = "paused" ]]; then
    options+=("Resume from current break")
    options+=("Stop the active pomodoro")
fi


rofiOptions=$(IFS=$'\n',;echo -e "${options[*]}")

chosen=$(echo -e "$rofiOptions" | rofi -dmenu -i)


if  [[ $chosen = "Start a new pomodoro" ]]; then
    arguments=""
    durationText=$(echo -e "Duration 55\nDuration 45\nDuration 35\nDuration 25\nDuration 20\nDuration 15\nDuration 10" | rofi -dmenu -i)
    duration=$(echo $durationText | cut -c 10-)
    arguments+=' --duration '
    arguments+=$duration
    $pomodoro start --file $file $arguments
elif [[ $chosen = "Stop the active pomodoro" ]]; then
	$pomodoro stop --file $file
elif [[ $chosen = "Pause the active pomodoro" ]]; then
	$pomodoro pause --file $file
elif [[ $chosen = "Resume from current break" ]]; then
	$pomodoro resume --file $file
fi
