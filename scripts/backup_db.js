/**
 * Railway DB Backup Script
 * Generates a full .sql dump of the Railway MySQL database using mysql2.
 * Run: node scripts/backup_db.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'autorack.proxy.rlwy.net';
const DB_PORT = parseInt(process.env.DB_PORT || '25154', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'railway';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUTPUT_FILE = path.resolve(__dirname, `../railway_backup_${timestamp}.sql`);

function escapeValue(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
    if (Buffer.isBuffer(val)) return `X'${val.toString('hex')}'`;
    // Escape single quotes and backslashes
    return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

async function backup() {
    console.log('🔌 Connecting to Railway MySQL...');
    console.log(`   Host: ${DB_HOST}:${DB_PORT}  DB: ${DB_NAME}`);

    const connection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        multipleStatements: true,
        connectTimeout: 30000,
        ssl: { rejectUnauthorized: false },
    });

    console.log('✅ Connected successfully!\n');

    const lines = [];

    // Header
    lines.push(`-- Railway MySQL Backup`);
    lines.push(`-- Database: ${DB_NAME}`);
    lines.push(`-- Host: ${DB_HOST}:${DB_PORT}`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push(`--`);
    lines.push(`SET FOREIGN_KEY_CHECKS=0;`);
    lines.push(`SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';`);
    lines.push(`SET NAMES utf8mb4;`);
    lines.push(``);

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];
    const tableNames = tables.map(row => row[tableKey]);

    console.log(`📋 Found ${tableNames.length} table(s): ${tableNames.join(', ')}\n`);

    for (const table of tableNames) {
        console.log(`  📦 Dumping table: ${table}`);

        // --- CREATE TABLE ---
        lines.push(`-- ----------------------------`);
        lines.push(`-- Table: \`${table}\``);
        lines.push(`-- ----------------------------`);
        lines.push(`DROP TABLE IF EXISTS \`${table}\`;`);

        const [[createResult]] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
        const createSQL = createResult['Create Table'];
        lines.push(`${createSQL};`);
        lines.push(``);

        // --- Row count ---
        const [[countRow]] = await connection.query(`SELECT COUNT(*) AS cnt FROM \`${table}\``);
        const rowCount = countRow.cnt;
        console.log(`     → ${rowCount} row(s)`);

        if (rowCount > 0) {
            lines.push(`-- Data for table \`${table}\``);
            lines.push(`LOCK TABLES \`${table}\` WRITE;`);

            // Fetch in batches of 500
            const BATCH = 500;
            for (let offset = 0; offset < rowCount; offset += BATCH) {
                const [rows] = await connection.query(
                    `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`,
                    [BATCH, offset]
                );

                for (const row of rows) {
                    const values = Object.values(row).map(escapeValue).join(', ');
                    lines.push(`INSERT INTO \`${table}\` VALUES (${values});`);
                }
            }

            lines.push(`UNLOCK TABLES;`);
            lines.push(``);
        } else {
            lines.push(``);
        }
    }

    // Footer
    lines.push(`SET FOREIGN_KEY_CHECKS=1;`);
    lines.push(`-- End of backup`);

    await connection.end();

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');
    const sizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);

    console.log(`\n✅ Backup complete!`);
    console.log(`📁 File: ${OUTPUT_FILE}`);
    console.log(`📊 Size: ${sizeKB} KB`);
}

backup().catch(err => {
    console.error('\n❌ Backup failed:', err.message);
    process.exit(1);
});
