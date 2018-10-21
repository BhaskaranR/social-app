CREATE SCHEMA `pricing` ;

CREATE TABLE `pricing`.`event_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(50) NOT NULL,
  `event_category` varchar(45) NOT NULL,
  `event_subcategory` varchar(45) NOT NULL DEFAULT '',
  `reward_type` varchar(45) NOT NULL,
  `reward_value` decimal(10,2) NOT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expired` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`,`event_name`,`event_category`,`event_subcategory`)
);

CREATE TABLE `pricing`.`event` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `person` varchar(45) NOT NULL,
  `action_id` varchar(45) NOT NULL,
  `event_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`person`,`action_id`,`event_id`),
  KEY `event_id_idx` (`event_id`),
  CONSTRAINT `event_id` FOREIGN KEY (`event_id`) REFERENCES `event_points` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);


CREATE TABLE `pricing`.`event_rewards` (
  `person` varchar(45) NOT NULL,
  `event_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`person`,`action_id`,`event_id`),
  KEY `event_id_idx` (`event_id`)
);

CREATE TABLE `pricing`.`reward_events` (
  `event_id` int(11) NOT NULL,
  `action_id` varchar(45) NOT NULL,
  `person_id` varchar(45) NOT NULL,
  `reward` decimal(10,2) NOT NULL,
  `created_date` datetime NOT NULL,
  `reason` varchar(45) DEFAULT NULL,
  `reward_type` varchar(45) DEFAULT NULL,
  `updated_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`,`person_id`,`reward`,`action_id`),
  KEY `event_id_idx` (`event_id`),
  KEY `person_id_idx` (`person_id`),
  KEY `event_idx` (`event_id`),
  KEY `person_idx` (`person_id`),
  CONSTRAINT `event` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

