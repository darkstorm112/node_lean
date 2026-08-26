#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
DB_NAME="node_lean"
DB_USER="node_lean_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/node_lean_$DATE.sql.gz

# 删除30天前的备份
find $BACKUP_DIR -name "node_lean_*.sql.gz" -mtime +30 -delete

echo "Backup completed: node_lean_$DATE.sql.gz"
