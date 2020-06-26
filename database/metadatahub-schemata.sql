--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

-- Started on 2020-05-31 00:55:09

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
-- TOC entry 2 (class 3079 OID 16701)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 2885 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 245 (class 1255 OID 16741)
-- Name: analyzed_dirs_hash_trigger_function(); Type: FUNCTION; Schema: public; Owner: metadatahub
--

CREATE FUNCTION public.analyzed_dirs_hash_trigger_function() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
    IF tg_op = 'INSERT' OR tg_op = 'UPDATE' THEN
        NEW.analyzed_dirs_hash = encode(digest(NEW.analyzed_dirs::text, 'sha256'), 'hex')::text;
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION public.analyzed_dirs_hash_trigger_function() OWNER TO metadatahub;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 204 (class 1259 OID 16796)
-- Name: crawls; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.crawls (
    id bigint NOT NULL,
    dir_path text NOT NULL,
    author text NOT NULL,
    name text NOT NULL,
    status text,
    crawl_config text,
    analyzed_dirs jsonb NOT NULL,
    starting_time timestamp with time zone,
    finished_time timestamp with time zone,
    update_time timestamp with time zone,
    analyzed_dirs_hash text
);


ALTER TABLE public.crawls OWNER TO metadatahub;

--
-- TOC entry 203 (class 1259 OID 16794)
-- Name: crawls_id_seq; Type: SEQUENCE; Schema: public; Owner: metadatahub
--

CREATE SEQUENCE public.crawls_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crawls_id_seq OWNER TO metadatahub;

--
-- TOC entry 2886 (class 0 OID 0)
-- Dependencies: 203
-- Name: crawls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metadatahub
--

ALTER SEQUENCE public.crawls_id_seq OWNED BY public.crawls.id;


--
-- TOC entry 208 (class 1259 OID 16824)
-- Name: file_generic_data_eav; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.file_generic_data_eav (
    id bigint NOT NULL,
    tree_walk_id bigint NOT NULL,
    file_generic_id bigint NOT NULL,
    attribute text NOT NULL,
    value text NOT NULL,
    unit text NOT NULL
);


ALTER TABLE public.file_generic_data_eav OWNER TO metadatahub;

--
-- TOC entry 207 (class 1259 OID 16822)
-- Name: file_generic_data_eav_id_seq; Type: SEQUENCE; Schema: public; Owner: metadatahub
--

CREATE SEQUENCE public.file_generic_data_eav_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.file_generic_data_eav_id_seq OWNER TO metadatahub;

--
-- TOC entry 2887 (class 0 OID 0)
-- Dependencies: 207
-- Name: file_generic_data_eav_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metadatahub
--

ALTER SEQUENCE public.file_generic_data_eav_id_seq OWNED BY public.file_generic_data_eav.id;


--
-- TOC entry 206 (class 1259 OID 16807)
-- Name: files; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.files (
    id bigint NOT NULL,
    crawl_id bigint NOT NULL,
    dir_path text NOT NULL,
    name text NOT NULL,
    type text,
    size bigint,
    metadata jsonb NOT NULL,
    creation_time timestamp with time zone NOT NULL,
    access_time timestamp with time zone NOT NULL,
    modification_time timestamp with time zone NOT NULL,
    file_hash text NOT NULL,
    deleted boolean NOT NULL,
    deleted_time timestamp,
    in_metadata boolean NOT NULL

);


ALTER TABLE public.files OWNER TO metadatahub;

--
-- TOC entry 205 (class 1259 OID 16805)
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: metadatahub
--

--
-- Name: metadata; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.metadata (
    file_type text NOT NULL,
    tags json NOT NULL
);


ALTER TABLE public.metadata OWNER TO metadatahub;

--
-- Name: schedule; Type: TABLE; Schema: public; Owner: metadatahub
--

CREATE TABLE public.schedule (
    id text NOT NULL,
    config json NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    force boolean NOT NULL,
    pending boolean NOT NULL,
    "interval" bigint NOT NULL
);


ALTER TABLE public.schedule OWNER TO metadatahub;

CREATE SEQUENCE public.files_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.files_id_seq OWNER TO metadatahub;

--
-- TOC entry 2888 (class 0 OID 0)
-- Dependencies: 205
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: metadatahub
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- TOC entry 2740 (class 2604 OID 16799)
-- Name: crawls id; Type: DEFAULT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.crawls ALTER COLUMN id SET DEFAULT nextval('public.crawls_id_seq'::regclass);


--
-- TOC entry 2742 (class 2604 OID 16827)
-- Name: file_generic_data_eav id; Type: DEFAULT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.file_generic_data_eav ALTER COLUMN id SET DEFAULT nextval('public.file_generic_data_eav_id_seq'::regclass);


--
-- TOC entry 2741 (class 2604 OID 16810)
-- Name: files id; Type: DEFAULT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- TOC entry 2744 (class 2606 OID 16804)
-- Name: crawls crawls_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.crawls
    ADD CONSTRAINT crawls_pkey PRIMARY KEY (id);


--
-- TOC entry 2748 (class 2606 OID 16832)
-- Name: file_generic_data_eav file_generic_data_eav_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.file_generic_data_eav
    ADD CONSTRAINT file_generic_data_eav_pkey PRIMARY KEY (id);


--
-- TOC entry 2746 (class 2606 OID 16815)
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- TOC entry 2752 (class 2620 OID 16843)
-- Name: crawls analyzed_dirs_hash_insert; Type: TRIGGER; Schema: public; Owner: metadatahub
--

CREATE TRIGGER analyzed_dirs_hash_insert BEFORE INSERT ON public.crawls FOR EACH ROW EXECUTE FUNCTION public.analyzed_dirs_hash_trigger_function();


--
-- TOC entry 2753 (class 2620 OID 16844)
-- Name: crawls analyzed_dirs_hash_update; Type: TRIGGER; Schema: public; Owner: metadatahub
--

CREATE TRIGGER analyzed_dirs_hash_update BEFORE UPDATE ON public.crawls FOR EACH ROW WHEN ((new.analyzed_dirs IS DISTINCT FROM old.analyzed_dirs)) EXECUTE FUNCTION public.analyzed_dirs_hash_trigger_function();


--
-- TOC entry 2749 (class 2606 OID 16816)
-- Name: files crawl_id; Type: FK CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT crawl_id FOREIGN KEY (crawl_id) REFERENCES public.crawls(id);


--
-- TOC entry 2750 (class 2606 OID 16833)
-- Name: file_generic_data_eav crawl_id; Type: FK CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.file_generic_data_eav
    ADD CONSTRAINT crawl_id FOREIGN KEY (tree_walk_id) REFERENCES public.crawls(id);


--
-- TOC entry 2751 (class 2606 OID 16838)
-- Name: file_generic_data_eav file_id; Type: FK CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.file_generic_data_eav
    ADD CONSTRAINT file_id FOREIGN KEY (file_generic_id) REFERENCES public.files(id);

--
-- Name: metadata metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.metadata
    ADD CONSTRAINT metadata_pkey PRIMARY KEY (file_type);


--
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: metadatahub
--

ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (id);

-- Completed on 2020-05-31 00:55:10

--
-- PostgreSQL database dump complete
--

