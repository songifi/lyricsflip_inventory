# Error Handling

- A global filter formats all errors to this shape:
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "NotFoundException",
  "timestamp": "2025-06-03T10:00:00Z",
  "path": "/users/123"
}