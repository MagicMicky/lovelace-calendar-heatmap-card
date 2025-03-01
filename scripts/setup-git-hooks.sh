#!/bin/bash

# This script sets up the Git hooks environment

# Make sure the scripts directory exists
mkdir -p scripts

# Make sure the husky directory exists
mkdir -p .husky

# Update the commit-msg hook
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Source nvm to ensure Node.js is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Now run commitlint
npx --no -- commitlint --edit ${1}
EOF

# Update the pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Source nvm to ensure Node.js is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Run lint-staged
npx lint-staged
EOF

# Make the hooks executable
chmod +x .husky/commit-msg
chmod +x .husky/pre-commit

echo "Git hooks have been set up successfully!" 