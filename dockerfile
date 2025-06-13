FROM mariadb:latest

ENV MYSQL_ROOT_PASSWORD=1234
ENV MYSQL_DATABASE=word
ENV MYSQL_USER=word1234
ENV MYSQL_PASSWORD=word1234

COPY dump.sql /docker-entrypoint-initdb.d/
