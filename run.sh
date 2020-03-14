php -S 0.0.0.0:8890 -t . http.php &
php -S 0.0.0.0:8891 -t . http.php &
php -S 0.0.0.0:8892 -t . http.php &
php -S 0.0.0.0:8893 -t . http.php &
php -S 0.0.0.0:8894 -t . http.php &
php -S 0.0.0.0:8895 -t . http.php &
php -S 0.0.0.0:8896 -t . http.php &
php -S 0.0.0.0:8897 -t . http.php &
sleep 0.3
php load_balance.php 8890 8
kill -- -$$
