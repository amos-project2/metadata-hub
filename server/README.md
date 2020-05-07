# Server

### Installation


### Usage

A short Maven tutorial can be found [here](https://docs.google.com/document/d/16Iya2Z0hCarSu4MzKlrsoGz86bL85nANL7ZtI1y-_zE/edit?usp=sharing)

###### Build and execute

```console
$ mvn package && java -jar ./target/metadata-hub-server-application-fat.jar
```

###### Skip tests

```console
$ mvn package -DskipTests && java -jar ./target/metadata-hub-server-application-fat.jar
```

###### Still get .jar files

```console
$ mvn package
```

###### Still compile

```console
$ mvn compile
```

###### Remove target directory

```console
$ mvn clean
```
### Endpoints

WEB-GUI: http://localhost:8080

GRAPHQL-ENDPOINT: http://localhost:8080/graphql/?query=hey

GRAPHQL-TEST-CONSOLE: http://localhost:8080/testconsole/


### Database
###### How to setup your Postgresdatabase
```
User: metadatahub (dont forget to enable the login)
Password: metadatahub
Databasename: metadatahub (owner must the the user metadatahub)
```

```sql
-- Database: metadatahub

-- DROP DATABASE metadatahub;

CREATE DATABASE metadatahub
    WITH
    OWNER = metadatahub
    ENCODING = 'UTF8'
    LC_COLLATE = 'de_DE.UTF-8'
    LC_CTYPE = 'de_DE.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

###### Add a testtable

```sql
-- Table: public.testtable

-- DROP TABLE public.testtable;

CREATE TABLE public.testtable
(
    id bigint NOT NULL DEFAULT nextval('testtable_id_seq'::regclass),
    testvalue text COLLATE pg_catalog."default",
    nezahl integer,
    CONSTRAINT testtable_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.testtable
    OWNER to metadatahub;
```
###### fill the testable with one ore more rows




### FAQ


