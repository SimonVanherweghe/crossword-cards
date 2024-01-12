#!/bin/bash

svg_directory="./svgs"
gcode_directory="./gcode"

for svg in "$svg_directory"/clues/*.svg; do
  base_name=$(basename "$svg" .svg)
  if ! grep -q "$base_name" plotted.txt; then
    echo $svg
    vpype read $svg gwrite $gcode_directory/clues/$base_name.gcode
  fi
done

for svg in "$svg_directory"/grid/*.svg; do
  base_name=$(basename "$svg" .svg)
  if ! grep -q "$base_name" plotted.txt; then
    echo $svg
    vpype read $svg gwrite $gcode_directory/grid/$base_name.gcode
  fi
done


for svg in "$svg_directory"/envelop/*.svg; do
  base_name=$(basename "$svg" .svg)
  if ! grep -q "$base_name" plotted.txt; then
    echo $svg
    vpype read $svg gwrite $gcode_directory/envelop/$base_name.gcode
  fi
done