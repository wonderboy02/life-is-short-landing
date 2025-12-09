@echo off
echo Merging hero videos...
echo.

REM Create a temporary file list for ffmpeg
(
echo file 'public/hero_example.mp4'
echo file 'public/hero_example_2.mp4'
) > filelist.txt

REM Merge videos using ffmpeg
ffmpeg -f concat -safe 0 -i filelist.txt -c copy public/hero_example_merged.mp4

REM Clean up temporary file
del filelist.txt

echo.
echo Done! Created: public/hero_example_merged.mp4
echo.
pause
