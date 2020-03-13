php -S 0.0.0.0:8890 -t . router.php &
php -S 0.0.0.0:8891 -t . router.php &
php -S 0.0.0.0:8892 -t . router.php &
php -S 0.0.0.0:8893 -t . router.php &
sleep 1
php load_balance.php
kill -- -$$
