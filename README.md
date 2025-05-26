# Tag Audit Software

A modern SaaS platform for auditing, monitoring, and managing website tracking tags. Tag Audit helps businesses ensure accurate analytics, compliance, and marketing performance by providing automated tag audits, Google Tag Manager (GTM) integration, customizable reports, and real-time monitoring across multiple CMS platforms.

**Key Features:**
- Automated website tag audits and error detection
- Google Tag Manager (GTM) integration and management
- Customizable audit reports (PDF/CSV)
- Real-time monitoring and alerts
- Multi-platform support (Shopify, WooCommerce, WordPress, etc.)
- Secure authentication and user management
- Subscription and billing management (Stripe)
- RESTful API with Postman documentation

**Tech Stack:**  
Node.js, Express, MongoDB, React (Vite), Material-UI

## Features

- Website tracking implementation monitoring
- GTM (Google Tag Manager) integration and management
- Automated tag auditing
- Customizable audit reports
- Multi-platform support (Shopify, WooCommerce, WordPress, etc.)
- Real-time monitoring and alerts

## Tech Stack

- **Frontend**: React (Vite), Material-UI
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment**: Stripe

## Prerequisites

- Node.js >= 18.0.0
- MongoDB

## Project Structure

```
tag-audit/
├── frontend/           # React frontend application
├── backend/           # Node.js backend application
├── postman/          # API documentation and testing
├── .github/          # GitHub workflows and templates
└── package.json      # Root package configuration
```

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tag-audit.git
   cd tag-audit
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables as needed

4. Start development servers:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend
- `npm run test` - Run tests for both frontend and backend
- `npm run clean` - Clean all node_modules directories

## API Documentation

API documentation is available in the `postman` directory. Import the collection and environment files into Postman to test the API endpoints.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 