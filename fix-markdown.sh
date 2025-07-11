#!/bin/bash

# Fix common markdown lint issues
echo "🔧 Fixing common markdown lint issues..."

# Fix copilot instructions
echo "Fixing .github/copilot-instructions.md..."
sed -i '' 's/<!-- Use this file to provide workspace-specific custom instructions to Copilot\. For more details, visit https:\/\/code\.visualstudio\.com\/docs\/copilot\/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->/<!-- Use this file to provide workspace-specific custom instructions to Copilot.\
For more details, visit https:\/\/code.visualstudio.com\/docs\/copilot\/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->/' .github/copilot-instructions.md

# Fix ADVANCED_PRICING_IMPLEMENTATION.md
echo "Fixing ADVANCED_PRICING_IMPLEMENTATION.md..."
sed -i '' 's/Advanced Pricing Engine with machine learning, market analysis, and dynamic business rules for RELOConnect - a comprehensive relocation and logistics platform with real-time adjustments and competitive intelligence./Advanced Pricing Engine with machine learning, market analysis, and dynamic\
business rules for RELOConnect - a comprehensive relocation and logistics\
platform with real-time adjustments and competitive intelligence./' ADVANCED_PRICING_IMPLEMENTATION.md

# Fix empty code blocks
find . -name "*.md" -type f -not -path "./node_modules/*" -not -path "./*/node_modules/*" -not -path "./.expo/*" -exec sed -i '' 's/^```$/```text/' {} \;

echo "✅ Basic markdown lint fixes completed"
