FROM gitpod/workspace-full

# install Sass
RUN sudo apt update && \
sudo apt-get install -y sass &&\
brew install sass/sass/sass