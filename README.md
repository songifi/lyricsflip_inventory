# The Inventory Management System

A comprehensive inventory management system built with NestJS.

## 🚀 Development Setup

### Prerequisites
- Node.js (v16 or later)
- npm (v8 or later) or yarn
- TypeScript (v4.6.0 or later)
- PostgreSQL (or your preferred database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lyricsflip_inventory
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. Run database migrations:
   ```bash
   npm run migration:run
   ```

### Development

- Start the development server:
  ```bash
  npm run start:dev
  ```

- Lint your code:
  ```bash
  npm run lint
  ```

- Format your code:
  ```bash
  npm run format
  ```

- Run tests:
  ```bash
  npm test
  ```

### Building for Production

```bash
# Build the project
npm run build

# Start the production server
npm run start:prod
```

## 🛠️ Code Quality

This project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Jest for testing

### Linting and Formatting

- Run ESLint:
  ```bash
  npm run lint
  ```

- Run Prettier:
  ```bash
  npm run format
  ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Modules

### System Configuration Module

The System Configuration module provides endpoints for managing system-wide settings, alert thresholds, integration settings, and backup/restore functionality.

#### Features

1. **System Settings Management**
   - Create, read, update, and delete system settings
   - Settings are stored as key-value pairs with metadata
   - Support for different data types, categories, and secret values

2. **Alert Threshold Configuration**
   - Define thresholds for various system alerts
   - Configure notification preferences for each threshold
   - Categorize alerts by severity and type

3. **Integration Settings Management**
   - Manage external system integrations
   - Store configuration details for APIs and services
   - Enable/disable integrations as needed

4. **Backup and Restore**
   - Create backups of all system configuration data
   - Restore from previous backups
   - Option to include or exclude sensitive information
   - Selective restore of specific configuration types

#### API Endpoints

##### System Settings
- `GET /system-settings` - List all system settings
- `GET /system-settings/:id` - Get a specific setting by ID
- `GET /system-settings/key/:key` - Get a setting by key
- `GET /system-settings/value/:key` - Get only the value of a setting
- `POST /system-settings` - Create a new setting
- `POST /system-settings/bulk` - Create multiple settings
- `PATCH /system-settings/:id` - Update a setting
- `DELETE /system-settings/:id` - Delete a setting

##### Alert Thresholds
- `GET /alert-thresholds` - List all alert thresholds
- `GET /alert-thresholds/:id` - Get a specific threshold by ID
- `GET /alert-thresholds/category/:category` - Get thresholds by category
- `GET /alert-thresholds/severity/:severity` - Get thresholds by severity
- `POST /alert-thresholds` - Create a new threshold
- `POST /alert-thresholds/bulk` - Create multiple thresholds
- `PATCH /alert-thresholds/:id` - Update a threshold
- `PATCH /alert-thresholds/:id/toggle-active` - Toggle active status
- `DELETE /alert-thresholds/:id` - Delete a threshold

##### Integration Settings
- `GET /integration-settings` - List all integration settings
- `GET /integration-settings/:id` - Get a specific integration by ID
- `GET /integration-settings/key/:key` - Get an integration by key
- `POST /integration-settings` - Create a new integration
- `POST /integration-settings/bulk` - Create multiple integrations
- `PATCH /integration-settings/:id` - Update an integration
- `PATCH /integration-settings/:id/config` - Update only the config
- `PATCH /integration-settings/:id/toggle-active` - Toggle active status
- `DELETE /integration-settings/:id` - Delete an integration

##### Backup and Restore
- `POST /system-backup` - Create a system backup
- `GET /system-backup` - List all available backups
- `GET /system-backup/download/:filename` - Download a backup file
- `POST /system-backup/restore/:filename` - Restore from a backup
- `DELETE /system-backup/:filename` - Delete a backup file