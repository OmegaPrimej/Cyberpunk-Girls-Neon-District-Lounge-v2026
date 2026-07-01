#!/bin/bash
echo "# Neon District Lounge" > README.md
git init
git add .
git commit -m "Initial commit: cyberpunk DJ lounge with NPCs, console, video transitions"
git remote add origin https://github.com/yourname/neon-district-lounge.git
git push -u origin main
echo "Repo ready!"
