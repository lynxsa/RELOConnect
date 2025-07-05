#!/bin/bash

# Script to find files that still need React Native import fixes

echo "🔍 Searching for files with React Native import issues..."

# Find TypeScript/TSX files with the old import pattern
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".git" | grep -v "types/" | while read file; do
    if grep -q "} from 'react-native'" "$file"; then
        echo "❌ NEEDS FIX: $file"
        # Show the import line for context
        grep -n "} from 'react-native'" "$file" | head -1
        echo ""
    fi
done

echo ""
echo "✅ Files already fixed (using default import):"
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".git" | grep -v "types/" | while read file; do
    if grep -q "import RN from 'react-native'" "$file"; then
        echo "✅ $file"
    fi
done

echo ""
echo "📊 Summary:"
OLD_COUNT=$(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".git" | grep -v "types/" | xargs grep -l "} from 'react-native'" 2>/dev/null | wc -l)
NEW_COUNT=$(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".git" | grep -v "types/" | xargs grep -l "import RN from 'react-native'" 2>/dev/null | wc -l)

echo "Files needing fix: $OLD_COUNT"
echo "Files already fixed: $NEW_COUNT"

if [ "$OLD_COUNT" -eq 0 ]; then
    echo ""
    echo "🎉 All React Native imports have been fixed!"
else
    echo ""
    echo "⚠️  $OLD_COUNT files still need to be updated with the new import pattern."
fi
