create table if not exists documents (
	id integer primary key,
	`collection` varchar(255) collate nocase,
	`key` varchar(255) collate nocase,
	`data` text
);

create index if not exists documentkey on documents(`key`);

create unique index if not exists documents_collection_key
	on documents(`collection`,`key`);

pragma journal_mode=WAL;
