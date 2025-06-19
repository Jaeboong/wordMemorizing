/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: word
-- ------------------------------------------------------
-- Server version	11.7.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `test_results`
--

DROP TABLE IF EXISTS `test_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `total_questions` int(11) NOT NULL,
  `correct_answers` int(11) NOT NULL,
  `test_date` timestamp NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_test_group` (`group_id`) USING BTREE,
  KEY `fk_test_user` (`user_id`),
  CONSTRAINT `test_results_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `word_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_results_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_results`
--

LOCK TABLES `test_results` WRITE;
/*!40000 ALTER TABLE `test_results` DISABLE KEYS */;
INSERT INTO `test_results` VALUES
(1,1,3,1,'2025-06-11 11:04:27',3),
(2,1,10,4,'2025-06-11 11:14:24',3),
(3,1,21,15,'2025-06-11 11:26:18',3),
(4,2,10,4,'2025-06-11 11:44:25',3),
(5,3,10,6,'2025-06-11 12:51:20',3),
(6,3,10,7,'2025-06-11 12:52:37',3),
(7,2,10,6,'2025-06-11 12:53:45',3),
(8,2,10,5,'2025-06-11 12:54:33',3),
(9,2,10,6,'2025-06-11 12:56:32',3),
(10,1,10,8,'2025-06-12 03:20:13',3),
(11,2,10,5,'2025-06-12 03:21:12',3),
(12,2,10,7,'2025-06-12 03:22:06',3),
(13,3,10,5,'2025-06-12 03:23:01',3),
(14,3,10,5,'2025-06-12 03:23:57',3),
(15,3,10,5,'2025-06-12 03:24:55',3),
(16,3,10,8,'2025-06-12 03:25:59',3),
(17,4,10,1,'2025-06-12 03:26:52',3),
(18,4,10,7,'2025-06-12 05:36:29',3),
(19,5,10,7,'2025-06-12 05:42:39',3),
(20,5,10,6,'2025-06-12 05:43:32',3),
(21,5,20,9,'2025-06-12 06:31:25',3),
(22,6,9,4,'2025-06-12 06:49:15',3),
(23,6,9,8,'2025-06-12 06:49:58',3),
(24,6,14,11,'2025-06-12 08:20:07',3),
(25,6,10,5,'2025-06-12 12:28:14',3),
(26,1,15,9,'2025-06-12 12:30:12',3),
(27,5,20,7,'2025-06-12 12:33:03',3),
(28,5,10,6,'2025-06-12 13:10:11',3),
(29,5,10,5,'2025-06-12 13:11:02',3),
(30,7,5,2,'2025-06-12 14:11:26',3),
(31,7,5,3,'2025-06-12 14:33:43',3),
(32,4,15,7,'2025-06-12 15:35:37',3),
(33,4,14,13,'2025-06-12 15:39:30',3),
(34,4,17,16,'2025-06-14 16:30:55',3);
/*!40000 ALTER TABLE `test_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `preference_key` varchar(50) NOT NULL,
  `preference_value` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_preference_unique` (`user_id`,`preference_key`),
  KEY `fk_preference_user` (`user_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preferences`
--

LOCK TABLES `user_preferences` WRITE;
/*!40000 ALTER TABLE `user_preferences` DISABLE KEYS */;
INSERT INTO `user_preferences` VALUES
(1,'groups_sort_option','name_asc','2025-06-12 12:28:49','2025-06-19 08:50:51',3);
/*!40000 ALTER TABLE `user_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kakao_id` varchar(255) NOT NULL COMMENT '카카오 사용자 ID',
  `nickname` varchar(255) NOT NULL COMMENT '사용자 닉네임',
  `last_login_at` datetime DEFAULT NULL COMMENT '마지막 로그인 시간',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kakao_id` (`kakao_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admin','admin',NULL,'2025-06-19 08:12:02','2025-06-19 08:12:02'),
(3,'4312261205','☆','2025-06-19 08:21:30','2025-06-19 08:19:58','2025-06-19 08:21:30');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `word_groups`
--

DROP TABLE IF EXISTS `word_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `word_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_wordgroup_user` (`user_id`),
  CONSTRAINT `word_groups_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `word_groups`
--

LOCK TABLES `word_groups` WRITE;
/*!40000 ALTER TABLE `word_groups` DISABLE KEYS */;
INSERT INTO `word_groups` VALUES
(1,'part1-1','2025-06-11 11:02:26',3),
(2,'토익 기본 어휘','2025-06-11 11:32:47',3),
(3,'part1-2','2025-06-11 12:42:04',3),
(4,'헷갈리는 단어 in RC','2025-06-11 13:00:59',3),
(5,'part2-1','2025-06-12 05:36:44',3),
(6,'헷갈리는 단어 in LC','2025-06-12 06:44:26',3),
(7,'part3-1','2025-06-12 13:32:17',3);
/*!40000 ALTER TABLE `word_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `words`
--

DROP TABLE IF EXISTS `words`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `words` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `english` varchar(255) NOT NULL,
  `korean` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_word_group` (`group_id`) USING BTREE,
  CONSTRAINT `words_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `word_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `words`
--

LOCK TABLES `words` WRITE;
/*!40000 ALTER TABLE `words` DISABLE KEYS */;
INSERT INTO `words` VALUES
(4,1,'within','~내에, 기간내에','2025-06-11 11:10:00'),
(5,1,'given that','고려하면','2025-06-11 11:10:06'),
(6,1,'regardless of','~와 상관없이','2025-06-11 11:10:15'),
(7,1,'due to','~때문에','2025-06-11 11:10:20'),
(8,1,'authorize','인가하다','2025-06-11 11:10:52'),
(9,1,'transit','배송, 이송','2025-06-11 11:11:02'),
(10,1,'buisness day','영업일','2025-06-11 11:11:15'),
(11,1,'track','추적하다','2025-06-11 11:11:23'),
(12,1,'substantial','상당한','2025-06-11 11:11:37'),
(13,1,'revenue','수익','2025-06-11 11:11:42'),
(14,1,'staffing concerns','직원 채용 문제','2025-06-11 11:11:53'),
(15,1,'meanwhile','한편','2025-06-11 11:12:01'),
(16,1,'forecast','예측','2025-06-11 11:12:06'),
(17,1,'purposely','고의적으로','2025-06-11 11:12:14'),
(18,1,'at the time','~할 때','2025-06-11 11:12:20'),
(19,1,'markedly','현저하게','2025-06-11 11:12:32'),
(20,1,'fulfillment','실현','2025-06-11 11:16:47'),
(21,1,'admission','입학','2025-06-11 11:16:51'),
(22,1,'initiative','계획','2025-06-11 11:16:57'),
(23,1,'absence','부재','2025-06-11 11:17:02'),
(24,2,'aisle','통로','2025-06-11 11:33:00'),
(25,2,'lid','뚜껑','2025-06-11 11:33:03'),
(26,2,'put on','입다','2025-06-11 11:33:10'),
(27,2,'vacuum','청소하다, 진공청소기로 청소하다','2025-06-11 11:33:29'),
(28,2,'briefcase','서류가방','2025-06-11 11:33:34'),
(29,2,'microphone','마이크','2025-06-11 11:33:39'),
(30,2,'bow','인사하다','2025-06-11 11:33:45'),
(31,2,'be seated','앉다','2025-06-11 11:33:49'),
(32,2,'laundry','세탁물','2025-06-11 11:34:00'),
(33,2,'chop','썰다, 다지다','2025-06-11 11:34:12'),
(34,2,'weigh','무게를 재다','2025-06-11 11:34:18'),
(35,2,'shelving unit','선반','2025-06-11 11:34:24'),
(36,2,'artwork','예술 작품','2025-06-11 11:34:33'),
(37,2,'mop','대걸레로 닦다, 닦다, 대걸레','2025-06-11 11:34:43'),
(38,2,'sculpture','조각상','2025-06-11 11:34:49'),
(39,2,'necklace','목걸이','2025-06-11 11:34:58'),
(40,2,'button','단추를 채우다, 버튼','2025-06-11 11:35:11'),
(41,2,'scrub','문지르다, 문질러 씻다','2025-06-11 11:35:19'),
(42,2,'pile','쌓다','2025-06-11 11:35:37'),
(43,2,'pick up','집어 들다, 따다, 꺾다','2025-06-11 11:35:48'),
(44,2,'serve','제공하다, 서빙하다, 응대하다','2025-06-11 11:35:56'),
(45,2,'board','탑승하다, 판자, 칠판','2025-06-11 11:36:02'),
(46,2,'frame','틀에 넣다, 틀','2025-06-11 11:36:11'),
(47,2,'rest','놓다, 놓여있다, 휴식을 취하다','2025-06-11 11:36:22'),
(48,2,'stir','젓다','2025-06-11 11:36:42'),
(49,2,'sip','홀짝이다, 조금씩 마시다','2025-06-11 11:36:51'),
(50,2,'wave','손짓하다, 손을 흔들다, 흔들다, 파도','2025-06-11 11:37:08'),
(51,2,'border','경계를 이루다, 접하다, 경계','2025-06-11 11:37:18'),
(52,2,'set up','설치하다, 놓다','2025-06-11 11:37:24'),
(53,2,'dine','식사하다','2025-06-11 11:37:37'),
(54,2,'stock','채우다','2025-06-11 11:37:41'),
(55,2,'fasten','매다, 고정시키다, 잠그다','2025-06-11 11:37:50'),
(56,2,'polish','닦다, 윤이 나도록','2025-06-11 11:38:01'),
(57,2,'run','나 있다, 이어지다, 길 등이 나있다','2025-06-11 11:38:26'),
(58,2,'sort','분류하다, 종류','2025-06-11 11:38:33'),
(59,2,'sew','바느질하다','2025-06-11 11:38:38'),
(60,2,'put away','치우다','2025-06-11 11:38:45'),
(61,2,'stare','쳐다보다, 응시하다','2025-06-11 11:38:59'),
(66,1,'pull','끌다, 당기다','2025-06-11 11:50:00'),
(67,1,'row','노를 젓다','2025-06-11 11:50:16'),
(68,1,'mount','장착하다, 설치하다','2025-06-11 11:50:20'),
(69,1,'dock','부두에 대다, 부두','2025-06-11 11:50:29'),
(70,1,'cast','드리우다','2025-06-11 11:50:35'),
(71,1,'put up','세우다, 설치하다, 게시하다','2025-06-11 11:50:45'),
(72,1,'take off','꺼내다, 떼어내다, 벗다, 이륙하다, (off -> 떨어짐, 뭔가 떠오름)','2025-06-11 11:50:55'),
(73,3,'pile','더미, 무더기','2025-06-11 12:46:30'),
(74,3,'board','판자, 이사회','2025-06-11 12:46:40'),
(75,3,'frame','틀에 넣다, 틀','2025-06-11 12:46:46'),
(76,3,'rest','휴식, 쉬다','2025-06-11 12:46:52'),
(77,3,'extend','뻗다, 펼치다','2025-06-11 12:47:04'),
(78,3,'stir','젓다, 섞다','2025-06-11 12:47:14'),
(79,3,'sip','홀짝이다, 조금씩 마시다','2025-06-11 12:47:22'),
(80,3,'work on','~을 작업하다','2025-06-11 12:47:30'),
(81,3,'browse','둘러보다, 훑어보다','2025-06-11 12:47:46'),
(82,3,'lie','놓여있다, 눕다','2025-06-11 12:47:54'),
(83,3,'border','경계를 이루다, 접하다, 경계','2025-06-11 12:48:06'),
(84,3,'stock','재고, 비축하다','2025-06-11 12:48:17'),
(85,3,'fasten','매다, 고정시키다, 잠그다','2025-06-11 12:48:24'),
(86,3,'sort','분류하다, 종류','2025-06-11 12:48:39'),
(87,3,'put away','치우다','2025-06-11 12:48:44'),
(88,3,'stare','응시하다, 쳐다보다','2025-06-11 12:48:53'),
(89,3,'row','노를 젓다, 열, 줄','2025-06-11 12:49:10'),
(90,3,'mount','장착하다, 설치하다','2025-06-11 12:49:15'),
(91,3,'dock','부두에 대다, 부두','2025-06-11 12:49:22'),
(92,3,'put up','세우다, 설치하다, 게시하다, 내걸다','2025-06-11 12:49:30'),
(93,3,'cast','던지다, 배역을 정하다','2025-06-11 12:49:33'),
(94,3,'post','게시하다, 공고하다, 기둥','2025-06-11 12:49:41'),
(95,3,'take off','꺼내다, 떼어내다, 벗다, 이륙하다','2025-06-11 12:49:49'),
(96,4,'obtain','얻다, 획득하다','2025-06-11 13:01:09'),
(97,4,'fluctuate','오르내리다','2025-06-11 13:01:16'),
(98,4,'stock price','주가','2025-06-11 13:01:23'),
(99,4,'share','주식, 주권, 몫','2025-06-11 13:01:31'),
(100,4,'fulfill','성취하다, 끝내다','2025-06-11 13:01:41'),
(101,4,'recall','상기하다, 생각해내다','2025-06-11 13:01:46'),
(102,4,'several','여러 개의','2025-06-11 13:02:10'),
(103,4,'contract','계약','2025-06-11 13:08:04'),
(104,4,'venue','장소','2025-06-11 13:08:22'),
(105,4,'terms','조건, 조항','2025-06-11 13:08:37'),
(106,5,'responsible','담당하는, 책임이 있는','2025-06-12 05:37:15'),
(107,5,'utility','공공시설, 공공요금','2025-06-12 05:37:27'),
(108,5,'about to leave','막 떠나려 하다','2025-06-12 05:37:57'),
(109,5,'sick leave','병가','2025-06-12 05:38:04'),
(110,5,'session','세션, 회기, 기간','2025-06-12 05:38:12'),
(111,5,'organize','준비하다, 정리하다','2025-06-12 05:38:20'),
(112,5,'revise','수정하다, 개정하다','2025-06-12 05:38:25'),
(113,5,'charge','책임, 요금, 담당','2025-06-12 05:38:35'),
(114,5,'document','문서, 서류, 기록하다','2025-06-12 05:38:50'),
(115,5,'projection','예상, 추정, 영상','2025-06-12 05:39:08'),
(116,5,'bill','고지서, 청구서, 청구하다','2025-06-12 05:39:20'),
(117,5,'colleague','동료','2025-06-12 05:39:27'),
(118,5,'review','비평, 검토, 평론, 검토하다','2025-06-12 05:39:42'),
(119,5,'make it','가다, 참석하다','2025-06-12 05:39:54'),
(120,5,'proofread','교정하다','2025-06-12 05:40:13'),
(121,5,'committee','위원회','2025-06-12 05:40:22'),
(122,5,'flyer','전단, 전단지','2025-06-12 05:40:29'),
(123,5,'ship','보내다, 발송하다','2025-06-12 05:40:38'),
(124,5,'take over','인계받다, 이어받다','2025-06-12 05:40:44'),
(125,5,'~get to','~에 도착하다','2025-06-12 05:40:53'),
(126,5,'draft','초안, 원고','2025-06-12 05:41:00'),
(127,5,'formal','공식적인, 격식을 갖춘','2025-06-12 05:41:14'),
(128,5,'banquet','연회, 만찬','2025-06-12 05:41:20'),
(129,5,'reception','환영회, 접수처','2025-06-12 06:03:12'),
(130,5,'consult','상의하다, 자문하다, 참고하다','2025-06-12 06:03:21'),
(131,5,'reimburse','환급하다, 상환하다','2025-06-12 06:03:27'),
(132,5,'challenging','도전적인, 힘든','2025-06-12 06:03:37'),
(133,5,'run out','다 쓰다, 떨어지다','2025-06-12 06:03:43'),
(134,5,'transfer','이동하다, 전근시키다, 전근, 이동','2025-06-12 06:03:56'),
(135,5,'invoice','청구서, 송장','2025-06-12 06:04:03'),
(136,5,'abroad','해외에, 해외로','2025-06-12 06:04:12'),
(137,5,'inventory','재고 조사, 재고 정리, 재고','2025-06-12 06:27:19'),
(138,5,'identification','신분증','2025-06-12 06:27:25'),
(139,5,'go ahead','계속하다, 어서 ~하세요','2025-06-12 06:27:35'),
(140,5,'belong to','~에 속하다, ~의 소유이다','2025-06-12 06:27:43'),
(141,5,'branch','지점, 위치','2025-06-12 06:27:57'),
(142,5,'ask for','~을 요청하다, 요청하다','2025-06-12 06:28:08'),
(143,5,'know if','~인지 알다','2025-06-12 06:28:19'),
(144,5,'personnel','직원들, 인사과','2025-06-12 06:28:25'),
(145,5,'downtown','시내에, 도심에, 시내, 도심','2025-06-12 06:28:35'),
(146,5,'renew','갱신하다','2025-06-12 06:28:39'),
(147,5,'directory','안내 책자, 명부','2025-06-12 06:28:51'),
(148,5,'no later than','늦어도 ~까지','2025-06-12 06:28:56'),
(149,5,'certified','공인의, 인증된, 인가된','2025-06-12 06:29:05'),
(150,5,'deserve','받을 만하다','2025-06-12 06:29:12'),
(151,5,'council','의회','2025-06-12 06:29:15'),
(152,5,'be supposed to','~하기로 되어 있다','2025-06-12 06:29:23'),
(153,6,'green light','허가','2025-06-12 06:44:39'),
(154,6,'toxic fume','유독 가스','2025-06-12 06:44:46'),
(155,6,'in light of','~를 고려하여','2025-06-12 06:44:57'),
(156,6,'controversy','논란','2025-06-12 06:45:06'),
(157,6,'public forum','공개 토론회','2025-06-12 06:45:10'),
(158,6,'express concern','우려를 표명하다','2025-06-12 06:45:17'),
(159,6,'expert','전문가','2025-06-12 06:46:00'),
(160,6,'An \"official\" will be interviewed','공무원','2025-06-12 06:47:29'),
(161,6,'A meeting will be \"held\"','열리다','2025-06-12 06:47:50'),
(162,6,'press conference','기자 회견','2025-06-12 08:17:07'),
(163,6,'conference','회의','2025-06-12 08:17:11'),
(164,6,'host','주최하다','2025-06-12 08:17:19'),
(165,6,'\"To locate\" a service facility','~를 찾으려면','2025-06-12 08:17:58'),
(166,6,'To \"inquire\" about vacation packages','문의하다','2025-06-12 08:18:40'),
(167,6,'automobile','자동차','2025-06-12 08:54:05'),
(168,6,'oversee','감독하다, 감시하다','2025-06-12 09:21:23'),
(169,6,'slipped my mind','잊어버리다','2025-06-12 10:12:12'),
(170,6,'harvest','수확하다','2025-06-12 10:17:16'),
(171,6,'grasp','잡다','2025-06-12 10:20:01'),
(172,5,'quite','꽤, 상당히','2025-06-12 13:21:02'),
(173,6,'candidate','후보자, 지원자','2025-06-12 13:32:33'),
(174,6,'not until','~이 되기 전까지는','2025-06-12 13:32:45'),
(175,6,'issue','발행하다, 발급하다, 문제, 쟁점','2025-06-12 13:32:54'),
(176,6,'take','가져가다, 받다','2025-06-12 13:47:41'),
(178,6,'Yes, I \"believe so\"','그런 것 같다','2025-06-12 13:53:08'),
(179,6,'\"To secure\" a space','확보하다, (자리를)','2025-06-12 13:53:29'),
(180,6,'such short notice','이렇게 촉박한 통보','2025-06-12 13:59:38'),
(183,4,'transfer','전근하다, 이전하다','2025-06-12 15:25:50'),
(184,4,'branch','지사, 지점','2025-06-12 15:25:58'),
(185,4,'moreover','게다가','2025-06-12 15:31:53'),
(186,4,'cram','벼락치기','2025-06-12 15:32:55'),
(187,4,'aside from','~와 별개로','2025-06-14 16:26:58'),
(188,4,'prior to','~에 앞서, ~보다 먼저','2025-06-14 16:27:09'),
(189,4,'how experienced they may be','그들이 아무리 경력이 많아도','2025-06-14 16:28:38'),
(190,4,'even though','비록 ~이지만','2025-06-14 16:33:51'),
(191,4,'hold, held, be held','개최하다, 열릴 예정이다','2025-06-14 16:34:15'),
(192,4,'sustained','지속된, 유지된','2025-06-14 16:35:27'),
(193,4,'pending','미처리된, 미결의','2025-06-14 16:35:38'),
(194,4,'in order to','~하기 위해','2025-06-14 16:36:21'),
(195,4,'finance','비용을 대다, 충당하다','2025-06-14 16:42:25'),
(196,4,'be finished with','~을 완료하다, 끝내다','2025-06-14 16:45:34'),
(197,4,'due to','~로 인해, ~때문에','2025-06-14 16:45:40'),
(198,4,'abruptly','갑자기','2025-06-14 16:46:04'),
(199,4,'estimate','추정하다, 견적','2025-06-14 16:46:39'),
(200,4,'index','색인, 지수','2025-06-14 16:48:48'),
(201,4,'phase','단계','2025-06-14 16:48:53'),
(202,4,'edition','판, 호','2025-06-14 16:48:58'),
(203,4,'identify','~을 찾다, 확인하다','2025-06-14 16:49:48'),
(204,4,'premise','부지, 구내','2025-06-14 16:51:16'),
(205,4,'institute','기관, 단체','2025-06-14 16:53:25'),
(206,4,'indicate','가리키다, 나타내다, 언급하다, 암시하다','2025-06-14 16:58:30'),
(207,4,'suggested','제안하다, 암시하다, 시사하다','2025-06-14 17:00:27'),
(208,6,'sit in on','참관하다','2025-06-19 07:13:09'),
(209,7,'applicant','지원자','2025-06-19 07:13:15');
/*!40000 ALTER TABLE `words` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-06-19 13:10:53
