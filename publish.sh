#!/bin/bash

version=$(npm view longinus version)

echo "longinus now verison : $version"

read -p "Please enter a new version: "  new_version

npm version $new_version
