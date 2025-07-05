#!/bin/bash

# Script to fix React Native imports across the project

echo "Fixing React Native imports..."

# Find all TypeScript/TSX files with React Native imports
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".git" | while read file; do
    if grep -q "from 'react-native'" "$file"; then
        echo "Fixing: $file"
        
        # Create a backup
        cp "$file" "$file.backup"
        
        # Replace the import line
        sed -i '' 's/import {[^}]*} from '\''react-native'\'';/import RN from '\''react-native'\'';/' "$file"
        
        # Add destructuring after the import
        # This is a simple regex that won't work for all cases, but will handle most
        if grep -q "import RN from 'react-native';" "$file"; then
            # Extract the original imports and create destructuring
            original_import=$(grep "} from 'react-native';" "$file.backup" | sed "s/import {//" | sed "s/} from 'react-native';//")
            if [ ! -z "$original_import" ]; then
                # Add the destructuring line after the import
                sed -i '' "/import RN from 'react-native';/a\\
const { $original_import } = RN;
" "$file"
            fi
        fi
    fi
done

echo "Done fixing React Native imports!"
