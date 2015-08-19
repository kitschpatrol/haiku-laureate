FROM phusion/baseimage:latest

RUN mkdir -p /home/app
RUN apt-get update && sudo apt-get upgrade -y
RUN apt-get install -y python-pip git
RUN pip install virtualenv
RUN virtualenv -p python2.7 /home/.venv/default
RUN /home/.venv/default/bin/pip install --upgrade cherrypy cherrypy-cors flickrapi nltk requests urllib3
RUN apt-get autoclean -y && apt-get autoremove -y

# Install NLTK Contrib
RUN git clone https://github.com/nltk/nltk_contrib.git
WORKDIR /nltk_contrib
RUN /home/.venv/default/bin/python setup.py install

VOLUME ["/home/app"]

EXPOSE 80

WORKDIR /home/app/
CMD ["/home/.venv/default/bin/cherryd", "-i", "server"]
