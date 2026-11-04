PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_init.sql','2026-10-29 01:50:09');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0002_character_api.sql','2026-10-29 02:07:00');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(3,'0003_sanctuary_schedules.sql','2026-10-29 02:23:57');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(4,'0004_sanctuary_members_and_shared.sql','2026-10-29 03:36:09');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(5,'0005_sanctuary_party.sql','2026-10-29 03:45:46');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(6,'0006_weekly_homework.sql','2026-10-29 03:55:19');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(7,'0007_wednesday_reset_force_cleanup.sql','2026-10-29 04:07:06');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(8,'0008_abyss_persistent.sql','2026-10-29 04:17:03');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(9,'0009_party_notes_and_markers.sql','2026-10-29 04:28:08');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(10,'0010_member_markers_abyss_reset.sql','2026-10-29 04:38:24');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(11,'0011_sanctuary_character_notes.sql','2026-10-29 05:04:38');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(12,'0012_independent_character_party_slots.sql','2026-10-29 06:08:48');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(13,'0013_homework_od_amounts.sql','2026-10-29 06:16:22');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(14,'0014_homework_character_order.sql','2026-10-29 06:31:34');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(15,'0015_homework_od_persistent.sql','2026-10-29 06:38:37');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(16,'0016_character_power_auto_refresh.sql','2026-10-29 06:54:23');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(17,'0018_homework_od_caps_membership_default.sql','2026-10-29 07:40:48');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(18,'0019_shared_sanctuary_schedule_notes.sql','2026-10-29 07:51:48');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(19,'0020_content_schedule_server_matches.sql','2026-10-29 08:37:13');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(20,'0021_inquiries_board.sql','2026-11-04 02:22:08');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(21,'0022_admin_audit_history.sql','2026-11-04 03:38:59');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(22,'0023_admin_audit_ip.sql','2026-11-04 03:38:59');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(23,'0024_homework_custom_columns.sql','2026-11-04 03:54:35');
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('ccd103b9ed19cb67e06ada6f71d2a056256c5527349ec9485da1a1dea4e01456','슬롱',1793247179,1793851979);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('6e60f62aa9eb4f5e5ffe37198663a26a8afdf18594802399702a620cb0e6cfe2','MID',1793247232,1793852032);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('4c3cbe9802d4b6cd1fe38fe242dbc8b83b7a32846ae1f09e976674760b9a175a','청이',1793247361,1793852161);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('722f3c931379068570bd334540f004a10612476f52b3b401baa6e41bc4f4bbfb','니코틴',1793247850,1793852650);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('04a326f0222f83c75243751f6cdff38403f8772ff606c12f2a529e264a1b6fe9','비큐',1793248849,1793853649);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('338f52fde317a6d3f65d57462cd111f055ca9508e39c734aafd6ea23c381a60a','영양',1793252672,1793857472);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('2d3d3eb543af718a513250fff99f5fae321f9ed3f59c121923d8100d36805b49','알코올',1793253432,1793858232);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('8a81d9220fbec1507417615a3954dd7ffc1aff1ef508c2acf203bfeb2d80fd78','허니',1793256064,1793860864);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('2f42229d9d42a3f9b27718825a0fabacc0fbab0d08c7be072f17fba6c0ea00de','달나비',1793264883,1793869683);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('66efe90893132a24c0bc78de25c4bc9b254ec0133b90da8a7c57b07ca299645c','슬롱',1793269556,1793874356);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('d8535cd7ff37d95c01003a59de8df282aaec474fd7d32f3e22879ab198f7d316','비큐',1793272043,1793876843);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('4f87316e6a1efe21ae2a55bffa709289ebde816222d5b9dff28cb72806f42b6b','달나비',1793288883,1793893683);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('ea20e3670ad2e89a02a26f964a2e425462ad802ab91f92ec635effb389c0d378','슬롱',1793322326,1793927126);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('e55b18ad8ccd5d94449478a5f6dc635fef62ab0d771448a8eb96a9ea076bf6c7','슬롱',1793322339,1793927139);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('cb8f631b435fee4f40b690c178cb09b5b8f75de01b4d12926e283020425b99b2','슬롱',1793322436,1793927236);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('4aa4256d2d1ca6e1cab538faaef4c61866b14e830173b742e229cf387d2e480c','슬롱',1793322550,1793927350);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('c9b11978d401b2e52a2169b2848bdddf5e0c34ae3538790b95a7fae33fc7b9fe','달나비',1793370310,1793975110);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('67cf4ff0412323e691703cefd1f3d91659cc97afdac14b04f64cafa1fe3566b7','비큐',1793498271,1794103071);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('fb8ff9fae2496162f37deb53b372855d0d35e780c4e1a63b578daa4678d7b678','허니',1793586160,1794190960);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('41fd303c85feb8362f28d1e757d9dc36ce4c860585781540a76c1790691bebcd','캣맘',1793586333,1794191133);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('611131a39c739d4d2b4ddb4ea632e997fca0be3353bbdc816bbe5ee61d3bcf17','알코올',1793590557,1794195357);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('8bd7ed24fc34107c8b99035cd62e4da843d6adfc29bd420e956c26af06155d30','청이',1793590743,1794195543);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('441a71dd2b0f8f33e27520505906f73f975379c4e8beb9109d41617b4764ea1a','불능',1793600590,1794205390);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('3ab5994560101de699dba40427437297cbe339ef21b95063fb32cdec0dd96a90','로이엘',1793600750,1794205550);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('1163ec1a67cbf5b599e7e675e1710fcb1ce3eb5bdba29299dca789d9760b87ce','LI코틴',1793611661,1794216461);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('0bae6d8dbe5b4c4318309231f6cf0fb7812926756728a27cfe94de6a1ecdf873','비큐',1793703099,1794307899);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('9a759b0a16a6f8b2cd3a7956537040dbe64751f167eeffc32a3b26305bb142bd','허니',1793759108,1794363908);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('0fd04672a9655f4690c8d86da61e167b35b9a2c74a2575c1850b5a66a3b5b6b6','슬롱',1793764599,1794369399);
CREATE TABLE IF NOT EXISTS "characters" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_name TEXT NOT NULL,
  character_name TEXT NOT NULL COLLATE NOCASE,
  server_id INTEGER NOT NULL DEFAULT 2003 CHECK (server_id BETWEEN 1 AND 999999),
  class_name TEXT NOT NULL,
  item_level INTEGER NOT NULL DEFAULT 0 CHECK (item_level >= 0),
  naddol_k REAL NOT NULL DEFAULT 0 CHECK (naddol_k >= 0),
  notes TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  synced_at INTEGER,
  UNIQUE (server_id, character_name)
);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(1,'슬롱','슬롱',2003,'검성',6726,1045.7,'','슬롱',1793240240,1793739661);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(11,'슬롱','슬론',2003,'마도성',5192,551.8,'','슬롱',1793246002,1793739661);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(12,'청이','댕청',2003,'살성',5721,686.6,'','청이',1793247385,1793739661);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(13,'청이','청이',2003,'궁성',6635,1044,'','청이',1793247772,1793739663);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(14,'청이','막둥이',2003,'검성',5003,509,'','청이',1793247777,1793739663);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(15,'청이','셀트리온',2003,'치유성',4854,482,'','청이',1793247784,1793739663);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(16,'LI코틴','LI코틴',2003,'권성',6468,1021,'','LI코틴',1793611787,1793739664);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(17,'LI코틴','니코틴',2003,'살성',6031,855,'','LI코틴',1793611788,1793739664);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(18,'LI코틴','코틴',2003,'정령성',4866,494.8,'','LI코틴',1793611788,1793739664);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(19,'알코올','알코올',2003,'치유성',6816,1108.5,'','알코올',1793247834,1793739664);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(20,'알코올','코올',2003,'호법성',5142,517.3,'','알코올',1793247837,1793739664);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(21,'알코올','알코오올',2003,'치유성',5540,666.8,'','알코올',1793247841,1793739664);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(22,'MID','MID',2003,'살성',6565,1013.5,'','MID',1793247857,1793739665);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(23,'MID','고민하다만든아이디',2003,'궁성',5342,629.8,'','MID',1793247861,1793739665);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(24,'허니','허니',2003,'호법성',6804,1082.5,'','허니',1793247882,1793739665);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(25,'허니','허늬',2003,'호법성',5457,582.6,'','허니',1793247885,1793739666);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(26,'허니','헌이',2003,'수호성',5492,635.6,'','허니',1793247888,1793739666);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(27,'달나비','달나비',2003,'마도성',6486,974.6,'','달나비',1793247904,1793739666);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(28,'달나비','밤나비',2003,'정령성',5034,529.9,'','달나비',1793247908,1793739970);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(29,'캣맘','캣맘',2003,'정령성',6671,1030.1,'','캣맘',1793247929,1793739970);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(30,'캣맘','드네스',2003,'마도성',5921,754.5,'','캣맘',1793247933,1793739970);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(31,'비큐','스렝',2003,'호법성',6618,1056.6,'','비큐',1793717426,1793739974);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(35,'불능','불능',2003,'궁성',6531,988.1,'','불능',1793248308,1793739974);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(36,'로이엘','로이엘',2003,'치유성',6627,966.3,'','로이엘',1793248317,1793739974);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(37,'로이엘','바라프',2003,'정령성',5338,649.5,'','로이엘',1793248318,1793739980);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(38,'로이엘','카웅',2003,'치유성',5453,677.7,'','로이엘',1793248319,1793739980);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(40,'영양','영양',2018,'치유성',6505,971.2,'','영양',1793253728,1793739980);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(41,'영양','솜구름',2018,'호법성',5485,620.2,'','영양',1793253724,1793739983);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(42,'비큐','비큐',2003,'궁성',6674,1067.5,'','비큐',1793717425,1793739983);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(43,'비큐','스피노스',2003,'마도성',5169,611.2,'','비큐',1793717427,1793739983);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(44,'비큐','아직살만해',2003,'검성',5194,576.4,'','비큐',1793717430,1793739988);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(45,'비큐','불패과장',2003,'호법성',5164,577.5,'','비큐',1793717429,1793739988);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(46,'비큐','호법대표',2003,'호법성',5286,574.3,'','비큐',1793717433,1793739988);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(47,'비큐','불패상무',2003,'호법성',5276,600.1,'','비큐',1793717428,1793740000);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(48,'비큐','정령대표',2003,'정령성',3630,275.2,'','비큐',1793717436,1793740001);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(49,'비큐','치료해주오',2003,'치유성',5912,742.5,'','비큐',1793717426,1793740000);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(50,'달나비','꿀나비',2003,'치유성',5341,608.8,'','달나비',1793251288,1793740261);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(51,'MID','미룡',2003,'궁성',4616,404,'','MID',1793251344,1793740261);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(52,'허니','푸니',2003,'궁성',4901,462.2,'','허니',1793251369,1793740261);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(53,'캣맘','유요',2003,'살성',5144,543.2,'','캣맘',1793251381,1793740261);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(54,'캣맘','협동',2003,'호법성',5292,606.2,'','캣맘',1793251385,1793740261);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(55,'캣맘','힐캐',2003,'치유성',5233,639.2,'','캣맘',1793251388,1793740261);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(56,'알코올','합성알코올',2003,'정령성',5154,514.8,'','알코올',1793251440,1793740262);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(57,'알코올','Alcohol',2003,'궁성',5149,517.2,'','알코올',1793251448,1793740262);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(58,'슬롱','스론',2003,'치유성',4929,464.3,'','슬롱',1793251931,1793740262);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(59,'슬롱','슬렁',2003,'정령성',5204,533,'','슬롱',1793251940,1793740263);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(60,'알코올','알콜알콜',2003,'마도성',4842,446.1,'','알코올',1793253475,1793740263);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(61,'영양','권성이올시다',2018,'권성',4702,486,'','영양',1793253737,1793740263);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(62,'슬롱','술렁',2003,'궁성',5349,582.7,'','슬롱',1793254812,1793740264);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(63,'슬롱','스롱',2003,'살성',3053,196.7,'','슬롱',1793256128,1793740264);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(64,'달나비','은나비',2003,'마도성',4863,474.1,'','달나비',1793288934,1793740264);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(65,'달나비','봄나비',2003,'치유성',3528,299.4,'','달나비',1793288967,1793740264);
CREATE TABLE sanctuary_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sanctuary TEXT NOT NULL CHECK (sanctuary IN ('4','3','2')),
  week_start TEXT NOT NULL,
  nickname TEXT NOT NULL COLLATE NOCASE,
  statuses TEXT NOT NULL DEFAULT '["","","","","", "", ""]',
  note TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (sanctuary, week_start, nickname)
);
CREATE TABLE sanctuary_members (
  sanctuary TEXT NOT NULL CHECK (sanctuary IN ('4','3','2')),
  nickname TEXT NOT NULL COLLATE NOCASE,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, nickname)
);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','슬롱','슬롱',1793244668);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','알코올','슬롱',1793245065);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','허니','슬롱',1793245067);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','캣맘','슬롱',1793245070);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','MID','슬롱',1793245073);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','청이','슬롱',1793245084);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','LI코틴','슬롱',1793245091);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','불능','슬롱',1793245091);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','로이엘','슬롱',1793245091);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','슬롱','슬롱',1793245111);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','MID','슬롱',1793245140);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','LI코틴','슬롱',1793245140);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','알코올','슬롱',1793245140);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','허니','슬롱',1793245140);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','청이','슬롱',1793245140);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','캣맘','슬롱',1793245140);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','달나비','슬롱',1793245140);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','로이엘','슬롱',1793245140);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('4','비큐','슬롱',1793252080);
INSERT INTO "sanctuary_members" ("sanctuary","nickname","created_by","created_at") VALUES('3','영양','슬롱',1793252656);
CREATE TABLE sanctuary_shared_availability (
  week_start TEXT NOT NULL,
  nickname TEXT NOT NULL COLLATE NOCASE,
  statuses TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (week_start, nickname)
);
INSERT INTO "sanctuary_shared_availability" ("week_start","nickname","statuses","updated_by","updated_at") VALUES('2026-11-04','슬롱','["pm","pm","pm","yes","yes","pm","pm"]','슬롱',1793764784);
CREATE TABLE sanctuary_member_characters (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  nickname TEXT NOT NULL COLLATE NOCASE,
  character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, nickname),
  UNIQUE (sanctuary, character_id)
);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('3','슬롱',11,'슬롱',1793253605);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('3','MID',22,'슬롱',1793253563);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('3','캣맘',30,'슬롱',1793250988);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('3','청이',12,'슬롱',1793251049);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('3','LI코틴',16,'슬롱',1793251267);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('4','비큐',31,'슬롱',1793252101);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('3','알코올',56,'슬롱',1793252607);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('3','달나비',50,'슬롱',1793252623);
INSERT INTO "sanctuary_member_characters" ("sanctuary","nickname","character_id","updated_by","updated_at") VALUES('3','로이엘',37,'슬롱',1793253580);
CREATE TABLE sanctuary_party_slots (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  nickname TEXT NOT NULL COLLATE NOCASE,
  party_number INTEGER NOT NULL CHECK(party_number BETWEEN 1 AND 8),
  slot_number INTEGER NOT NULL CHECK(slot_number BETWEEN 1 AND 5),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL, marker TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (sanctuary, nickname),
  UNIQUE (sanctuary, party_number, slot_number)
);
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','슬롱',1,1,'슬롱',1793250790,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','청이',1,2,'슬롱',1793250029,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','MID',1,3,'슬롱',1793250824,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','로이엘',1,5,'슬롱',1793250838,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','알코올',2,5,'슬롱',1793250848,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','캣맘',2,3,'슬롱',1793250853,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','불능',2,2,'슬롱',1793250882,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','허니',2,4,'슬롱',1793250875,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','LI코틴',2,1,'슬롱',1793250885,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','LI코틴',1,1,'슬롱',1793250973,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','MID',3,2,'슬롱',1793253574,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','캣맘',1,3,'슬롱',1793251002,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','허니',1,4,'슬롱',1793251019,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','청이',2,1,'슬롱',1793252157,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','슬롱',2,4,'슬롱',1793253613,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','로이엘',1,5,'슬롱',1793251121,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('4','비큐',1,4,'슬롱',1793252115,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','알코올',2,2,'슬롱',1793252618,'');
INSERT INTO "sanctuary_party_slots" ("sanctuary","nickname","party_number","slot_number","updated_by","updated_at","marker") VALUES('3','달나비',2,5,'슬롱',1793252634,'');
CREATE TABLE homework_progress (
  week_start TEXT NOT NULL,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL CHECK(task_key IN ('abyss','awakening','rudra','invasion','muspel','deltras','trial','craft')),
  completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (week_start,character_id,task_key)
);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',31,'abyss',1,1793603681);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',42,'abyss',1,1793604087);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',49,'abyss',1,1793607229);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',43,'abyss',1,1793607263);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',44,'abyss',1,1793609954);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',45,'abyss',1,1793610602);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',46,'abyss',1,1793611450);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',47,'abyss',1,1793690162);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-31',48,'abyss',1,1793690970);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-11-04',31,'rudra',1,1793757341);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-11-04',42,'rudra',1,1793757342);
CREATE TABLE sanctuary_party_details (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  party_number INTEGER NOT NULL CHECK(party_number BETWEEN 1 AND 8),
  note TEXT NOT NULL DEFAULT '' CHECK(length(note) <= 150),
  marker TEXT NOT NULL DEFAULT '' CHECK(marker IN ('','1','2','3','4','5','star','skull','moon')),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, party_number)
);
CREATE TABLE sanctuary_member_markers (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  nickname TEXT NOT NULL COLLATE NOCASE,
  marker TEXT NOT NULL CHECK(marker IN ('1','2','3','4','5','star','skull','moon')),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, nickname)
);
INSERT INTO "sanctuary_member_markers" ("sanctuary","nickname","marker","updated_by","updated_at") VALUES('4','슬롱','star','슬롱',1793250790);
INSERT INTO "sanctuary_member_markers" ("sanctuary","nickname","marker","updated_by","updated_at") VALUES('3','MID','1','슬롱',1793253574);
INSERT INTO "sanctuary_member_markers" ("sanctuary","nickname","marker","updated_by","updated_at") VALUES('3','LI코틴','star','슬롱',1793250973);
INSERT INTO "sanctuary_member_markers" ("sanctuary","nickname","marker","updated_by","updated_at") VALUES('3','캣맘','1','슬롱',1793251002);
INSERT INTO "sanctuary_member_markers" ("sanctuary","nickname","marker","updated_by","updated_at") VALUES('3','허니','2','슬롱',1793251019);
INSERT INTO "sanctuary_member_markers" ("sanctuary","nickname","marker","updated_by","updated_at") VALUES('3','청이','skull','슬롱',1793252157);
INSERT INTO "sanctuary_member_markers" ("sanctuary","nickname","marker","updated_by","updated_at") VALUES('3','로이엘','4','슬롱',1793251121);
INSERT INTO "sanctuary_member_markers" ("sanctuary","nickname","marker","updated_by","updated_at") VALUES('3','슬롱','star','슬롱',1793253613);
CREATE TABLE sanctuary_character_notes (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  character_id INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '' CHECK(length(note) <= 150),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, character_id),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',16,'1넴 9->12시(드리블), 신호 1시','슬롱',1793250973);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',23,'1넴 3시, 신호 3시','슬롱',1793255393);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',30,'1넴 3시, 신호 12시','슬롱',1793251002);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',24,'1넴 3시(드리블), 신호 11시','슬롱',1793251019);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',12,'1넴 12시->9시(드리블), 신호 11시','슬롱',1793252157);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',11,'1넴 6시, 신호 9시','슬롱',1793255404);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',36,'1넴 9->12시, 신호 깍두기','슬롱',1793254936);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',56,'1넴 6시, 신호 6시','슬롱',1793252618);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',50,'1넴 12->9시, 신호 깍두기','슬롱',1793252634);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',1,'1넴 9->12시(드리블), 신호 12시','슬롱',1793254734);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',22,'1넴 3시(드리블), 신호 1시','슬롱',1793254721);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',18,'1넴 6시, 신호 9시','슬롱',1793254776);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',17,'12->9시(드리블), 신호 11시','슬롱',1793254800);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',62,'1넴 6시, 신호 9시','슬롱',1793254832);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',28,'1넴 6시, 신호 6시','슬롱',1793254869);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',27,'1넴 3시, 신호 12시','슬롱',1793254891);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',37,'1넴 3시, 신호 3시','슬롱',1793255133);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',38,'1넴 12->9시, 신호 깍두기','슬롱',1793254971);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',19,'1넴 3시, 신호 깍두기','슬롱',1793255011);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',20,'1넴 3시, 신호 5시','슬롱',1793255035);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',40,'1넴 9->12시, 신호 깍두기','슬롱',1793255055);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',41,'1넴 6시(드리블), 신호 7시','슬롱',1793255088);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',61,'1넴 6시(드리블), 신호 7시','슬롱',1793255147);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',14,'1넴 12->9시(드리블), 신호 11시','슬롱',1793255179);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',13,'1넴 3시(드리블), 신호 3시','슬롱',1793255201);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',54,'1넴 6시(드리블), 신호 7시','슬롱',1793255222);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',55,'1넴 12->9시, 신호 깍두기','슬롱',1793255265);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',25,'1넴 9->12시, 신호 5시','슬롱',1793255307);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',26,'1넴 9->12시(드리블), 신호 1시','슬롱',1793255337);
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('3',51,'1넴 6시, 신호 6시','슬롱',1793255378);
CREATE TABLE sanctuary_character_party_slots (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  party_number INTEGER NOT NULL CHECK(party_number BETWEEN 1 AND 8),
  slot_number INTEGER NOT NULL CHECK(slot_number BETWEEN 1 AND 5),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, character_id),
  UNIQUE (sanctuary, party_number, slot_number)
);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',1,1,1,'슬롱',1793260918);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',13,1,2,'슬롱',1793250029);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',22,1,3,'슬롱',1793250824);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',36,1,5,'슬롱',1793250838);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',19,2,5,'슬롱',1793250848);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',29,2,3,'슬롱',1793250853);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',35,2,2,'슬롱',1793250882);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',24,2,4,'슬롱',1793250875);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',16,2,1,'슬롱',1793250885);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',16,1,1,'슬롱',1793250973);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',22,3,2,'슬롱',1793254721);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',30,1,3,'슬롱',1793251002);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',24,1,4,'슬롱',1793251019);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',12,2,1,'슬롱',1793252157);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',11,2,4,'슬롱',1793255404);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',31,1,4,'슬롱',1793252115);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',56,2,2,'슬롱',1793252618);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',50,2,5,'슬롱',1793252634);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',1,3,1,'슬롱',1793254734);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',18,4,2,'슬롱',1793254776);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',17,6,1,'슬롱',1793254800);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',62,6,2,'슬롱',1793254832);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',28,4,4,'슬롱',1793254869);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',27,5,3,'슬롱',1793254891);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',36,1,5,'슬롱',1793254936);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',37,3,3,'슬롱',1793255133);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',38,6,5,'슬롱',1793254971);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',19,3,5,'슬롱',1793255011);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',20,5,2,'슬롱',1793255035);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',40,5,5,'슬롱',1793255055);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',41,4,1,'슬롱',1793255088);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',61,2,3,'슬롱',1793255147);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',14,4,3,'슬롱',1793255179);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',13,5,4,'슬롱',1793255201);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',54,6,4,'슬롱',1793255222);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',55,4,5,'슬롱',1793255265);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',25,3,4,'슬롱',1793255307);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',26,5,1,'슬롱',1793255337);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',51,6,3,'슬롱',1793255378);
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('3',23,1,2,'슬롱',1793255393);
CREATE TABLE sanctuary_character_markers (
  sanctuary TEXT NOT NULL CHECK(sanctuary IN ('4','3','2')),
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  marker TEXT NOT NULL CHECK(marker IN ('1','2','3','4','5','star','skull','moon')),
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (sanctuary, character_id)
);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('4',1,'star','슬롱',1793260918);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',22,'1','슬롱',1793254721);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',16,'star','슬롱',1793250973);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',30,'1','슬롱',1793251002);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',24,'2','슬롱',1793251019);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',12,'skull','슬롱',1793252157);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',37,'3','슬롱',1793255133);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',1,'star','슬롱',1793254734);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',17,'skull','슬롱',1793254800);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',27,'4','슬롱',1793254891);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',36,'4','슬롱',1793254936);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',19,'4','슬롱',1793255011);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',20,'1','슬롱',1793255035);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',40,'3','슬롱',1793255055);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',41,'skull','슬롱',1793255088);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',13,'2','슬롱',1793255201);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',25,'2','슬롱',1793255307);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',26,'star','슬롱',1793255337);
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('3',23,'3','슬롱',1793255393);
CREATE TABLE homework_od_amounts (
  week_start TEXT NOT NULL,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  od1 INTEGER CHECK (od1 IS NULL OR (od1 BETWEEN 0 AND 999999999)),
  od2 INTEGER CHECK (od2 IS NULL OR (od2 BETWEEN 0 AND 999999999)),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (week_start, character_id)
);
CREATE TABLE homework_character_order (
  owner_name TEXT NOT NULL PRIMARY KEY,
  character_ids TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
INSERT INTO "homework_character_order" ("owner_name","character_ids","updated_at") VALUES('슬롱','[1,62,11,59,58,63]',1793256150);
INSERT INTO "homework_character_order" ("owner_name","character_ids","updated_at") VALUES('비큐','[31,42,49,43,44,45,46,47,48]',1793281391);
CREATE TABLE homework_od_balances (
  character_id INTEGER PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  od1 INTEGER CHECK (od1 IS NULL OR (od1 BETWEEN 0 AND 999999999)),
  od2 INTEGER CHECK (od2 IS NULL OR (od2 BETWEEN 0 AND 999999999)),
  updated_at INTEGER NOT NULL
, od1_updated_at INTEGER, od1_membership INTEGER CHECK (od1_membership IS NULL OR od1_membership IN (0,1)));
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(1,80,NULL,1793322451,1793259721,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(11,400,NULL,1793271460,1793271460,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(16,NULL,NULL,1793611801,NULL,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(17,NULL,NULL,1793611803,NULL,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(18,NULL,NULL,1793611803,NULL,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(24,NULL,NULL,1793586302,NULL,0);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(27,0,1485,1793290724,1793290721,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(28,280,2000,1793290919,1793290916,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(31,0,1850,1793757384,1793757382,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(42,20,2350,1793757368,1793757368,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(43,0,2535,1793629475,1793629445,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(44,75,2655,1793420009,1793420009,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(45,75,2980,1793717190,1793423665,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(46,0,2950,1793717232,1793625084,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(47,75,2880,1793717281,1793424459,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(48,535,2140,1793416902,1793416902,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(49,440,2715,1793607227,1793607227,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(50,135,1990,1793385153,1793291382,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(58,505,NULL,1793271441,1793271441,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(59,175,NULL,1793271452,1793271452,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(62,490,NULL,1793271454,1793271454,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(63,840,NULL,1793271428,1793271428,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(64,560,2000,1793370330,1793370324,1);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at","od1_updated_at","od1_membership") VALUES(65,680,1990,1793289251,1793289247,1);
CREATE TABLE character_power_refresh_runs (
    slot TEXT PRIMARY KEY,
    started_at INTEGER NOT NULL,
    finished_at INTEGER,
    total_count INTEGER NOT NULL DEFAULT 0,
    max_character_id INTEGER NOT NULL DEFAULT 0,
    last_character_id INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('running', 'complete', 'partial'))
);
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-10-29-18',1793264459,1793265064,50,63,63,50,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-10-30-06',1793307659,1793308263,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-10-30-18',1793350859,1793351467,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-10-31-06',1793394059,1793394664,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-10-31-18',1793437259,1793437867,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-11-01-06',1793480460,1793481064,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-11-01-18',1793523659,1793524265,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-11-02-06',1793566859,1793567464,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-11-02-18',1793610059,1793610664,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-11-03-06',1793653260,1793653864,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-11-03-18',1793696460,1793697064,52,65,65,52,0,'complete');
INSERT INTO "character_power_refresh_runs" ("slot","started_at","finished_at","total_count","max_character_id","last_character_id","success_count","failed_count","status") VALUES('2026-11-04-06',1793739659,1793740264,52,65,65,52,0,'complete');
CREATE TABLE homework_od_limit_backup_20261029 (
  character_id INTEGER PRIMARY KEY,
  original_od1 INTEGER,
  original_od2 INTEGER,
  backed_up_at INTEGER NOT NULL
);
CREATE TABLE sanctuary_shared_schedule_notes (
    week_start TEXT NOT NULL,
    nickname TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    updated_by TEXT NOT NULL DEFAULT '',
    updated_at INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (week_start, nickname)
);
CREATE TABLE content_schedule_server_matches (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  payload_json TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE aion_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_nickname TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
INSERT INTO "aion_inquiries" ("id","author_nickname","title","content","created_at") VALUES(1,'허니','연애가 하고 싶어요 슬롱님','여소좀',1793759122);
CREATE TABLE aion_inquiry_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id INTEGER NOT NULL REFERENCES aion_inquiries(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
INSERT INTO "aion_inquiry_replies" ("id","inquiry_id","author_nickname","content","created_at") VALUES(1,1,'슬롱','실패',1793759178);
CREATE TABLE admin_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at INTEGER NOT NULL,
  actor_nickname TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  details_json TEXT,
  previous_json TEXT,
  current_json TEXT
, actor_ip TEXT);
INSERT INTO "admin_audit_events" ("id","occurred_at","actor_nickname","category","action","target","summary","details_json","previous_json","current_json","actor_ip") VALUES(1,1793763697,'슬롱','homework','toggle','캐릭터 #1','awakening 완료 변경','{"characterId":1,"taskKey":"awakening","completed":true}','{"completed":false,"weekStart":null}','{"completed":true,"weekStart":"2026-11-04"}','115.91.242.69');
INSERT INTO "admin_audit_events" ("id","occurred_at","actor_nickname","category","action","target","summary","details_json","previous_json","current_json","actor_ip") VALUES(2,1793763698,'슬롱','homework','toggle','캐릭터 #1','awakening 미완료 변경','{"characterId":1,"taskKey":"awakening","completed":false}','{"completed":true,"weekStart":"2026-11-04"}','{"completed":false,"weekStart":null}','115.91.242.69');
INSERT INTO "admin_audit_events" ("id","occurred_at","actor_nickname","category","action","target","summary","details_json","previous_json","current_json","actor_ip") VALUES(3,1793764784,'슬롱','sanctuary','schedule','4성역','참여 일정·비고 변경','{"sanctuary":"4","weekStart":"2026-11-04","statuses":["pm","pm","pm","yes","yes","pm","pm"],"note":""}','{"statuses":null,"note":""}','{"statuses":"[\"pm\",\"pm\",\"pm\",\"yes\",\"yes\",\"pm\",\"pm\"]","note":""}','115.91.242.69');
INSERT INTO "admin_audit_events" ("id","occurred_at","actor_nickname","category","action","target","summary","details_json","previous_json","current_json","actor_ip") VALUES(4,1793765447,'슬롱','homework','toggle','로그인 닉네임 전체','숙제 미완료 변경','{"title":"테스트1"}',NULL,NULL,'115.91.242.69');
INSERT INTO "admin_audit_events" ("id","occurred_at","actor_nickname","category","action","target","summary","details_json","previous_json","current_json","actor_ip") VALUES(5,1793765480,'슬롱','homework','toggle','캐릭터 #1','muspel 완료 변경','{"characterId":1,"taskKey":"muspel","completed":true}','{"completed":false,"weekStart":null}','{"completed":true,"weekStart":"2026-11-04"}','115.91.242.69');
INSERT INTO "admin_audit_events" ("id","occurred_at","actor_nickname","category","action","target","summary","details_json","previous_json","current_json","actor_ip") VALUES(6,1793765482,'슬롱','homework','reset','로그인 닉네임 전체','숙제 현황 일괄 초기화','{"confirm":true}','{"completed_count":1}','{"completed_count":0}','115.91.242.69');
INSERT INTO "admin_audit_events" ("id","occurred_at","actor_nickname","category","action","target","summary","details_json","previous_json","current_json","actor_ip") VALUES(7,1793765483,'슬롱','homework','toggle','캐릭터 #1','숙제 완료 변경','{"characterId":1,"completed":true}',NULL,NULL,'115.91.242.69');
INSERT INTO "admin_audit_events" ("id","occurred_at","actor_nickname","category","action","target","summary","details_json","previous_json","current_json","actor_ip") VALUES(8,1793765486,'슬롱','homework','toggle','캐릭터 #1','숙제 미완료 변경','{"characterId":1,"completed":false}',NULL,NULL,'115.91.242.69');
CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  user_session_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
INSERT INTO "admin_sessions" ("token_hash","user_session_hash","nickname","created_at","expires_at") VALUES('e85db3e2729569ba1099b5d4dd150c27e222007eb11b2936b882bc7ffe279ad6','cb8f631b435fee4f40b690c178cb09b5b8f75de01b4d12926e283020425b99b2','슬롱',1793763851,1793767451);
CREATE TABLE admin_login_throttle (
  fingerprint TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
CREATE TABLE homework_custom_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_name TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(owner_name,title)
);
INSERT INTO "homework_custom_tasks" ("id","owner_name","title","created_at") VALUES(1,'슬롱','테스트1',1793765447);
CREATE TABLE homework_custom_progress (
  task_id INTEGER NOT NULL REFERENCES homework_custom_tasks(id) ON DELETE CASCADE,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  completed INTEGER NOT NULL DEFAULT 1 CHECK (completed IN (0,1)),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(task_id,character_id)
);
CREATE TABLE homework_task_column_orders (
  owner_name TEXT PRIMARY KEY,
  task_keys TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
INSERT INTO "homework_task_column_orders" ("owner_name","task_keys","updated_at") VALUES('슬롱','["abyss","awakening","rudra","invasion","muspel","deltras","trial","craft","custom:1"]',1793765447);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',23);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('characters',65);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('sanctuary_schedules',9);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('aion_inquiries',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('aion_inquiry_replies',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('admin_audit_events',8);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('homework_custom_tasks',1);
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);
CREATE INDEX idx_characters_owner_name ON characters (owner_name);
CREATE INDEX idx_sanctuary_schedules_week
ON sanctuary_schedules (week_start, sanctuary);
CREATE INDEX idx_sanctuary_members_sanctuary ON sanctuary_members (sanctuary);
CREATE INDEX idx_sanctuary_party_slots_party
ON sanctuary_party_slots(sanctuary,party_number,slot_number);
CREATE INDEX idx_homework_progress_week ON homework_progress(week_start);
CREATE INDEX idx_sanctuary_character_party_slots
ON sanctuary_character_party_slots(sanctuary,party_number,slot_number);
CREATE INDEX idx_homework_od_amounts_week ON homework_od_amounts(week_start);
CREATE INDEX idx_character_power_refresh_finished
    ON character_power_refresh_runs(finished_at DESC);
CREATE INDEX idx_aion_inquiries_created ON aion_inquiries(created_at DESC);
CREATE INDEX idx_aion_inquiries_author ON aion_inquiries(author_nickname, id DESC);
CREATE INDEX idx_aion_inquiry_replies_inquiry ON aion_inquiry_replies(inquiry_id, id);
CREATE INDEX idx_aion_inquiry_replies_author ON aion_inquiry_replies(author_nickname, id DESC);
CREATE INDEX idx_admin_audit_events_time ON admin_audit_events(id DESC);
CREATE INDEX idx_admin_audit_events_actor ON admin_audit_events(actor_nickname, id DESC);
CREATE INDEX idx_admin_audit_events_category ON admin_audit_events(category, id DESC);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX idx_admin_audit_events_ip ON admin_audit_events(actor_ip, id DESC);
CREATE INDEX idx_homework_custom_tasks_owner
  ON homework_custom_tasks(owner_name,id);
