
FROM python:3.9-slim
#FROM python:3.6.8

ARG NAME=pii_datalens
ARG PORT=40000
ENV PORT=40000
ARG NLP_CONF_FILE=conf/default.yaml
ENV PIPENV_VENV_IN_PROJECT=1
WORKDIR /usr/bin/${NAME}

COPY ./Pipfile* /usr/bin/${NAME}/
RUN apt-get update && apt-get install -y procps
RUN pip3 install pipenv
RUN pipenv sync
# install nlp models specified in conf/default.yaml
COPY ./install_nlp_models.py /usr/bin/${NAME}/
COPY ${NLP_CONF_FILE} /usr/bin/${NAME}/${NLP_CONF_FILE}
RUN pipenv run python install_nlp_models.py --conf_file ${NLP_CONF_FILE}

COPY . /usr/bin/${NAME}/
EXPOSE ${PORT}
RUN echo ${PORT}
RUN apt-get update && apt-get install -y procps curl net-tools
#CMD pipenv run python app.py --host 0.0.0.0 --port ${PORT}
CMD pipenv run python app.py --host 127.0.0.1
