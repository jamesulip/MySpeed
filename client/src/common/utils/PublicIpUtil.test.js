/**
 * Simple test to verify the public IP functionality works
 * Run this in the browser console to test the functions
 */

// Test the utility functions
async function testPublicIpFunctions() {
    console.log('Testing Public IP Address Functions...\n');

    try {
        // Test 1: Get public IP address
        console.log('1. Testing getPublicIpAddress()...');
        const { getPublicIpAddress } = await import('./PublicIpUtil.js');
        const ip = await getPublicIpAddress();
        console.log(`✅ Public IP: ${ip}\n`);

        // Test 2: Set simple title
        console.log('2. Testing setTitleToPublicIp()...');
        const { setTitleToPublicIp } = await import('./PublicIpUtil.js');
        await setTitleToPublicIp("MySpeed Test - ");
        console.log(`✅ Title set to: ${document.title}\n`);

        // Test 3: Set custom title
        console.log('3. Testing setTitleToPublicIpCustom()...');
        const { setTitleToPublicIpCustom } = await import('./PublicIpUtil.js');
        await setTitleToPublicIpCustom({
            prefix: "🌐 MySpeed",
            suffix: "(Test)",
            separator: " - "
        });
        console.log(`✅ Custom title set to: ${document.title}\n`);

        console.log('✅ All tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Test the server endpoint
async function testServerEndpoint() {
    console.log('Testing Server Endpoint...\n');

    try {
        const response = await fetch('/api/info/public-ip');
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Server endpoint returned: ${data.ip}`);
        } else {
            console.log('❌ Server endpoint failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Server endpoint error:', error);
    }
}

// Export test functions for manual testing
window.testPublicIpFunctions = testPublicIpFunctions;
window.testServerEndpoint = testServerEndpoint;

console.log('Public IP Test Functions Loaded!');
console.log('Run testPublicIpFunctions() or testServerEndpoint() in the console to test.');
