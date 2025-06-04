# The Inventory Management System

A comprehensive inventory management system built with NestJS.

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