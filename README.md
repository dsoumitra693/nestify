# Monorepo Setup with TypeScript, ESLint, and Prettier

**Nestify** is a command-line tool for setting up a scalable monorepo structure using Yarn Workspaces and Lerna. This setup is ideal for projects that require both an Expo React Native app and an Express server, along with shared utilities.

## Features

- Easily create a monorepo structure with multiple packages.
- Supports TypeScript for type safety.
- Configured with ESLint and Prettier for consistent code quality.
- Simple commands to add new packages dynamically.
- Predefined folder structure for mobile, server, and shared packages.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

## Installation

To get started with **Monorepo Magic**, you can install it globally using npm or run it directly with npx. Here’s how:

### Using npx

```bash
npx dsoumitra693/nestify
```

Install Locally (Optional)
If you want to install it locally:
```bash
git clone https://github.com/dsoumitra693/nestify.git
cd nestify
npm install or # yarn install
```

Usage
After installing, you can run the setup command:
```bash
npx dsoumitra693/nestify
#You will be prompted to enter the root folder name for your monorepo.
```

Adding New Packages
To add new packages to your monorepo, use the following command:
```bash
yarn add-package
#This command will prompt you for the package name and create the necessary folder and files for you.
```


Project Structure
The initial project structure will look like this:

```perl
<root-folder>/
├── packages/
│   ├── mobile/           # Expo React Native app
│   ├── server/           # Express server
│   └── shared/           # Shared utilities
├── add-package.sh        # Script to add new packages
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── package.json          # Root package.json with workspace config
└── lerna.json            # Lerna configuration
```
Scripts
Run All Packages
To start all packages in development mode, run:
```bash
yarn dev
```
Linting
To lint all packages:
```bash
yarn lint
```
Formatting
To format all code using Prettier:
```bash
yarn format
```
Best Practices
Ensure consistent code style by adhering to the rules defined in .eslintrc.js and .prettierrc.
Write unit tests for all packages and ensure they pass before merging code changes.
Use meaningful commit messages that describe the changes made.
Contributing
Contributions are welcome! If you have suggestions or improvements, please fork the repository and submit a pull request.

Fork the repository.
Create a new branch for your feature or bug fix.
Commit your changes and push to your fork.
Create a pull request.
License
This project is licensed under the MIT License. See the LICENSE file for more information.
