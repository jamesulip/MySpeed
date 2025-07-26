# Public IP Address Title Functionality

This documentation explains how to use the public IP address functionality to set the document title in the MySpeed application.

## Overview

The functionality provides several ways to fetch the user's public IP address and set it as the document title:

1. **Utility Functions** - Direct functions for setting the title
2. **React Hooks** - React hooks for component integration
3. **Server Endpoint** - Server-side API for fetching public IP

## Files Created

### Client-side Files
- `client/src/common/utils/PublicIpUtil.js` - Core utility functions
- `client/src/common/hooks/usePublicIp.js` - React hooks
- `client/src/common/components/PublicIpExample/` - Example component

### Server-side Files
- `server/util/publicIp.js` - Server-side utility
- `server/routes/system.js` - Updated with new endpoint (`/api/info/public-ip`)

## Usage Examples

### 1. Simple Title Setting (Basic Usage)

```javascript
import { setTitleToPublicIp } from '@/common/utils/PublicIpUtil';

// Set title to "MySpeed - 192.168.1.100"
setTitleToPublicIp("MySpeed - ");

// Set title to just the IP address
setTitleToPublicIp("");
```

### 2. Custom Title Formatting

```javascript
import { setTitleToPublicIpCustom } from '@/common/utils/PublicIpUtil';

// Set title to "🌐 MySpeed - 192.168.1.100 (Public IP)"
setTitleToPublicIpCustom({
    prefix: "🌐 MySpeed",
    suffix: "(Public IP)",
    separator: " - "
});
```

### 3. React Hook Usage

```javascript
import { usePublicIp, usePublicIpTitle } from '@/common/hooks/usePublicIp';

function MyComponent() {
    // Get IP address with loading and error states
    const { ip, loading, error } = usePublicIp();

    // Automatically set title when component mounts
    usePublicIpTitle("MySpeed - ", " (Active)");

    return (
        <div>
            {loading && <p>Loading IP...</p>}
            {error && <p>Error: {error}</p>}
            {ip && <p>Your IP: {ip}</p>}
        </div>
    );
}
```

### 4. Manual IP Fetching

```javascript
import { getPublicIpAddress } from '@/common/utils/PublicIpUtil';

async function getMyIp() {
    try {
        const ip = await getPublicIpAddress();
        console.log('Your public IP:', ip);
        // Do something with the IP
    } catch (error) {
        console.error('Failed to get IP:', error);
    }
}
```

## Current Implementation

The functionality is currently integrated into the main App component (`client/src/App.jsx`) and will automatically set the document title to include the public IP address when the application loads.

## How It Works

1. **Service Priority**: The system tries to fetch the IP address in this order:
   - Internal server endpoint (`/api/info/public-ip`) - fastest, no CORS issues
   - External IP services (ipify.org, ipapi.co, etc.) - fallback options

2. **Error Handling**: If all services fail, the title falls back to "MySpeed"

3. **IP Validation**: All IP addresses are validated before being used

4. **Timeout Protection**: Each request has a timeout to prevent hanging

## API Endpoint

### GET `/api/info/public-ip`

Returns the server's public IP address.

**Response:**
```json
{
    "ip": "192.168.1.100"
}
```

**Error Response:**
```json
{
    "error": "Failed to fetch public IP address",
    "message": "Unable to fetch public IP address from any service"
}
```

## Customization Options

### Utility Function Options

```javascript
// Basic usage
setTitleToPublicIp("MySpeed - ");

// Custom formatting
setTitleToPublicIpCustom({
    prefix: "🌐 MySpeed",      // Text before IP
    suffix: "(Public IP)",     // Text after IP
    separator: " - "           // Separator between parts
});
```

### Hook Options

```javascript
// Auto-set title with custom format
usePublicIpTitle("MySpeed - ", " (Connected)");

// Just get IP without setting title
const { ip, loading, error } = usePublicIp();
```

## Error Handling

The system includes comprehensive error handling:

- **Network failures**: Gracefully tries multiple services
- **Invalid responses**: Validates IP format before using
- **Timeouts**: Prevents requests from hanging indefinitely
- **Fallback behavior**: Maintains default title if IP fetching fails

## Security Considerations

- No sensitive information is logged
- External service failures don't crash the application
- IP addresses are validated to prevent injection attacks
- Timeouts prevent resource exhaustion

## Browser Compatibility

- Uses modern `fetch` API (supported in all modern browsers)
- Graceful degradation for older browsers
- No external dependencies required for core functionality
