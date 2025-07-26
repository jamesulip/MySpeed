# Database Configuration Guide

MySpeed supports both SQLite and MySQL databases. This guide will help you configure and switch between different database types.

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** to configure your database settings

3. **Run the database setup script:**
   ```bash
   node setup-database.js
   ```

## Database Types

### SQLite (Default)

SQLite is the default database and requires no additional setup. It's perfect for:
- Small to medium deployments
- Single-user instances
- Development and testing
- Simple deployment scenarios

**Configuration:**
```env
DB_TYPE=sqlite
```

The database file will be automatically created at `data/storage.db`.

### MySQL

MySQL is recommended for:
- Large deployments
- Multi-user environments
- Production environments requiring high performance
- Scenarios requiring database replication or clustering

**Configuration:**
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=myspeed
DB_USER=myspeed_user
DB_PASS=your_secure_password
```

## Setting Up MySQL

### 1. Install MySQL Server

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
```

**CentOS/RHEL:**
```bash
sudo yum install mysql-server
# or for newer versions:
sudo dnf install mysql-server
```

**macOS (using Homebrew):**
```bash
brew install mysql
```

**Windows:**
Download from the [MySQL official website](https://dev.mysql.com/downloads/mysql/)

### 2. Create Database and User

Connect to MySQL as root:
```bash
mysql -u root -p
```

Create the database and user:
```sql
CREATE DATABASE myspeed;
CREATE USER 'myspeed_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON myspeed.* TO 'myspeed_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Environment Variables

Edit your `.env` file:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_NAME=myspeed
DB_USER=myspeed_user
DB_PASS=your_secure_password
```

### 4. Test the Connection

Run the setup script to test the connection:
```bash
node setup-database.js
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_TYPE` | Database type: `sqlite` or `mysql` | `sqlite` | No |
| `DB_HOST` | MySQL server hostname | `localhost` | MySQL only |
| `DB_PORT` | MySQL server port | `3306` | MySQL only |
| `DB_NAME` | MySQL database name | - | MySQL only |
| `DB_USER` | MySQL username | - | MySQL only |
| `DB_PASS` | MySQL password | - | MySQL only |
| `SERVER_PORT` | MySpeed server port | `5216` | No |
| `PREVIEW_MODE` | Enable preview mode | `false` | No |
| `PREVIEW_MESSAGE` | Preview mode message | - | Preview mode only |

## Switching Databases

### From SQLite to MySQL

1. **Set up MySQL** following the steps above
2. **Update your `.env` file** with MySQL configuration
3. **Run the setup script:**
   ```bash
   node setup-database.js
   ```
4. **Restart the MySpeed server**

**Note:** Data migration between databases is not automatically handled. You'll need to manually migrate your data or start fresh.

### From MySQL to SQLite

1. **Update your `.env` file:**
   ```env
   DB_TYPE=sqlite
   ```
2. **Run the setup script:**
   ```bash
   node setup-database.js
   ```
3. **Restart the MySpeed server**

## Troubleshooting

### Common Issues

#### "Access denied for user"
- Check your MySQL username and password in the `.env` file
- Ensure the user has proper permissions on the database

#### "Unknown database"
- Make sure the database exists in MySQL
- Create it using: `CREATE DATABASE myspeed;`

#### "Cannot find module 'dotenv'"
- Install the dotenv package: `npm install dotenv`

#### "ENOENT: no such file or directory" (SQLite)
- The `data` folder will be created automatically
- Ensure the application has write permissions in the project directory

#### Connection timeout (MySQL)
- Check if MySQL server is running
- Verify the hostname and port in your configuration
- Check firewall settings

### Testing Your Configuration

You can test your database configuration by running:
```bash
node setup-database.js
```

This will:
- Test the database connection
- Create/update necessary tables
- Report any configuration issues

## Performance Considerations

### SQLite
- **Pros:** Zero configuration, serverless, file-based
- **Cons:** Limited concurrent writes, not suitable for high-traffic deployments
- **Best for:** Single-user instances, development, small deployments

### MySQL
- **Pros:** High performance, concurrent access, scalable, enterprise features
- **Cons:** Requires server setup and maintenance
- **Best for:** Production environments, multi-user setups, high-traffic deployments

## Backup and Recovery

### SQLite Backup
```bash
# Create backup
cp data/storage.db data/storage_backup_$(date +%Y%m%d_%H%M%S).db

# Restore backup
cp data/storage_backup_YYYYMMDD_HHMMSS.db data/storage.db
```

### MySQL Backup
```bash
# Create backup
mysqldump -u myspeed_user -p myspeed > myspeed_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
mysql -u myspeed_user -p myspeed < myspeed_backup_YYYYMMDD_HHMMSS.sql
```

## Security Best Practices

1. **Use strong passwords** for MySQL users
2. **Limit MySQL user permissions** to only the required database
3. **Use environment variables** for sensitive configuration
4. **Never commit `.env` files** to version control
5. **Regular backups** of your database
6. **Keep MySQL server updated** to the latest security patches
7. **Use SSL/TLS** for MySQL connections in production (configure in MySQL settings)

## Support

If you encounter issues:
1. Check the application logs for detailed error messages
2. Verify your `.env` configuration
3. Test database connectivity using the setup script
4. Consult the MySQL documentation for database-specific issues
