#!/bin/bash

# Script to remove ALL updatedAt: new Date() occurrences from create() calls
# This handles both standalone lines and inline occurrences

# Find all TypeScript files that might have updatedAt
files=$(find app lib -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*")

count=0

for file in $files; do
  # Check if file contains updatedAt: new Date()
  if grep -q "updatedAt:\s*new Date()" "$file"; then
    echo "Processing: $file"

    # Remove updatedAt: new Date(), (with comma)
    sed -i '' 's/,\s*updatedAt:\s*new Date()//g' "$file"
    sed -i '' 's/updatedAt:\s*new Date(),\s*//g' "$file"

    # Remove updatedAt: new Date() (without comma - last property)
    sed -i '' 's/updatedAt:\s*new Date()//g' "$file"

    # Clean up any resulting double commas
    sed -i '' 's/,,/,/g' "$file"

    # Clean up trailing commas before closing braces
    sed -i '' 's/,\s*}/}/g' "$file"

    ((count++))
  fi
done

echo ""
echo "Processed $count files"
