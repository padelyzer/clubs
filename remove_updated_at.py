#!/usr/bin/env python3
"""
Remove all updatedAt: new Date() from Prisma create() calls
"""
import re
import os
from pathlib import Path

def remove_updated_at_from_file(file_path):
    """Remove updatedAt: new Date() from a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern 1: updatedAt: new Date(), (with comma)
    content = re.sub(r',?\s*updatedAt:\s*new Date\(\)\s*,?', '', content)

    # Pattern 2: Clean up double commas
    content = re.sub(r',\s*,', ',', content)

    # Pattern 3: Clean up trailing commas before closing braces
    content = re.sub(r',(\s*)\}', r'\1}', content)

    # Pattern 4: Clean up orphaned commas at start of lines
    content = re.sub(r'\n\s*,\s*\n', '\n', content)

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Process all TypeScript files"""
    count = 0

    # Find all TS/TSX files in app and lib
    for directory in ['app', 'lib']:
        for file_path in Path(directory).rglob('*.ts*'):
            if 'node_modules' in str(file_path) or '.next' in str(file_path):
                continue

            if remove_updated_at_from_file(file_path):
                print(f"Processed: {file_path}")
                count += 1

    print(f"\nProcessed {count} files")

if __name__ == '__main__':
    main()
