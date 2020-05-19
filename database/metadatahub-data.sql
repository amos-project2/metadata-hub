--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2 (Ubuntu 12.2-4)
-- Dumped by pg_dump version 12.2 (Ubuntu 12.2-4)

-- Started on 2020-05-11 03:31:56 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3009 (class 0 OID 16410)
-- Dependencies: 207
-- Data for Name: file_generic; Type: TABLE DATA; Schema: public; Owner: metadatahub
--

COPY public.file_generic ("tree_walk_Id", sub_dir_path, name, file_typ, size, file_create_date, file_modify_date, id, metadata, file_access_date) FROM stdin;
1	/testDir/	hund1.jpg	JPEG	7100	2020-05-10 01:30:02+02	2020-05-06 01:28:07+02	1	{"FileName": "hund1.jpg", "FileSize": "7.1 kB", "FileType": "JPEG", "MIMEType": "image/jpeg", "Directory": "../../testDir/crawler test 2", "ImageSize": "300x168", "ImageWidth": 300, "Megapixels": 0.05, "SourceFile": "../../testDir/crawler test 2/hund.jpg", "ImageHeight": 168, "JFIFVersion": 1.01, "XResolution": 1, "YResolution": 1, "BitsPerSample": 8, "FileAccessDate": "2020:05:10 01:30:02+02:00", "FileCreateDate": "2020:05:10 01:30:02+02:00", "FileModifyDate": "2020:05:06 01:28:07+02:00", "ResolutionUnit": "None", "ColorComponents": 3, "EncodingProcess": "Baseline DCT, Huffman coding", "ExifToolVersion": 11.98, "FilePermissions": "rw-rw-rw-", "YCbCrSubSampling": "YCbCr4:2:0 (2 2)", "FileTypeExtension": "jpg"}	2020-05-10 01:30:02+02
1	/testDir/crawler test 2/	hund2.jpg	JPEG	7100	2020-05-10 01:30:02+02	2020-05-06 01:28:07+02	2	{"FileName": "hund2.jpg", "FileSize": "7.1 kB", "FileType": "JPEG", "MIMEType": "image/jpeg", "Directory": "../../testDir/crawler test 2", "ImageSize": "300x168", "ImageWidth": 300, "Megapixels": 0.05, "SourceFile": "../../testDir/crawler test 2/hund.jpg", "ImageHeight": 168, "JFIFVersion": 1.01, "XResolution": 1, "YResolution": 1, "BitsPerSample": 8, "FileAccessDate": "2020:05:10 01:30:02+02:00", "FileCreateDate": "2020:05:10 01:30:02+02:00", "FileModifyDate": "2020:05:06 01:28:07+02:00", "ResolutionUnit": "None", "ColorComponents": 3, "EncodingProcess": "Baseline DCT, Huffman coding", "ExifToolVersion": 11.98, "FilePermissions": "rw-rw-rw-", "YCbCrSubSampling": "YCbCr4:2:0 (2 2)", "FileTypeExtension": "jpg"}	2020-05-10 01:30:02+02
1	/testDir/crawler test 2/onemore/	hund3.jpg	JPEG	7100	2020-05-10 01:30:02+02	2020-05-06 01:28:07+02	3	{"FileName": "hund3.jpg", "FileSize": "7.1 kB", "FileType": "JPEG", "MIMEType": "image/jpeg", "Directory": "../../testDir/crawler test 2", "ImageSize": "300x168", "ImageWidth": 300, "Megapixels": 0.05, "SourceFile": "../../testDir/crawler test 2/hund.jpg", "ImageHeight": 168, "JFIFVersion": 1.01, "XResolution": 1, "YResolution": 1, "BitsPerSample": 8, "FileAccessDate": "2020:05:10 01:30:02+02:00", "FileCreateDate": "2020:05:10 01:30:02+02:00", "FileModifyDate": "2020:05:06 01:28:07+02:00", "ResolutionUnit": "None", "ColorComponents": 3, "EncodingProcess": "Baseline DCT, Huffman coding", "ExifToolVersion": 11.98, "FilePermissions": "rw-rw-rw-", "YCbCrSubSampling": "YCbCr4:2:0 (2 2)", "FileTypeExtension": "jpg"}	2020-05-10 01:30:02+02
1	/testDir/crawler test 2/anotherdir/	hund4.jpg	JPEG	7100	2020-05-10 01:30:02+02	2020-05-06 01:28:07+02	4	{"FileName": "hund4.jpg", "FileSize": "7.1 kB", "FileType": "JPEG", "MIMEType": "image/jpeg", "Directory": "../../testDir/crawler test 2", "ImageSize": "300x168", "ImageWidth": 300, "Megapixels": 0.05, "SourceFile": "../../testDir/crawler test 2/hund.jpg", "ImageHeight": 168, "JFIFVersion": 1.01, "XResolution": 1, "YResolution": 1, "BitsPerSample": 8, "FileAccessDate": "2020:05:10 01:30:02+02:00", "FileCreateDate": "2020:05:10 01:30:02+02:00", "FileModifyDate": "2020:05:06 01:28:07+02:00", "ResolutionUnit": "None", "ColorComponents": 3, "EncodingProcess": "Baseline DCT, Huffman coding", "ExifToolVersion": 11.98, "FilePermissions": "rw-rw-rw-", "YCbCrSubSampling": "YCbCr4:2:0 (2 2)", "FileTypeExtension": "jpg"}	2020-05-10 01:30:02+02
\.


