--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

-- Started on 2020-05-29 21:18:10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
--SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2881 (class 0 OID 16796)
-- Dependencies: 204
-- Data for Name: crawls; Type: TABLE DATA; Schema: public; Owner: metadatahub
--

COPY public.crawls (id, dir_path, name, status, crawl_config, analyzed_dirs, starting_time, finished_time, update_time, analyzed_dirs_hash) FROM stdin;
2	/dir	f	f	f	["cat1.jpg"]	2102-01-01 00:00:00+01	2102-01-01 00:00:00+01	2102-01-01 00:00:00+01	238674c35ca98afaa6054cb049295c2705aae6ef1370701ea9a511a60af6b8c3
1	/home	hallo	up	config	["hello"]	2120-12-23 00:00:00+01	2120-12-23 00:00:00+01	2120-12-23 00:00:00+01	c7a0f7154e64cd96c617f251dc12c4396b7234c2856ccf4860ab7af537dfcdd9
\.


--
-- TOC entry 2883 (class 0 OID 16807)
-- Dependencies: 206
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: metadatahub
--

COPY public.files (id, crawl_id, dir_path, name, type, size, metadata, creation_time, access_time, modification_time, file_hash) FROM stdin;
1	1	/home/testdir	hund.jpg	JPEG	1000	{"FileName": "hund.jpg"}	2012-12-24 00:00:00+01	2012-12-24 00:00:00+01	2012-12-24 00:00:00+01	<placeholder>
2	1	/home/testdir/dir1	cat.gif	GIF	244	{"FileName": "cat.gif"}	2011-05-03 00:00:00+02	2011-05-03 00:00:00+02	2011-05-03 00:00:00+02	<placeholder>
3	1	/home/testdir/dir2	horse.html	HTML	12	{"FileName": "horse.html"}	2008-06-16 00:00:00+02	2008-06-16 00:00:00+02	2008-06-16 00:00:00+02	<placeholder>
\.


--
-- TOC entry 2885 (class 0 OID 16824)
-- Dependencies: 208
-- Data for Name: file_generic_data_eav; Type: TABLE DATA; Schema: public; Owner: metadatahub
--

COPY public.file_generic_data_eav (id, tree_walk_id, file_generic_id, attribute, value, unit) FROM stdin;
\.


--
-- TOC entry 2891 (class 0 OID 0)
-- Dependencies: 203
-- Name: crawls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metadatahub
--

SELECT pg_catalog.setval('public.crawls_id_seq', 0, true);


--
-- TOC entry 2892 (class 0 OID 0)
-- Dependencies: 207
-- Name: file_generic_data_eav_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metadatahub
--

SELECT pg_catalog.setval('public.file_generic_data_eav_id_seq', 0, true);


--
-- TOC entry 2893 (class 0 OID 0)
-- Dependencies: 205
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metadatahub
--

SELECT pg_catalog.setval('public.files_id_seq', 0, true);


-- Completed on 2020-05-29 21:18:10

--
-- PostgreSQL database dump complete
--

