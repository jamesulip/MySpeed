const axios = require('axios');

/**
 * Fetches the public IP address from external services
 * @returns {Promise<string>} The public IP address
 */
const getPublicIpAddress = async () => {
    // List of public IP services to try (in order of preference)
    const ipServices = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://httpbin.org/ip',
        'https://ip-api.com/json/',
        'https://ifconfig.me/all.json'
    ];

    for (const service of ipServices) {
        try {
            const response = await axios.get(service, {
                timeout: 5000 // 5 second timeout
            });

            // Extract IP from different response formats
            const ip = response.data.ip || response.data.query || response.data.origin || response.data.IPv4 || null;
            
            if (ip && isValidIpAddress(ip)) {
                return ip;
            }
        } catch (error) {
            console.warn(`Failed to fetch IP from ${service}:`, error.message);
            // Continue to next service
        }
    }

    // If all services fail, return a fallback
    throw new Error('Unable to fetch public IP address from any service');
};

/**
 * Validates if a string is a valid IP address (IPv4 or IPv6)
 * @param {string} ip - The IP address to validate
 * @returns {boolean} - True if valid IP address
 */
const isValidIpAddress = (ip) => {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

module.exports = {
    getPublicIpAddress,
    isValidIpAddress
};
