# drop database if exists pointless;
create database if not exists pointless default character set = utf8;
use pointless;

# create user 'SOMEUSER'@'localhost' identified by 'SOME RANDOM PASSWORD';
# grant insert,select,update,delete on pointless.* to 'SOMEUSER'@'localhost';

CREATE TABLE if not exists `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(255) DEFAULT NULL,
  `userdata` text,
  `admin` boolean,
  `favorite_thing_id` int unsigned,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  index `favorite_thing_id` (`favorite_thing_id`)
) ENGINE=InnoDB;

create table if not exists stalker_relationships (
	stalker_relationship_id bigint unsigned auto_increment,
	stalker_id int(10) unsigned,
	victim_id int(10) unsigned,
	primary key (stalker_relationship_id),
	unique stalker_victim (stalker_id, victim_id),
	index victim_stalker (victim_id, stalker_id)
) engine=InnoDB;

create table if not exists somethings (
	something_id int unsigned auto_increment,
	message varchar(255) not null,
	ip varchar(32) not null,
	created timestamp not null default current_timestamp,
	primary key something_id (something_id),
	index created (created)
) engine=InnoDB;

create table if not exists places (
	place_id int unsigned auto_increment,
	name varchar(255) not null,
	icon_id int unsigned,
	details mediumtext,
	primary key (place_id),
	unique (name)
) engine=InnoDB;

create table if not exists place_place (
	place_place_id int unsigned auto_increment,
	place_a_id int unsigned,
	place_b_id int unsigned,
	primary key (place_place_id),
	unique a_b (place_a_id, place_b_id)
) engine=InnoDB;

create table if not exists place_thing (
	place_thing_id int unsigned auto_increment,
	place_id int unsigned,
	thing_id int unsigned,
	mode enum (
		-- always present, non-consumable, non-collectable
		'static',

		-- limited in quantity; 1 added to quantity at spawn_chance
		'spawn',

		-- another player dropped it. limited quantity.
		'drop'
	),
	spawn_chance float,
	quantity int unsigned,
	primary key (place_thing_id),
	index place_thing (place_id, thing_id)
) engine=InnoDB;

create table if not exists things (
	thing_id int unsigned auto_increment,
	name varchar(255) not null,
	icon_id int unsigned,
	enabled boolean default 1,
	details mediumtext,
	primary key (thing_id),
	unique name (name),
	index enabled_thing (enabled, name)
) engine=InnoDB;

alter table things add max_per_award int unsigned default 100;
alter table things add min_award_delay int unsigned default 60;

create table if not exists user_thing (
	user_thing_id int unsigned auto_increment,
	user_id int unsigned,
	thing_id int unsigned,
	quantity int unsigned,
	primary key (user_thing_id),
	unique user_thing (user_id, thing_id),
	index user_quantity (user_id, quantity)
) engine=InnoDB;

alter table user_thing change quantity quantity bigint unsigned;
alter table user_thing add modified timestamp default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP;

create table if not exists cache_entries (
	cache_entry_key varchar(200) not null,
	value varchar(60000),
	modified timestamp default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
	ttl int unsigned not null default 30,
	primary key (cache_entry_key),
	index modified (modified)
) engine=MEMORY;

create table if not exists proverbs (
	proverb_id int unsigned auto_increment,
	type enum ('small-potato','awkward-moment'),
	proverb_text text,
	created timestamp default CURRENT_TIMESTAMP,
	likes int unsigned default 0,
	session_id varchar(64),
	user_id int unsigned,
	primary key (proverb_id)
) engine=InnoDB;

create table if not exists proverb_votes (
	proverb_vote_id int unsigned auto_increment,
	proverb_id int unsigned,
	created timestamp default CURRENT_TIMESTAMP,
	user_id int unsigned,
	session_id varchar(64),
	primary key (proverb_vote_id),
	index proverb_id (proverb_id),
	index session_proverb (session_id, proverb_id),
	index user_proverb (user_id, proverb_id),
	index created (created)
) engine=InnoDB;

create table if not exists images (
	image_id int unsigned auto_increment,
	mimetype varchar(255) not null,
	data mediumblob,
	primary key (image_id)
) engine=InnoDB;

create table if not exists challenges (
	challenge_id int unsigned auto_increment,
	user_id int unsigned not null,
	title varchar(255) not null,
	details text not null,
	icon_id int unsigned,
	repeatable boolean default 0,
	enabled boolean default 1,
	primary key challenge_id (challenge_id),
	unique user_title (user_id, title)
) engine=InnoDB;

create table if not exists user_challenge (
	user_challenge_id int unsigned auto_increment,
	user_id int unsigned,
	challenge_id int unsigned,
	accepted timestamp default CURRENT_TIMESTAMP,
	completed timestamp default '0000-00-00 00:00:00',
	primary key user_challenge_id (user_challenge_id),
	index user_challenge (user_id, challenge_id),
	index user_accepted_challenge (user_id, accepted, challenge_id)
) engine=InnoDB;

create table if not exists actions (
	action_id int unsigned auto_increment,
	name varchar(255) not null,
	icon_id int unsigned,
	details mediumtext,
	primary key action_id (action_id)
) engine=InnoDB;

create table if not exists action_things (
	action_thing_id int unsigned auto_increment,
	action_id int unsigned,
	thing_id int unsigned,
	quantity int,
	primary key (action_thing_id),
	index thing_id (thing_id)
) engine=InnoDB;

create table if not exists challenge_action (
	challenge_action_id int unsigned auto_increment,
	challenge_id int unsigned,
	action_id int unsigned,
	primary key challenge_action_id (challenge_action_id),
	unique challenge_action (challenge_id, action_id)
) engine=InnoDB;

create table if not exists challenge_thing (
	challenge_thing_id int unsigned auto_increment,
	challenge_id int unsigned,
	thing_id int unsigned,
	quantity int,
	primary key challenge_thing_id (challenge_thing_id),
	index challenge_thing (challenge_id, thing_id)
) engine=InnoDB;

create table if not exists comments (
	comment_id int unsigned auto_increment,
	channel varchar(128) not null,
	user_id int unsigned,
	message text,
	created timestamp default CURRENT_TIMESTAMP,
	primary key comment_id (comment_id),
	index channel_commentid (channel, comment_id)
) engine=InnoDB;

create table if not exists messages (
	message_id bigint unsigned auto_increment,
	message text not null,
	to_id int unsigned not null,
	from_id int unsigned not null,
	from_ip varchar(32) not null,
	unread boolean default true,
	created timestamp not null default current_timestamp,
	primary key message_id (message_id),
	index to_unread_from_created (to_id, unread, from_id, created),
	index to_from_created (to_id, from_id, created)
) engine=InnoDB;

create table if not exists events (
	event_id int unsigned auto_increment,
	parent_event_id int unsigned,
	user_id int unsigned,
	challenge_id int unsigned,
	url varchar(2048),
	thing_id int unsigned,
	quantity int,
	event_text varchar(512),
	page_title varchar(255),
	created timestamp default CURRENT_TIMESTAMP,
	primary key event_id (event_id),
	index parent_event_id (parent_event_id),
	index user_id_event_id (user_id, event_id),
	index created (created)
) engine=InnoDB;

alter table events add index user_id_thing_id_created (user_id, thing_id, created);

create table if not exists rarity (
	rarity_id int unsigned auto_increment,
	threshold float,
	name varchar(255),
	primary key rarity_id (rarity_id),
	index name (name),
	index threshold (threshold)
) engine=InnoDB;

create table if not exists games (
	game_id int unsigned auto_increment,
	game varchar(1024),
	url varchar(2048),
	primary key game_id (game_id),
	index game (game),
	index url (url)
) engine=InnoDB;

create table if not exists scores (
	score_id int unsigned auto_increment,
	user_id int unsigned,
	name varchar(255),
	game_id int unsigned,
	score int unsigned,
	created timestamp default CURRENT_TIMESTAMP,
	primary key score_id (score_id),
	index user_id (user_id, created),
	index game_id (game_id, score)
) engine=InnoDB;

delete from rarity;
insert into rarity (threshold, name) values (0.001,'Mythical');
insert into rarity (threshold, name) values (0.003,'Legendary');
insert into rarity (threshold, name) values (0.010,'Epic');
insert into rarity (threshold, name) values (0.032,'Rare');
insert into rarity (threshold, name) values (0.101,'Uncommon');
insert into rarity (threshold, name) values (0.318,'Common');
insert into rarity (threshold, name) values (1.000,'Ubiquitous');

delete from games;
insert into games (game_id, game, url) values (1, "Shooty Ship", "/shooty-ship/game");

create table if not exists jsos (
	jso_id bigint unsigned auto_increment,
	owner_id int unsigned default 0,
	name varchar(1024),
	data text,
	primary key jso_id (jso_id),
	index name(name)
) engine=InnoDB;

create table if not exists jso_user (
	jso_user_id bigint unsigned auto_increment,
	user_id int unsigned default 0,
	jso_id bigint unsigned,
	can_read boolean default 1,
	can_write boolean default 0,
	can_execute boolean default 1,
	primary key jso_user_id (jso_user_id),
	unique jso_user (jso_id, user_id)
) engine=InnoDB;