--
-- TOC entry 3010 (class 0 OID 16419)
-- Dependencies: 208
-- Data for Name: file_generic_data_eav; Type: TABLE DATA; Schema: public; Owner: metadatahub
--

COPY public.file_generic_data_eav (tree_walk_id, file_generic_id, attribute, value, unit, id) FROM stdin;
1	1	SourceFile	../../testDir/crawler test 2/hund.jpg	\N	1
1	1	ExifToolVersion	11.98	\N	2
1	1	FileName	hund.jpg	\N	3
1	1	Directory	../../testDir/crawler test 2	\N	4
1	1	FileSize	7.1 kB	\N	5
1	1	FileModifyDate	2020:05:06 01:28:07+02:00	\N	6
1	1	FileAccessDate	2020:05:10 01:30:02+02:00	\N	7
1	1	FileCreateDate	2020:05:10 01:30:02+02:00	\N	8
1	1	FilePermissions	rw-rw-rw-	\N	9
1	1	FileType	JPEG	\N	10
1	1	FileTypeExtension	jpg	\N	11
1	1	MIMEType	image/jpeg	\N	12
1	1	JFIFVersion	1.01	\N	13
1	1	ResolutionUnit	None	\N	14
1	1	XResolution	1	\N	15
1	1	YResolution	1	\N	16
1	1	ImageWidth	300\n	\N	17
1	1	ImageHeight	168	\N	18
1	1	EncodingProcess	Baseline DCT, Huffman coding	\N	19
1	1	BitsPerSample	8	\N	20
1	1	ColorComponents	3	\N	21
1	1	YCbCrSubSampling	YCbCr4:2:0 (2 2)	\N	22
1	1	ImageSize	300x168	\N	23
1	1	Megapixels	0.050	\N	24
\.


--
-- TOC entry 3004 (class 0 OID 16386)
-- Dependencies: 202
-- Data for Name: testtable; Type: TABLE DATA; Schema: public; Owner: metadatahub
--

COPY public.testtable (id, testvalue, nezahl) FROM stdin;
1	irgend ein Text	634678
2	noch ein Text, also der zweite hmmm	4445
\.


--
-- TOC entry 3007 (class 0 OID 16399)
-- Dependencies: 205
-- Data for Name: tree_walk; Type: TABLE DATA; Schema: public; Owner: metadatahub
--

COPY public.tree_walk (id, name, notes, root_path, created_time, finished_time, status, crawl_config, crawl_update_time, save_in_gerneric_table) FROM stdin;
1	my treewalk	a few notes i can add, if i want	/home/myTreewalkData/	2020-05-11 01:28:07+02	2020-05-11 03:28:07+02	3	\N	2020-05-11 03:28:07+02	t
\.


--
-- TOC entry 3017 (class 0 OID 0)
-- Dependencies: 204
-- Name: TreeWalks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metadatahub
--

SELECT pg_catalog.setval('public."TreeWalks_id_seq"', 1, true);


--
-- TOC entry 3018 (class 0 OID 0)
-- Dependencies: 209
-- Name: file_generic_data_eav_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metadatahub
--

SELECT pg_catalog.setval('public.file_generic_data_eav_id_seq', 24, true);


--
-- TOC entry 3019 (class 0 OID 0)
-- Dependencies: 206
-- Name: files_generic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metadatahub
--

SELECT pg_catalog.setval('public.files_generic_id_seq', 1, true);


--
-- TOC entry 3020 (class 0 OID 0)
-- Dependencies: 203
-- Name: testtable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metadatahub
--

SELECT pg_catalog.setval('public.testtable_id_seq', 2, true);


-- Completed on 2020-05-11 03:31:57 CEST

--
-- PostgreSQL database dump complete
--

