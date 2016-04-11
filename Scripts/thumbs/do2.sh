#!/bin/bash

echo STARTING


for f in $(find . -size 0)
do
  echo "processing $f"
  cp logo.jpg $f
done

echo STOPING


