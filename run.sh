php -S 0.0.0.0:8890 -t . router.php &
php -S 0.0.0.0:8891 -t . router.php &
php -S 0.0.0.0:8892 -t . router.php &
php -S 0.0.0.0:8893 -t . router.php &
php -S 0.0.0.0:8894 -t . router.php &
php -S 0.0.0.0:8895 -t . router.php &
php -S 0.0.0.0:8896 -t . router.php &
php -S 0.0.0.0:8897 -t . router.php &
sleep 0.3
php load_balance.php 8890 8
kill -- -$$
