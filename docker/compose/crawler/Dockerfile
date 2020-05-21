FROM python:3.8
RUN mkdir metadatahub
WORKDIR /metadatahub
COPY crawler crawler
RUN pip install -r crawler/requirements/base.txt
COPY configs configs
ENV METADATAHUB_ENV=/metadatahub/configs/environment.testing.json
CMD [ "python", "crawler/main.py" ]
