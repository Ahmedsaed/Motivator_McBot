#!/bin/sh
python -m venv twitter-env
source ./twitter-env/bin/activate
pip install -r ./requirments.txt
deactivate
mkdir -p images
wget https://www.freefontspro.com/d/14454/arial.zip
unzip arial.zip arial.ttf
