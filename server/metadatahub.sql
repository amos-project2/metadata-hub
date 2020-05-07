--
-- PostgreSQL database dump
--

-- Dumped from database version 10.8
-- Dumped by pg_dump version 10.8

-- Started on 2020-05-05 00:05:33 CEST

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
-- TOC entry 1 (class 3079 OID 12330)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2209 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 197 (class 1259 OID 26649)
-- Name: testtable; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.testtable
(
    id        bigint NOT NULL,
    testvalue text,
    nezahl    integer
);


ALTER TABLE public.testtable
    OWNER TO metadatahub;

--
-- TOC entry 196 (class 1259 OID 26647)
-- Name: testtable_id_seq; Type: SEQUENCE; Schema: public; Owner: metadatahub
--

CREATE SEQUENCE public.testtable_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.testtable_id_seq
    OWNER TO metadatahub;

--
-- TOC entry 2210 (class 0 OID 0)
-- Dependencies: 196
-- Name: testtable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metadatahub
--

ALTER SEQUENCE public.testtable_id_seq OWNED BY public.testtable.id;


--
-- TOC entry 2076 (class 2604 OID 26652)
-- Name: testtable id; Type: DEFAULT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.testtable
    ALTER COLUMN id SET DEFAULT nextval('public.testtable_id_seq'::regclass);


--
-- TOC entry 2201 (class 0 OID 26649)
-- Dependencies: 197
-- Data for Name: testtable; Type: TABLE DATA; Schema: public; Owner: metadatahub
--

COPY public.testtable (id, testvalue, nezahl) FROM stdin;
1	irgend ein Text	634678
\.


--
-- TOC entry 2211 (class 0 OID 0)
-- Dependencies: 196
-- Name: testtable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: metadatahub
--

SELECT pg_catalog.setval('public.testtable_id_seq', 1, true);


--
-- TOC entry 2078 (class 2606 OID 26657)
-- Name: testtable testtable_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.testtable
    ADD CONSTRAINT testtable_pkey PRIMARY KEY (id);


-- Completed on 2020-05-05 00:05:33 CEST

--
-- PostgreSQL database dump complete
--
