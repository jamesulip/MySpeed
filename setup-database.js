#!/usr/bin/env node

/**
 * MySpeed Database Setup Script
 * This script helps you configure and migrate between different database types
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Import models (you may need to adjust these paths based on your actual models)
const Config = require('./server/models/Config');
const Speedtests = require('./server/models/Speedtests');
const Node = require('./server/models/Node');
const IntegrationData = require('./server/models/IntegrationData');
const Recommendations = require('./server/models/Recommendations');

async function setupDatabase() {
    console.log('🚀 MySpeed Database Setup');
    console.log('========================');
    
    const dbType = process.env.DB_TYPE || 'sqlite';
    console.log(`📊 Database Type: ${dbType.toUpperCase()}`);
    
    try {
        // Import database connection
        const sequelize = require('./server/config/database');
        
        console.log('🔗 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        console.log('🏗️  Creating/updating database tables...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database tables synchronized successfully.');
        
        console.log('🎉 Database setup completed successfully!');
        
        if (dbType === 'sqlite') {
            const storagePath = `data/storage${process.env.PREVIEW_MODE === "true" ? "_preview" : ""}.db`;
            console.log(`📁 SQLite database location: ${path.resolve(storagePath)}`);
        } else if (dbType === 'mysql') {
            console.log(`🐬 MySQL database: ${process.env.DB_NAME} on ${process.env.DB_HOST || 'localhost'}`);
        }
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (dbType === 'mysql') {
            console.log('\n💡 MySQL Setup Tips:');
            console.log('1. Make sure MySQL server is running');
            console.log('2. Verify database credentials in .env file');
            console.log('3. Ensure the database exists:');
            console.log(`   CREATE DATABASE ${process.env.DB_NAME || 'myspeed'};`);
            console.log('4. Grant proper permissions to the user');
        }
        
        process.exit(1);
    }
}

async function migrateData() {
    console.log('🔄 MySpeed Data Migration');
    console.log('=========================');
    
    try {
        // Check if we're migrating to MySQL
        if (process.env.DB_TYPE !== 'mysql') {
            console.error('❌ Migration is only supported when DB_TYPE is set to mysql');
            console.log('💡 Please set DB_TYPE=mysql in your .env file first');
            process.exit(1);
        }
        
        // SQLite database path
        const sqlitePath = `data/storage${process.env.PREVIEW_MODE === "true" ? "_preview" : ""}.db`;
        
        // Check if SQLite database exists
        if (!fs.existsSync(sqlitePath)) {
            console.error(`❌ SQLite database not found at: ${sqlitePath}`);
            console.log('💡 Make sure you have data to migrate from SQLite');
            process.exit(1);
        }
        
        console.log(`📁 Found SQLite database: ${sqlitePath}`);
        
        // Create SQLite connection
        const sqliteSequelize = new Sequelize({
            dialect: 'sqlite',
            storage: sqlitePath,
            logging: false
        });
        
        // Create MySQL connection
        const mysqlSequelize = require('./server/config/database');
        
        console.log('🔗 Testing database connections...');
        
        // Test SQLite connection
        await sqliteSequelize.authenticate();
        console.log('✅ SQLite connection established');
        
        // Test MySQL connection
        await mysqlSequelize.authenticate();
        console.log('✅ MySQL connection established');
        
        // Setup MySQL tables first
        console.log('🏗️  Setting up MySQL database tables...');
        await mysqlSequelize.sync({ force: false });
        console.log('✅ MySQL tables ready');
        
        // Get table names from SQLite
        const [sqliteTables] = await sqliteSequelize.query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        );
        
        console.log(`📊 Found ${sqliteTables.length} tables to migrate:`);
        sqliteTables.forEach(table => console.log(`   - ${table.name}`));
        
        let totalRecords = 0;
        let migratedRecords = 0;
        
        // Migrate each table
        for (const table of sqliteTables) {
            const tableName = table.name;
            console.log(`\n🔄 Migrating table: ${tableName}`);
            
            try {
                // Get all data from SQLite table
                const [sqliteData] = await sqliteSequelize.query(`SELECT * FROM ${tableName}`);
                console.log(`   📥 Found ${sqliteData.length} records`);
                totalRecords += sqliteData.length;
                
                if (sqliteData.length === 0) {
                    console.log('   ⏭️  No data to migrate');
                    continue;
                }
                
                // Clear existing data in MySQL table (optional, comment out if you want to preserve existing data)
                await mysqlSequelize.query(`DELETE FROM ${tableName}`);
                console.log('   🗑️  Cleared existing MySQL data');
                
                // Insert data into MySQL in batches
                const batchSize = 100;
                for (let i = 0; i < sqliteData.length; i += batchSize) {
                    const batch = sqliteData.slice(i, i + batchSize);
                    
                    // Build INSERT query
                    if (batch.length > 0) {
                        const columns = Object.keys(batch[0]);
                        const values = batch.map(row => 
                            `(${columns.map(col => mysqlSequelize.escape(row[col])).join(', ')})`
                        ).join(', ');
                        
                        const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values}`;
                        await mysqlSequelize.query(insertQuery);
                        
                        migratedRecords += batch.length;
                        console.log(`   📤 Migrated ${Math.min(i + batchSize, sqliteData.length)}/${sqliteData.length} records`);
                    }
                }
                
                console.log(`   ✅ Successfully migrated ${sqliteData.length} records`);
                
            } catch (error) {
                console.error(`   ❌ Failed to migrate table ${tableName}:`, error.message);
                // Continue with other tables even if one fails
            }
        }
        
        // Close connections
        await sqliteSequelize.close();
        await mysqlSequelize.close();
        
        console.log('\n🎉 Migration completed!');
        console.log(`📊 Summary:`);
        console.log(`   Total records found: ${totalRecords}`);
        console.log(`   Records migrated: ${migratedRecords}`);
        console.log(`   Success rate: ${totalRecords > 0 ? Math.round((migratedRecords / totalRecords) * 100) : 0}%`);
        
        if (migratedRecords === totalRecords && totalRecords > 0) {
            console.log('\n💡 Migration successful! You can now:');
            console.log('   1. Test your application with the migrated data');
            console.log('   2. Create a backup of your SQLite database');
            console.log(`   3. Keep the SQLite file as backup: ${sqlitePath}`);
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.log('\n💡 Migration Tips:');
        console.log('1. Ensure MySQL server is running');
        console.log('2. Verify MySQL credentials in .env file');
        console.log('3. Make sure the MySQL database exists and is accessible');
        console.log('4. Check that you have sufficient permissions');
        process.exit(1);
    }
}

// Command line interface
const command = process.argv[2];

switch (command) {
    case 'setup':
    case undefined:
        setupDatabase();
        break;
    case 'migrate':
        migrateData();
        break;
    case 'help':
        console.log('MySpeed Database Setup Script');
        console.log('');
        console.log('Usage:');
        console.log('  node setup-database.js [command]');
        console.log('');
        console.log('Commands:');
        console.log('  setup     Setup/sync database tables (default)');
        console.log('  migrate   Migrate data between databases');
        console.log('  help      Show this help message');
        break;
    default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "node setup-database.js help" for usage information.');
        process.exit(1);
}
