#!/bin/bash

# Comprehensive script to fix React Native imports across the entire project

echo "🚀 Auto-fixing React Native imports across RELOConnect..."

# Counter for tracking fixes
FIXED_COUNT=0
TOTAL_PROCESSED=0

# Function to fix a single file
fix_file() {
    local file="$1"
    echo "🔧 Processing: $file"
    
    # Check if file has the old import pattern
    if grep -q "} from 'react-native'" "$file"; then
        # Create backup
        cp "$file" "$file.backup"
        
        # Extract the imports between { }
        IMPORTS=$(grep "} from 'react-native'" "$file" | sed 's/.*{\([^}]*\)}.*/\1/' | tr '\n' ' ' | sed 's/,$//')
        
        if [ ! -z "$IMPORTS" ]; then
            # Replace the import statement
            sed -i '' '/import.*{.*} from '\''react-native'\'';/c\
import RN from '\''react-native'\'';' "$file"
            
            # Add the destructuring line after the import
            sed -i '' '/import RN from '\''react-native'\'';/a\
\
const {'"$IMPORTS"' } = RN;
' "$file"
            
            # Clean up the formatting
            sed -i '' 's/const { *\([^}]*\) *} = RN;/const {\1} = RN;/' "$file"
            sed -i '' 's/,  */, /g' "$file"
            
            echo "   ✅ Fixed imports: $IMPORTS"
            FIXED_COUNT=$((FIXED_COUNT + 1))
        fi
    else
        echo "   ⏭️  No React Native imports to fix"
    fi
    
    TOTAL_PROCESSED=$((TOTAL_PROCESSED + 1))
}

# Find and fix all TypeScript/TSX files (excluding node_modules, .git, types, and test files)
find . -name "*.tsx" -o -name "*.ts" | \
    grep -v node_modules | \
    grep -v ".git" | \
    grep -v "types/" | \
    grep -v "__tests__" | \
    grep -v ".test." | \
    grep -v ".spec." | \
    while read file; do
        fix_file "$file"
    done

echo ""
echo "📊 Summary:"
echo "   Total files processed: $TOTAL_PROCESSED"
echo "   Files fixed: $FIXED_COUNT"
echo ""

if [ $FIXED_COUNT -gt 0 ]; then
    echo "🎉 React Native import fixes completed!"
    echo ""
    echo "🔍 Verifying fixes..."
    
    # Check for any remaining issues
    REMAINING=$(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".git" | xargs grep -l "} from 'react-native'" 2>/dev/null | wc -l)
    
    if [ $REMAINING -eq 0 ]; then
        echo "✅ All React Native imports have been successfully fixed!"
    else
        echo "⚠️  $REMAINING files may still need manual attention"
    fi
else
    echo "ℹ️  No files needed fixing - all imports are already correct!"
fi

echo ""
echo "🧹 Cleanup: Removing backup files..."
find . -name "*.backup" -delete
echo "✅ Backup files removed"

echo ""
echo "🎯 Next steps:"
echo "   1. Run: npx tsc --noEmit    (to check TypeScript compilation)"
echo "   2. Run: npx expo start     (to test the app)"
echo "   3. Run: npm test           (to run tests)"
