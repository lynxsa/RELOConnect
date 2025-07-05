#!/bin/bash

# RELOConnect GitHub Upload Script
# This script will commit and push all the latest changes to GitHub

echo "🚀 RELOConnect GitHub Upload Script"
echo "==================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a Git repository!"
    exit 1
fi

print_success "Found Git repository"

# Check Git configuration
print_status "Checking Git configuration..."
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    print_warning "Git user configuration not found. Setting up..."
    echo "Please enter your Git configuration:"
    
    if [ -z "$GIT_USER" ]; then
        read -p "Enter your name: " GIT_USER
        git config user.name "$GIT_USER"
    fi
    
    if [ -z "$GIT_EMAIL" ]; then
        read -p "Enter your email: " GIT_EMAIL
        git config user.email "$GIT_EMAIL"
    fi
    
    print_success "Git configuration set: $GIT_USER <$GIT_EMAIL>"
else
    print_success "Git configured as: $GIT_USER <$GIT_EMAIL>"
fi

# Check remote repository
print_status "Checking remote repository..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ $? -eq 0 ]; then
    print_success "Remote repository: $REMOTE_URL"
else
    print_error "No remote repository configured!"
    print_status "Please add your GitHub repository:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/RELOConnect.git"
    exit 1
fi

# Show current status
print_status "Checking repository status..."
git status --porcelain > /tmp/git_status.txt

# Count changes
MODIFIED_COUNT=$(grep "^ M" /tmp/git_status.txt | wc -l)
ADDED_COUNT=$(grep "^A" /tmp/git_status.txt | wc -l)
DELETED_COUNT=$(grep "^ D" /tmp/git_status.txt | wc -l)
UNTRACKED_COUNT=$(grep "^??" /tmp/git_status.txt | wc -l)

echo ""
print_status "Repository Status Summary:"
echo "  Modified files: $MODIFIED_COUNT"
echo "  Added files: $ADDED_COUNT"
echo "  Deleted files: $DELETED_COUNT"
echo "  Untracked files: $UNTRACKED_COUNT"

# Show changed files (first 20)
if [ -s /tmp/git_status.txt ]; then
    echo ""
    print_status "Recent changes (showing first 20):"
    head -20 /tmp/git_status.txt | while read line; do
        echo "  $line"
    done
    
    if [ $(wc -l < /tmp/git_status.txt) -gt 20 ]; then
        echo "  ... and $(( $(wc -l < /tmp/git_status.txt) - 20 )) more files"
    fi
else
    print_warning "No changes detected in repository"
    echo ""
    read -p "Do you want to push anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Upload cancelled"
        exit 0
    fi
fi

echo ""
print_status "Preparing to commit and push changes..."

# Create commit message
echo ""
echo "📝 Commit Message Options:"
echo "1. Use default message (recommended)"
echo "2. Enter custom message"
echo "3. Show detailed changes and enter message"

read -p "Choose option (1-3): " -n 1 -r COMMIT_OPTION
echo ""

case $COMMIT_OPTION in
    1)
        COMMIT_MSG="🚀 feat: TypeScript resolution complete & testing infrastructure

- Fixed all critical React/React Native module resolution errors
- Updated import patterns from destructured to default imports
- Created comprehensive type declarations for monorepo structure
- Added complete testing infrastructure and documentation
- Updated tsconfig.json for proper Expo/React Native compatibility
- Fixed backend API port configuration
- Added automated testing scripts and manual guides
- Resolved admin dashboard TypeScript compatibility issues
- Created comprehensive documentation for testing and deployment

✅ All core files now compile without TypeScript errors
✅ Mobile app ready for Expo development and testing
✅ Admin dashboard ready for Next.js development
✅ Backend API configured and ready for deployment
✅ Database setup with Docker and Prisma
✅ Complete testing guides and automation scripts

Ready for 8-week launch timeline continuation! 🎉"
        ;;
    2)
        echo "Enter your commit message (press Enter twice when done):"
        COMMIT_MSG=""
        while IFS= read -r line; do
            if [[ -z "$line" && -n "$COMMIT_MSG" ]]; then
                break
            fi
            if [[ -n "$COMMIT_MSG" ]]; then
                COMMIT_MSG="$COMMIT_MSG"$'\n'"$line"
            else
                COMMIT_MSG="$line"
            fi
        done
        ;;
    3)
        print_status "Showing detailed changes..."
        git diff --stat
        echo ""
        git status
        echo ""
        echo "Enter your commit message (press Enter twice when done):"
        COMMIT_MSG=""
        while IFS= read -r line; do
            if [[ -z "$line" && -n "$COMMIT_MSG" ]]; then
                break
            fi
            if [[ -n "$COMMIT_MSG" ]]; then
                COMMIT_MSG="$COMMIT_MSG"$'\n'"$line"
            else
                COMMIT_MSG="$line"
            fi
        done
        ;;
    *)
        print_error "Invalid option. Using default message."
        COMMIT_MSG="🚀 RELOConnect: Latest updates and fixes"
        ;;
esac

echo ""
print_status "Commit message:"
echo "\"$COMMIT_MSG\""
echo ""

read -p "Do you want to proceed with this commit? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    print_status "Upload cancelled"
    exit 0
fi

# Add all changes
print_status "Adding all changes to staging..."
git add .

# Commit changes
print_status "Committing changes..."
if git commit -m "$COMMIT_MSG"; then
    print_success "Changes committed successfully"
else
    print_error "Commit failed!"
    exit 1
fi

# Push to GitHub
print_status "Pushing to GitHub..."
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Push with progress
if git push origin "$CURRENT_BRANCH"; then
    print_success "Successfully pushed to GitHub!"
    echo ""
    print_success "🎉 RELOConnect has been uploaded to GitHub!"
    echo ""
    echo "📍 Repository URL: $REMOTE_URL"
    echo "🌿 Branch: $CURRENT_BRANCH"
    echo ""
    print_status "Next steps:"
    echo "  1. Visit your GitHub repository to verify the upload"
    echo "  2. Create a release tag if this is a milestone"
    echo "  3. Update your README.md if needed"
    echo "  4. Consider creating a pull request if working on a feature branch"
    echo ""
    print_success "Upload complete! ✨"
else
    print_error "Push failed!"
    echo ""
    print_status "Common solutions:"
    echo "  1. Check your internet connection"
    echo "  2. Verify GitHub authentication (token/SSH key)"
    echo "  3. Try: git push --set-upstream origin $CURRENT_BRANCH"
    echo "  4. Check if the repository exists on GitHub"
    echo ""
    exit 1
fi

# Cleanup
rm -f /tmp/git_status.txt

echo ""
print_success "GitHub upload completed successfully! 🚀"
