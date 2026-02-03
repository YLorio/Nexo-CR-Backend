#!/usr/bin/env python3
"""
Script to resolve Git merge conflicts by accepting incoming changes.
This will keep everything from the incoming branch (66dea10...) and discard HEAD changes.
"""

import sys
import os

def resolve_conflict_file(filepath):
    """
    Resolve conflicts in a file by accepting incoming changes.
    Returns True if conflicts were found and resolved, False otherwise.
    """
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    resolved_lines = []
    in_conflict = False
    in_head_section = False
    conflicts_found = False

    i = 0
    while i < len(lines):
        line = lines[i]

        if line.startswith('<<<<<<<'):
            # Start of conflict - discard HEAD section
            in_conflict = True
            in_head_section = True
            conflicts_found = True
            i += 1
            continue

        if line.startswith('=======') and in_conflict:
            # Switch from HEAD to incoming section
            in_head_section = False
            i += 1
            continue

        if line.startswith('>>>>>>>') and in_conflict:
            # End of conflict
            in_conflict = False
            in_head_section = False
            i += 1
            continue

        # Keep line if not in HEAD section
        if not in_head_section:
            resolved_lines.append(line)

        i += 1

    if conflicts_found:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.writelines(resolved_lines)
        return True

    return False

def main():
    # Find all files with conflict markers
    import subprocess

    result = subprocess.run(
        ['grep', '-r', '-l', '<<<<<<< HEAD', 'src/'],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print("No files with conflicts found or error occurred")
        return

    files = result.stdout.strip().split('\n')
    files = [f for f in files if f]  # Remove empty strings

    print(f"Found {len(files)} files with conflicts")
    print("Resolving conflicts by accepting incoming changes...\n")

    resolved_count = 0
    for filepath in files:
        if resolve_conflict_file(filepath):
            resolved_count += 1
            print(f"[OK] Resolved: {filepath}")

    print(f"\n[OK] Successfully resolved {resolved_count} files")
    print("\nNext steps:")
    print("1. Run: npm run build (or your build command) to verify")
    print("2. Run: git add -A")
    print("3. Run: git commit -m 'Resolve merge conflicts by accepting incoming changes'")

if __name__ == '__main__':
    main()
