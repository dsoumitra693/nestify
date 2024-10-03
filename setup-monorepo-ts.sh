#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Prompt for root folder name
echo "Enter the root folder name:"
read ROOT_FOLDER

# Create the monorepo root directory
mkdir $ROOT_FOLDER
cd $ROOT_FOLDER

# Initialize Yarn Workspace and Lerna
echo "Initializing Yarn Workspaces and Lerna..."
yarn init -y
yarn add lerna -D

# Add Yarn Workspaces config to package.json
cat <<EOL > package.json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "name": "$ROOT_FOLDER",
  "version": "1.0.0",
  "scripts": {
    "add-package": "bash ./add-package.sh",
    "dev": "yarn workspaces run start",
    "lint": "yarn workspaces run lint",
    "format": "yarn workspaces run prettier --write ."
  }
}
EOL

# Initialize Lerna
npx lerna init

# Create packages folder and sub-packages
mkdir -p packages/{mobile,server,shared}

# Initialize mobile (Expo app)
echo "Initializing mobile (Expo app)..."
cd packages/mobile
yarn init -y
yarn add react-native react-navigation expo --ignore-workspace-root-check # Use flag to avoid warning
touch app.tsx
cd ../../

# Initialize server (Express app)
echo "Initializing server (Express app)..."
cd packages/server
yarn init -y
yarn add express --ignore-workspace-root-check # Use flag to avoid warning
yarn add typescript @types/node @types/express ts-node-dev -D --ignore-workspace-root-check # Use flag to avoid warning
npx tsc --init
touch index.ts
cat <<EOL > index.ts
import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express TypeScript server!');
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
EOL
cd ../../

# Initialize shared (utilities package)
echo "Initializing shared (utilities package)..."
cd packages/shared
yarn init -y
yarn add lodash --ignore-workspace-root-check # Use flag to avoid warning
touch index.ts
cd ../../

# Create an add-package script for dynamic package creation
cat <<EOL > add-package.sh
#!/bin/bash
echo "Enter the new package name:"
read PACKAGE_NAME

mkdir -p packages/\$PACKAGE_NAME
cd packages/\$PACKAGE_NAME
yarn init -y
echo "New package '\$PACKAGE_NAME' initialized successfully."
cd ../../

echo "Remember to add dependencies and TypeScript if needed!"
EOL

# Make add-package.sh executable
chmod +x add-package.sh

# ESLint and Prettier Setup
echo "Setting up ESLint and Prettier..."

yarn add eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks -D --ignore-workspace-root-check

# Create a common ESLint config
cat <<EOL > .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'react/react-in-jsx-scope': 'off',
  },
};
EOL

# Prettier config
cat <<EOL > .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80
}
EOL

# TypeScript config for each package
echo "Setting up TypeScript for each package..."

# Shared package (common utilities)
cd packages/shared
yarn add typescript -D
npx tsc --init
cd ../../

# Mobile (React Native) package
cd packages/mobile
yarn add typescript @types/react @types/react-native -D
npx tsc --init
cd ../../

echo "Setup complete! Use 'yarn add-package' to add new packages."
