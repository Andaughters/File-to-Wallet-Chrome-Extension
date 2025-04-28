#!/bin/bash

# Create a zip file for Chrome Web Store submission
echo "Packaging wallet-converter-extension for Chrome Web Store..."

# Remove any existing package
rm -f wallet-converter-extension.zip

# Create the package
zip -r wallet-converter-extension.zip \
    manifest.json \
    popup.html \
    popup.js \
    wallet-builder.js \
    styles.css \
    icons/ \
    README.md

echo "Package created: wallet-converter-extension.zip"
echo "You can now upload this file to the Chrome Web Store Developer Dashboard."