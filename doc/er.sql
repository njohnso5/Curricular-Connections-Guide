CREATE TABLE `Administrator` (
  `id` integer,
  `unity_id` string,
  `role_id` string
);

CREATE TABLE `Role` (
  `id` integer,
  `role` enum
);

CREATE TABLE `Showing` (
  `id` integer,
  `datetime` datetime,
  `location` string,
  `price` string,
  `program_id` integer
);

CREATE TABLE `Program` (
  `id` integer,
  `department` enum,
  `link` string,
  `title` string,
  `description` string,
  `semster_id` integer
);

CREATE TABLE `Program_To_Theme` (
  `program_id` integer,
  `theme_id` integer
);

CREATE TABLE `Course_To_Theme` (
  `course_id` integer,
  `theme_id` integer
);

CREATE TABLE `Course_To_Faculty` (
  `course_id` integer,
  `faculty_id` integer
);

CREATE TABLE `Theme` (
  `id` integer,
  `name` string
);

CREATE TABLE `Semester` (
  `id` integer,
  `year` integer,
  `active` bool,
  `period_id` integer
);

CREATE TABLE `Period` (
  `id` integer,
  `period` enum
);

CREATE TABLE `Course` (
  `id` integer,
  `title_short` string,
  `title_long` string,
  `description` string,
  `topic_description` string,
  `subject_id` integer,
  `catalog_number` integer,
  `semester_id` integer
);

CREATE TABLE `Subject` (
  `id` integer,
  `subject` string
);

CREATE TABLE `Faculty` (
  `id` integer,
  `name` string,
  `email` string
);

CREATE TABLE `AdminLog` (
  `id` integer PRIMARY KEY,
  `unity_id` varchar(255),
  `call` varchar(255),
  `datetime` timestamp
);

CREATE TABLE `UserLog` (
  `id` integer PRIMARY KEY,
  `querySearch` varchar(255),
  `datetime` timestamp
);

ALTER TABLE `Role` ADD FOREIGN KEY (`id`) REFERENCES `Administrator` (`role_id`);

ALTER TABLE `Program` ADD FOREIGN KEY (`id`) REFERENCES `Showing` (`program_id`);

ALTER TABLE `Program` ADD FOREIGN KEY (`semster_id`) REFERENCES `Semester` (`id`);

ALTER TABLE `Program` ADD FOREIGN KEY (`id`) REFERENCES `Program_To_Theme` (`program_id`);

ALTER TABLE `Theme` ADD FOREIGN KEY (`id`) REFERENCES `Program_To_Theme` (`theme_id`);

ALTER TABLE `Theme` ADD FOREIGN KEY (`id`) REFERENCES `Course_To_Theme` (`theme_id`);

ALTER TABLE `Semester` ADD FOREIGN KEY (`period_id`) REFERENCES `Period` (`id`);

ALTER TABLE `Course` ADD FOREIGN KEY (`id`) REFERENCES `Course_To_Theme` (`course_id`);

ALTER TABLE `Course` ADD FOREIGN KEY (`semester_id`) REFERENCES `Semester` (`id`);

ALTER TABLE `Subject` ADD FOREIGN KEY (`id`) REFERENCES `Course` (`subject_id`);

ALTER TABLE `Course_To_Faculty` ADD FOREIGN KEY (`faculty_id`) REFERENCES `Faculty` (`id`);

ALTER TABLE `Course_To_Faculty` ADD FOREIGN KEY (`course_id`) REFERENCES `Course` (`id`);
