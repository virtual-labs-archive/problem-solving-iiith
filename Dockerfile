FROM ubuntu:12.04

# Usage: File Author/Maintainer
MAINTAINER vlead-systems "systems@vlabs.ac.in"

#Usage: Setting proxy environment
#ENV http_proxy "http://proxy.iiit.ac.in:8080"
#ENV https_proxy "http://proxy.iiit.ac.in:8080"

# Usage: Updating system
RUN apt-get update

# Usage: Installing dependencies for computer graphics lab
RUN apt-get install -y make php5 apache2 rsync gcc g++ libapache2-mod-python libapache2-mod-wsgi

RUN sed -i '/<\/VirtualHost>/i \
  <Directory /var/www/> \
    AddHandler mod_python .py \
      PythonHandler mod_python.publisher \
        PythonDebug On \
        </Directory> \
' /etc/apache2/sites-available/default

RUN mkdir /problem-solving-iiith

COPY src/ /problem-solving-iiith/src

WORKDIR ./problem-solving-iiith/src

#Usage: Running make
RUN make

#Usage: Copying lab sources into web server path
RUN rm -rf /var/www/*
RUN cp -r ../build/* /var/www/

EXPOSE 80
EXPOSE 443

#Usage: Setting permissions in /var/www
RUN chmod -R 755 /var/www/*

CMD /usr/sbin/apache2ctl -D FOREGROUND
