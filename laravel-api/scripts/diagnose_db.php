<?php

echo "--- DATABASE CONNECTION DIAGNOSTIC ---\n";

$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$database = getenv('DB_DATABASE');
$username = getenv('DB_USERNAME');
$password = getenv('DB_PASSWORD');

echo "DB_HOST: " . ($host ?: '(empty - defaulting to 127.0.0.1)') . "\n";
echo "DB_PORT: " . ($port ?: '(empty - defaulting to 3306)') . "\n";
echo "DB_DATABASE: " . ($database ?: '(empty)') . "\n";
echo "DB_USERNAME: " . ($username ?: '(empty)') . "\n";
echo "DB_PASSWORD: " . (strlen($password) > 0 ? '******' : '(empty)') . "\n";

if (empty($host)) {
    echo "\n[WARNING] DB_HOST is empty! Laravel will default to 127.0.0.1 which WILL FAIL on Railway.\n";
    echo "Please set DB_HOST in Railway Variables to \${{MySQL.MYSQL_HOST}} or the actual private domain.\n";
}

if ($host === 'localhost') {
    echo "\n[CRITICAL WARNING] DB_HOST is set to 'localhost'.\n";
    echo "This causes the 'No such file or directory' error because it tries to use a socket.\n";
    echo "Please change DB_HOST in Railway Variables to \${{MySQL.MYSQL_HOST}}.\n";
}

echo "\nAttempting raw PDO connection...\n";

$dsn = "mysql:host=$host;port=$port;dbname=$database";
try {
    $pdo = new PDO($dsn, $username, $password);
    echo "[SUCCESS] Connection successful!\n";
} catch (PDOException $e) {
    echo "[ERROR] Connection failed: " . $e->getMessage() . "\n";
    echo "DSN used: $dsn\n";
}

echo "--- END DIAGNOSTIC ---\n";
