create table if not exists documents (
	id bigint unsigned auto_increment,
	`collection` varchar(255),
	`key` varchar(255),
	`data` text,
	primary key (id),
	index `key` (`key`),
	unique `collection_key` (`collection`, `key`)
) engine=InnoDB;

