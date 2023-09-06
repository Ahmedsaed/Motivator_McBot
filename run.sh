#!/bin/sh

log_file="/home/ahmed/Documents/logs/motivator_bot.log"

# Activate the virtual environment
source ./twitter-env/bin/activate

# Get the current date and time
current_date=$(date '+%Y-%m-%d %H:%M:%S')

# Calculate the box width and padding
box_width=50
padding=$((($box_width - ${#current_date}) / 2))

# Create the box with centered date
box=$(printf "%${padding}s%s%${padding}s" "" "$current_date" "")

# Print the box to the log file
echo "+$(printf '=%.0s' $(seq 1 $box_width))+" >> $log_file
echo "|$box|" >> $log_file
echo "+$(printf '=%.0s' $(seq 1 $box_width))+" >> $log_file

# Execute the Python script
python bot.py >> $log_file 2>&1

# Deactivate the virtual environment
deactivate

# send a notification
if command -v "notify" &> /dev/null; then
    notify "MotivatorMcBot tweeted successfully"
else
    echo "notify is not installed."
fi
