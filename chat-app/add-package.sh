#!/bin/bash
echo "Enter the new package name:"
read PACKAGE_NAME

mkdir -p packages/$PACKAGE_NAME
cd packages/$PACKAGE_NAME
yarn init -y
echo "New package '$PACKAGE_NAME' initialized successfully."
cd ../../

echo "Remember to add dependencies and TypeScript if needed!"
