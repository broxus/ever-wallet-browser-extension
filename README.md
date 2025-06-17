# SparX Wallet Browser Extension - Build Instructions

## Prerequisites

### Operating System and Build Environment Requirements
- OS: Windows, macOS
- Shell: Bash, Zsh

### Required Software
- Node.js: ^20.15.0 (https://nodejs.org/)
- npm: ^10.7.0 (comes with Node.js)
- Webpack: ^5.85.1 (installed via npm)

### Installation Instructions
1. Install Node.js and npm following the official guide: https://nodejs.org/
2. Verify the installation:

```bash
node -v
npm -v
```

## Cloning the Repository

```bash
git clone https://github.com/broxus/ever-wallet-browser-extension.git
cd ever-wallet-browser-extension
```

## Installing Dependencies

```bash
npm install
```

## Build Instructions

### Development Build

For Chromium-based browsers (e.g., Chrome, Edge):

```bash
npm run start
```

For Firefox:

```bash
npm run start:firefox
```

### Production Build

For Chromium-based browsers:

```bash
npm run build:prod
```

For Firefox:

```bash
npm run build:firefox
```

## Release Build

For Chromium-based browsers:

```bash
npm run release:prod
```

For Firefox:

```bash
npm run release:firefox
```

## Additional Commands

- Compress build artifacts:

```bash
npm run compress
```

- Generate icons:

```bash
npm run generate-icons
```

- Lint source code:

```bash
npm run lint
```

- Install husky hooks:

```bash
npm run prepare
```

## Output
- Built extension files will be placed in the `dist/` directory.
- Release artifacts will be stored in the `release/` directory.

## Notes
- Ensure all source files are human-readable and not minified or machine-generated.
- Third-party libraries are open source and managed via npm.

