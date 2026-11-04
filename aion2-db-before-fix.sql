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
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('111e59ab185f4cc6051afac6dd1d5385d86c358027ef884841ee92dd8e865c60','슬롱',1793248730,1793853530);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('04a326f0222f83c75243751f6cdff38403f8772ff606c12f2a529e264a1b6fe9','비큐',1793248849,1793853649);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('338f52fde317a6d3f65d57462cd111f055ca9508e39c734aafd6ea23c381a60a','영양',1793252672,1793857472);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('2d3d3eb543af718a513250fff99f5fae321f9ed3f59c121923d8100d36805b49','알코올',1793253432,1793858232);
INSERT INTO "sessions" ("token_hash","nickname","created_at","expires_at") VALUES('8a81d9220fbec1507417615a3954dd7ffc1aff1ef508c2acf203bfeb2d80fd78','허니',1793256064,1793860864);
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
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(1,'슬롱','슬롱',2003,'검성',6720,1046.5,'','슬롱',1793240240,1793240240);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(11,'슬롱','슬론',2003,'마도성',5164,523.8,'','슬롱',1793246002,1793246002);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(12,'청이','댕청',2003,'살성',5694,678.4,'','청이',1793247385,1793247385);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(13,'청이','청이',2003,'궁성',6635,1044.3,'','청이',1793247772,1793247772);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(14,'청이','막둥이',2003,'검성',4973,490.5,'','청이',1793247777,1793247777);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(15,'청이','셀트리온',2003,'치유성',4854,469.2,'','청이',1793247784,1793247784);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(16,'LI코틴','LI코틴',2003,'권성',6468,1021,'','LI코틴',1793247809,1793247809);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(17,'LI코틴','니코틴',2003,'살성',6031,854.9,'','LI코틴',1793247813,1793247813);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(18,'LI코틴','코틴',2003,'정령성',4866,494.7,'','LI코틴',1793247816,1793247816);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(19,'알코올','알코올',2003,'치유성',6802,1092.5,'','알코올',1793247834,1793247834);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(20,'알코올','코올',2003,'호법성',5142,517.3,'','알코올',1793247837,1793247837);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(21,'알코올','알코오올',2003,'치유성',5540,663.7,'','알코올',1793247841,1793247841);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(22,'MID','MID',2003,'살성',6057,816.6,'','MID',1793247857,1793247857);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(23,'MID','고민하다만든아이디',2003,'궁성',5342,629.8,'','MID',1793247861,1793247861);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(24,'허니','허니',2003,'호법성',6760,1077,'','허니',1793247882,1793247882);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(25,'허니','허늬',2003,'호법성',5424,573.8,'','허니',1793247885,1793247885);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(26,'허니','헌이',2003,'수호성',5478,633.7,'','허니',1793247888,1793247888);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(27,'달나비','달나비',2003,'마도성',6486,974.5,'','달나비',1793247904,1793247904);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(28,'달나비','밤나비',2003,'정령성',4989,508.9,'','달나비',1793247908,1793247908);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(29,'캣맘','캣맘',2003,'정령성',6672,1063.4,'','캣맘',1793247929,1793247929);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(30,'캣맘','드네스',2003,'마도성',6324,950.3,'','캣맘',1793247933,1793247933);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(31,'비큐','스렝',2003,'호법성',6587,999.5,'','비큐',1793247969,1793247969);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(35,'불능','불능',2003,'궁성',6524,979.4,'','불능',1793248308,1793248308);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(36,'로이엘','로이엘',2003,'치유성',6627,965.3,'','로이엘',1793248317,1793248317);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(37,'로이엘','바라프',2003,'정령성',5309,621.9,'','로이엘',1793248318,1793248318);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(38,'로이엘','카웅',2003,'치유성',5435,674.9,'','로이엘',1793248319,1793248319);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(40,'영양','영양',2018,'치유성',6505,980.9,'','영양',1793253728,1793253728);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(41,'영양','솜구름',2018,'호법성',5447,600.6,'','영양',1793253724,1793253724);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(42,'비큐','비큐',2003,'궁성',6674,1067.3,'','비큐',1793248870,1793248870);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(43,'비큐','스피노스',2003,'마도성',4972,543.5,'','비큐',1793248906,1793248906);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(44,'비큐','아직살만해',2003,'검성',5019,516.8,'','비큐',1793248911,1793248911);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(45,'비큐','불패과장',2003,'호법성',5164,577.4,'','비큐',1793248942,1793248942);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(46,'비큐','호법대표',2003,'호법성',5248,563.1,'','비큐',1793248948,1793248948);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(47,'비큐','불패상무',2003,'호법성',5239,570.1,'','비큐',1793248955,1793248955);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(48,'비큐','정령대표',2003,'정령성',3619,274.5,'','비큐',1793248972,1793248972);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(49,'비큐','치료해주오',2003,'치유성',5912,742.4,'','비큐',1793249068,1793249068);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(50,'달나비','꿀나비',2003,'치유성',5330,606.2,'','달나비',1793251288,1793251288);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(51,'MID','미룡',2003,'궁성',4616,404,'','MID',1793251344,1793251344);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(52,'허니','푸니',2003,'궁성',4901,462.1,'','허니',1793251369,1793251369);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(53,'캣맘','유요',2003,'살성',5096,503.8,'','캣맘',1793251381,1793251381);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(54,'캣맘','협동',2003,'호법성',5285,603.1,'','캣맘',1793251385,1793251385);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(55,'캣맘','힐캐',2003,'치유성',5215,633.8,'','캣맘',1793251388,1793251388);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(56,'알코올','합성알코올',2003,'정령성',5154,514.8,'','알코올',1793251440,1793251440);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(57,'알코올','Alcohol',2003,'궁성',5149,517.2,'','알코올',1793251448,1793251448);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(58,'슬롱','스론',2003,'치유성',4929,464.3,'','슬롱',1793251931,1793251931);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(59,'슬롱','슬렁',2003,'정령성',5204,533,'','슬롱',1793251940,1793251940);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(60,'알코올','알콜알콜',2003,'마도성',4842,446.1,'','알코올',1793253475,1793253475);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(61,'영양','권성이올시다',2018,'권성',4702,486,'','영양',1793253737,1793253737);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(62,'슬롱','술렁',2003,'궁성',5349,582.7,'','슬롱',1793254812,1793254812);
INSERT INTO "characters" ("id","owner_name","character_name","server_id","class_name","item_level","naddol_k","notes","updated_by","updated_at","synced_at") VALUES(63,'슬롱','스롱',2003,'살성',3053,196.7,'','슬롱',1793256128,1793256128);
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
INSERT INTO "sanctuary_schedules" ("id","sanctuary","week_start","nickname","statuses","note","updated_by","updated_at") VALUES(5,'4','2026-10-28','슬롱','["pm","pm","pm","no","no","no","no"]','','슬롱',1793249403);
INSERT INTO "sanctuary_schedules" ("id","sanctuary","week_start","nickname","statuses","note","updated_by","updated_at") VALUES(6,'4','2026-10-28','청이','["yes","yes","no","yes","pm","","yes"]','','청이',1793247531);
INSERT INTO "sanctuary_schedules" ("id","sanctuary","week_start","nickname","statuses","note","updated_by","updated_at") VALUES(8,'4','2026-10-28','알코올','["","","","","","",""]','으헤헤으헤헤','알코올',1793253522);
INSERT INTO "sanctuary_schedules" ("id","sanctuary","week_start","nickname","statuses","note","updated_by","updated_at") VALUES(9,'4','2026-10-28','비큐','["pm","pm","pm","yes","yes","pm","pm"]','수 목  20시 ~ 22:30분 까지 가능','비큐',1793254348);
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
INSERT INTO "sanctuary_shared_availability" ("week_start","nickname","statuses","updated_by","updated_at") VALUES('2026-10-28','슬롱','["pm","pm","pm","no","no","no","no"]','슬롱',1793249403);
INSERT INTO "sanctuary_shared_availability" ("week_start","nickname","statuses","updated_by","updated_at") VALUES('2026-10-28','청이','["yes","yes","no","yes","pm","","yes"]','청이',1793247531);
INSERT INTO "sanctuary_shared_availability" ("week_start","nickname","statuses","updated_by","updated_at") VALUES('2026-10-28','알코올','["","","","","","",""]','알코올',1793253522);
INSERT INTO "sanctuary_shared_availability" ("week_start","nickname","statuses","updated_by","updated_at") VALUES('2026-10-28','비큐','["pm","pm","pm","yes","yes","pm","pm"]','비큐',1793254348);
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
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',42,'abyss',1,1793249027);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',42,'awakening',1,1793249028);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',42,'rudra',1,1793249029);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',31,'abyss',1,1793249033);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',31,'awakening',1,1793249033);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',31,'rudra',1,1793249035);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',42,'craft',1,1793249044);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',31,'craft',1,1793249045);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',42,'deltras',1,1793249049);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',31,'deltras',1,1793249050);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',49,'rudra',1,1793249075);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',49,'awakening',1,1793249089);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',1,'deltras',1,1793250225);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',1,'muspel',1,1793250229);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',1,'invasion',1,1793250231);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',24,'awakening',1,1793256098);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',26,'awakening',1,1793256099);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',25,'awakening',1,1793256102);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',24,'rudra',1,1793256106);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',26,'rudra',1,1793256106);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',25,'rudra',1,1793256106);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',52,'rudra',1,1793256107);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',24,'deltras',1,1793256110);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',24,'muspel',1,1793256113);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',26,'muspel',1,1793256113);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',25,'muspel',1,1793256114);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',62,'rudra',1,1793256117);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',59,'rudra',1,1793256118);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',11,'rudra',1,1793256118);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',24,'invasion',1,1793256118);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',25,'invasion',1,1793256119);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',52,'invasion',1,1793256119);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',58,'rudra',1,1793256122);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',24,'craft',1,1793256123);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',26,'craft',1,1793256123);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',25,'craft',1,1793256123);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',52,'craft',1,1793256124);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',63,'rudra',1,1793256137);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',59,'invasion',1,1793256146);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',58,'invasion',1,1793256159);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',1,'craft',1,1793256162);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',49,'abyss',1,1793257799);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',43,'abyss',1,1793257801);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',43,'awakening',1,1793257802);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',43,'rudra',1,1793257803);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',49,'craft',1,1793257908);
INSERT INTO "homework_progress" ("week_start","character_id","task_key","completed","updated_at") VALUES('2026-10-28',43,'craft',1,1793257909);
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
INSERT INTO "sanctuary_character_notes" ("sanctuary","character_id","note","updated_by","updated_at") VALUES('4',1,'테스트 문구','슬롱',1793250790);
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
INSERT INTO "sanctuary_character_party_slots" ("sanctuary","character_id","party_number","slot_number","updated_by","updated_at") VALUES('4',1,1,1,'슬롱',1793250790);
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
INSERT INTO "sanctuary_character_markers" ("sanctuary","character_id","marker","updated_by","updated_at") VALUES('4',1,'star','슬롱',1793250790);
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
INSERT INTO "homework_character_order" ("owner_name","character_ids","updated_at") VALUES('비큐','[31,42,49,43,44,45,46,47,48]',1793257815);
CREATE TABLE homework_od_balances (
  character_id INTEGER PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  od1 INTEGER CHECK (od1 IS NULL OR (od1 BETWEEN 0 AND 999999999)),
  od2 INTEGER CHECK (od2 IS NULL OR (od2 BETWEEN 0 AND 999999999)),
  updated_at INTEGER NOT NULL
);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at") VALUES(1,NULL,NULL,1793257085);
INSERT INTO "homework_od_balances" ("character_id","od1","od2","updated_at") VALUES(31,0,0,1793257845);
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
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',16);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('characters',63);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('sanctuary_schedules',9);
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
