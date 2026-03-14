# CORS Configuration Guide

Backend supports flexible frontend URL configuration through environment variables.

## Configuration Methods

### Method 1: Single Frontend URL
```bash
FRONTEND_URL=https://your-frontend-domain.com
```

### Method 2: Multiple Frontend URLs
```bash
CORS_ORIGIN=https://app1.com,https://app2.com,http://localhost:3000
```

### Method 3: Development Mode (Allow All)
```bash
NODE_ENV=development
```

## Priority Order
1. `CORS_ORIGIN` (highest priority - supports multiple URLs)
2. `FRONTEND_URL` (single URL fallback)
3. `http://localhost:5173` (default development URL)

## Examples

### Production with Single Frontend
```bash
NODE_ENV=production
FRONTEND_URL=https://math-quest-frontend.onrender.com
```

### Production with Multiple Frontends
```bash
NODE_ENV=production
CORS_ORIGIN=https://math-quest-frontend.onrender.com,https://staging.yourapp.com
```

### Development (Flexible)
```bash
NODE_ENV=development
# No need to set FRONTEND_URL or CORS_ORIGIN
```

### Local Development with Specific Frontend
```bash
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Security Notes
- Production mode restricts to configured URLs only
- Development mode allows all origins for flexibility
- Empty or invalid URLs are automatically filtered out
- CORS credentials are always enabled for authentication
