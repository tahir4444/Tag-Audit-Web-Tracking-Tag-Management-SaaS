# Tag Audit API Postman Collection

This directory contains the Postman collection and environment files for testing the Tag Audit API.

## Files

- `tag-audit-api.postman_collection.json`: The main Postman collection containing all API endpoints
- `tag-audit-env.postman_environment.json`: Environment variables for different environments

## Setup Instructions

1. Import both files into Postman:
   - Click "Import" in Postman
   - Select both JSON files
   - Click "Import"

2. Set up the environment:
   - Select the "Tag Audit Environment" from the environment dropdown
   - Update the `baseUrl` variable if your API is running on a different URL
   - The `token` variable will be automatically set after successful login

## Collection Structure

The collection is organized into the following folders:

1. **Authentication**
   - Register
   - Login
   - Get Current User

2. **Websites**
   - Add Website
   - Get All Websites
   - Get Website by ID
   - Update Website
   - Delete Website

3. **Audits**
   - Start Audit
   - Get Audit Status
   - Get Website Audits
   - Generate Report

4. **GTM Integration**
   - Connect GTM
   - Get GTM Tags

5. **Subscriptions**
   - Create Subscription
   - Get Current Subscription
   - Cancel Subscription

## Using the Collection

1. Start with the Authentication endpoints to get a JWT token
2. The token will be automatically saved to the environment variable
3. Use the token for subsequent requests
4. Use the environment variables to store IDs and other data between requests

## Environment Variables

- `baseUrl`: The base URL of your API (default: http://localhost:5000)
- `token`: JWT authentication token
- `userId`: Current user's ID
- `websiteId`: Selected website's ID
- `auditId`: Selected audit's ID

## Testing Workflow

1. Register a new user
2. Login to get the JWT token
3. Add a website
4. Start an audit
5. Check audit status
6. Generate a report
7. Test GTM integration
8. Test subscription management 