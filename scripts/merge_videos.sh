#!/bin/bash

echo "Merging hero videos..."
echo ""

# Create a temporary file list for ffmpeg
cat > filelist.txt << EOF
file 'public/hero_example.mp4'
file 'public/hero_example_2.mp4'
EOF

# Merge videos using ffmpeg
ffmpeg -f concat -safe 0 -i filelist.txt -c copy public/hero_example_merged.mp4

# Clean up temporary file
rm filelist.txt

echo ""
echo "Done! Created: public/hero_example_merged.mp4"
echo ""
