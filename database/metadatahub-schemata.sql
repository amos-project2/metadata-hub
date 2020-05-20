--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2 (Ubuntu 12.2-4)
-- Dumped by pg_dump version 12.2 (Ubuntu 12.2-4)

-- Started on 2020-05-11 03:31:24 CEST

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 205 (class 1259 OID 16399)
-- Name: tree_walk; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.tree_walk (
    id bigint NOT NULL,
    name text,
    notes text,
    root_path text,
    created_time timestamp with time zone,
    finished_time timestamp with time zone,
    status integer,
    crawl_config jsonb,
    crawl_update_time timestamp with time zone,
    save_in_gerneric_table boolean
);


ALTER TABLE public.tree_walk OWNER TO metadatahub;

--
-- TOC entry 204 (class 1259 OID 16397)
-- Name: TreeWalks_id_seq; Type: SEQUENCE; Schema: public; Owner: metadatahub
--

CREATE SEQUENCE public."TreeWalks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TreeWalks_id_seq" OWNER TO metadatahub;

--
-- TOC entry 3009 (class 0 OID 0)
-- Dependencies: 204
-- Name: TreeWalks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metadatahub
--

ALTER SEQUENCE public."TreeWalks_id_seq" OWNED BY public.tree_walk.id;


--
-- TOC entry 207 (class 1259 OID 16410)
-- Name: file_generic; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.file_generic (
    tree_walk_id bigint NOT NULL,
    sub_dir_path text,
    name text,
    file_typ text,
    size bigint,
    file_create_date timestamp with time zone,
    file_modify_date timestamp with time zone,
    id bigint NOT NULL,
    metadata jsonb,
    file_access_date timestamp with time zone
);


ALTER TABLE public.file_generic OWNER TO metadatahub;

--
-- TOC entry 208 (class 1259 OID 16419)
-- Name: file_generic_data_eav; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.file_generic_data_eav (
    tree_walk_id bigint NOT NULL,
    file_generic_id bigint NOT NULL,
    attribute text,
    value text,
    unit text,
    id bigint NOT NULL
);


ALTER TABLE public.file_generic_data_eav OWNER TO metadatahub;

--
-- TOC entry 209 (class 1259 OID 16432)
-- Name: file_generic_data_eav_id_seq; Type: SEQUENCE; Schema: public; Owner: metadatahub
--

CREATE SEQUENCE public.file_generic_data_eav_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.file_generic_data_eav_id_seq OWNER TO metadatahub;

--
-- TOC entry 3010 (class 0 OID 0)
-- Dependencies: 209
-- Name: file_generic_data_eav_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metadatahub
--

ALTER SEQUENCE public.file_generic_data_eav_id_seq OWNED BY public.file_generic_data_eav.id;


--
-- TOC entry 206 (class 1259 OID 16408)
-- Name: files_generic_id_seq; Type: SEQUENCE; Schema: public; Owner: metadatahub
--

CREATE SEQUENCE public.files_generic_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.files_generic_id_seq OWNER TO metadatahub;

--
-- TOC entry 3011 (class 0 OID 0)
-- Dependencies: 206
-- Name: files_generic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metadatahub
--

ALTER SEQUENCE public.files_generic_id_seq OWNED BY public.file_generic.id;


--
-- TOC entry 202 (class 1259 OID 16386)
-- Name: testtable; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.testtable (
    id bigint NOT NULL,
    testvalue text,
    nezahl integer
);


ALTER TABLE public.testtable OWNER TO metadatahub;

--
-- TOC entry 203 (class 1259 OID 16392)
-- Name: testtable_id_seq; Type: SEQUENCE; Schema: public; Owner: metadatahub
--

CREATE SEQUENCE public.testtable_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.testtable_id_seq OWNER TO metadatahub;

--
-- TOC entry 3012 (class 0 OID 0)
-- Dependencies: 203
-- Name: testtable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metadatahub
--

ALTER SEQUENCE public.testtable_id_seq OWNED BY public.testtable.id;


--
-- TOC entry 2868 (class 2604 OID 16413)
-- Name: file_generic id; Type: DEFAULT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.file_generic ALTER COLUMN id SET DEFAULT nextval('public.files_generic_id_seq'::regclass);


--
-- TOC entry 2869 (class 2604 OID 16434)
-- Name: file_generic_data_eav id; Type: DEFAULT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.file_generic_data_eav ALTER COLUMN id SET DEFAULT nextval('public.file_generic_data_eav_id_seq'::regclass);


--
-- TOC entry 2866 (class 2604 OID 16394)
-- Name: testtable id; Type: DEFAULT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.testtable ALTER COLUMN id SET DEFAULT nextval('public.testtable_id_seq'::regclass);


--
-- TOC entry 2867 (class 2604 OID 16402)
-- Name: tree_walk id; Type: DEFAULT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.tree_walk ALTER COLUMN id SET DEFAULT nextval('public."TreeWalks_id_seq"'::regclass);


--
-- TOC entry 2873 (class 2606 OID 16407)
-- Name: tree_walk TreeWalks_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.tree_walk
    ADD CONSTRAINT "TreeWalks_pkey" PRIMARY KEY (id);


--
-- TOC entry 2877 (class 2606 OID 16442)
-- Name: file_generic_data_eav file_generic_data_eav_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.file_generic_data_eav
    ADD CONSTRAINT file_generic_data_eav_pkey PRIMARY KEY (id);


--
-- TOC entry 2875 (class 2606 OID 16418)
-- Name: file_generic files_generic_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.file_generic
    ADD CONSTRAINT files_generic_pkey PRIMARY KEY (id);


--
-- TOC entry 2871 (class 2606 OID 16396)
-- Name: testtable testtable_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.testtable
    ADD CONSTRAINT testtable_pkey PRIMARY KEY (id);


-- Completed on 2020-05-11 03:31:25 CEST

--
-- PostgreSQL database dump complete
--

