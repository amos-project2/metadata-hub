FROM python:3.8
RUN mkdir metadatahub
WORKDIR /metadatahub
COPY crawler/requirements/base.txt crawler/requirements/base.txt
RUN pip install -r crawler/requirements/base.txt
COPY crawler crawler
COPY configs configs
ENV METADATAHUB_ENV=/metadatahub/configs/environment.testing.json
CMD [ "python", "crawler/main.py" ]
