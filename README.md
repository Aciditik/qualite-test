# Currency Converter Application

A simple currency conversion application with comprehensive testing and CI pipeline.

## Features

- Convert EUR to USD
- Convert USD to GBP
- Web interface for easy conversion

## Testing Strategy

This project implements a comprehensive testing strategy with three levels of tests:

1. **Unit Tests**: Test individual functions and components in isolation
2. **Functional Tests**: Test API endpoints and their responses
3. **End-to-End Tests**: Test the full application in a browser environment

## CI Pipeline

The CI pipeline runs on GitHub Actions and performs the following steps:

1. Set up Node.js environment
2. Install dependencies
3. Run unit tests with coverage
4. Run functional tests
5. Run E2E tests
6. Check code coverage (fails if below 80%)
7. Upload coverage report as an artifact

## Running Tests Locally

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only functional tests
npm run test:functional

# Run only E2E tests
npm run test:e2e
```

## Code Coverage Requirements

The CI pipeline enforces a minimum of 80% code coverage for:
- Lines
- Statements
- Functions
- Branches

## Development

```bash
# Start the application
npm start
```

The application will be available at http://localhost:3000
