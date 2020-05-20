FROM python:3.8

WORKDIR /usr/src/app
COPY crawler/ .
RUN pip install -r requirements/base.txt
RUN rm -rf test.py README.md helloworld.py configCrawler.json tests doc requirements
COPY environment.default.json environment.json
COPY environment.schema ..
COPY crawler-config.schema ..
ENV METADATAHUB_ENV=/usr/src/app/environment.json
CMD [ "python", "main.py"]
