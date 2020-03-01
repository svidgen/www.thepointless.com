install:
	sudo apt-get install mysql-server
	cat createdb.sql | sudo mysql -u root
