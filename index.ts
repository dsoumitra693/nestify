#!/usr/bin/env ts-node

import { execSync } from "child_process";
import prompts from "prompts";
import fs from "fs";

// Helper function to execute shell commands
const runCommand = (command: string) => {
  execSync(command, { stdio: "inherit" });
};

// Helper function to safely read and parse JSON files
const readJsonFile = (filePath: string) => {
  const data = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error parsing JSON from ${filePath}:`, err);
    throw err;
  }
};

// Helper function to write JSON back to file
const writeJsonFile = (filePath: string, json: object) => {
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf8");
};

const createMonorepo = async () => {
  const { repoName } = await prompts({
    type: "text",
    name: "repoName",
    message: "What would you like to name your monorepo?",
    validate: (value) => (value.length > 0 ? true : "A name is required."),
  });

  const { addTailwind } = await prompts({
    type: "confirm",
    name: "addTailwind",
    message: "Would you like to include Tailwind CSS?",
    initial: false,
  });

  runCommand(`mkdir ${repoName}`);
  runCommand(`cd ${repoName} && yarn init -y`);
  runCommand(`cd ${repoName} && touch README.md`);

  let tsconfigJson = `{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./",
    "baseUrl": ".",
    "paths": {
      "@/*": ["packages/mobile/*"]
    },
    "declaration": true,
    "sourceMap": true
  },
  "include": ["packages/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}`;
fs.writeFileSync(
  `${repoName}/tsconfig.json`,
  tsconfigJson,
  "utf8"
);

  // Read package.json and update workspaces
  let packageJson = readJsonFile(`${repoName}/package.json`);
  packageJson.workspaces = ["packages/*", "docs/*"];
  packageJson.private = true;
  packageJson.license = "MIT";
  packageJson.scripts = {
    lint: "eslint '**/*.{ts,tsx,js,jsx}' --ignore-path .gitignore",
    "lint:fix": "eslint '**/*.{ts,tsx,js,jsx}' --ignore-path .gitignore --fix",
    format: "prettier --write '**/*.{ts,tsx,js,jsx,json,md}'",
    docs: "typedoc",
  };
  writeJsonFile(`${repoName}/package.json`, packageJson);

  // Create the packages directories
  runCommand(`mkdir ${repoName}/packages`);

  // Set up the mobile workspace using Expo
  runCommand(`cd ${repoName}/packages && yarn create expo-app mobile`);

  const packageEslintJson = `module.exports = {
  extends: '../../.eslintrc.js', // Point to root config
  rules: {
    // Add workspace-specific rules here
  }
};`;

  fs.writeFileSync(
    `${repoName}/packages/mobile/.eslintrc.ts`,
    packageEslintJson,
    "utf8"
  );

  // Set up an example service
  runCommand(`cd ${repoName}/packages && mkdir server`);
  runCommand(
    `cd ${repoName}/packages/server && yarn init -y && npx tsc --init && mkdir src && touch src/index.ts`
  );

  // Write Express server setup to src/index.ts
  const expressSetup = `import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log("[server]: Server is running at http://localhost:%d", port);
});`;

  fs.writeFileSync(
    `${repoName}/packages/server/src/index.ts`,
    expressSetup,
    "utf8"
  );

  runCommand(`cd ${repoName}/packages/server && 
    yarn add -D nodemon ts-node typescript @types/express @types/node -W &&
    yarn add express dotenv -W
  `);

  // Read server package.json and update scripts
  packageJson = readJsonFile(`${repoName}/packages/server/package.json`);
  packageJson.scripts = {
    build: "npx tsc",
    start: "node dist/index.js",
    dev: "nodemon src/index.ts",
  };
  writeJsonFile(`${repoName}/packages/server/package.json`, packageJson);

  // Write the correct tsconfig.json structure
  fs.writeFileSync(
    `${repoName}/packages/server/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          target: "es2016",
          module: "commonjs",
          esModuleInterop: true,
          rootDir: "./src",
          outDir: "./dist",
          forceConsistentCasingInFileNames: true,
          strict: true,
          skipLibCheck: true,
        },
      },
      null,
      2
    ), // Pretty-print with 2-space indentation
    "utf8"
  );
  fs.writeFileSync(
    `${repoName}/packages/server/.eslintrc.ts`,
    packageEslintJson,
    "utf8"
  );

  // Optional Tailwind setup for mobile
  if (addTailwind) {
    runCommand(
      `cd ${repoName}/packages/mobile && yarn add tailwindcss postcss autoprefixer -W`
    );
    runCommand(
      `cd ${repoName}/packages/mobile && npx tailwindcss init && echo 'module.exports = { content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"], theme: { extend: {} }, plugins: [], }' > tailwind.config.ts`
    );
    console.log("Tailwind CSS has been set up for the mobile app.");
  }

  runCommand(
    `cd ${repoName} && yarn add --dev eslint prettier eslint-config-prettier eslint-plugin-prettier -W`
  );

  const eslintJson = `
  module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays Prettier errors as ESLint errors
    'prettier', // Disables ESLint rules that conflict with Prettier
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',  // Ensure that Prettier errors are flagged
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'build/'],
};`;

  fs.writeFileSync(`${repoName}/.eslintrc.ts`, eslintJson, "utf8");

  runCommand(
    `cd ${repoName} && yarn add --dev @typescript-eslint/parser @typescript-eslint/eslint-plugin -W`
  );

  const eslintConfigJson = `
  module.export = [
    {
      ignores: ['node_modules/**', 'dist/**', 'build/**'],  // Files and folders to ignore
      rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',  // Example of adding a custom rule
        // Add more rules as necessary
      },
      languageOptions: {
        ecmaVersion: 'latest', // Set the ECMAScript version
        sourceType: 'module',  // Use ES modules
        parserOptions: {
          project: './tsconfig.json',
        },
      },
      plugins: {
        prettier: require('eslint-plugin-prettier'),
        '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      },
    },
  ];`;

  fs.writeFileSync(`${repoName}/eslint.config.js`, eslintConfigJson, "utf8");

  const prettierJson = {
    semi: true,
    singleQuote: true,
    printWidth: 80,
    trailingComma: "es5",
    tabWidth: 2,
    useTabs: false,
  };

  fs.writeFileSync(
    `${repoName}/.prettierrc`,
    JSON.stringify(prettierJson),
    "utf8"
  );

  fs.writeFileSync(
    `${repoName}/.prettierignore`,
    `node_modules \ndist \n.next`,
    "utf8"
  );

  //setup typedoc
  runCommand(`cd ${repoName} && yarn add -D typedoc -W && mkdir docs`);
  const typedocJson = `{
  "entryPoints": [
    "packages/**/*.{ts,tsx}"
  ],
  "exclude": [
    "**/__tests__/**", 
    "**/*.test.ts", 
    "**/*.test.tsx"
  ],
  "tsconfig": "./tsconfig.json",
  "out": "docs",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeExternals": true,
  "readme": "README.md",
  "theme": "default"
}`;

  fs.writeFileSync(`${repoName}/typedoc.json`, typedocJson, "utf8");

  console.log(
    `Monorepo ${repoName} has been created with the specified workspaces!`
  );
};

createMonorepo().catch((err) => {
  console.error("Error creating monorepo:", err);
});
