#!/bin/bash
set -e

cd /tmp
wget https://www.python.org/ftp/python/3.13.5/Python-3.13.5.tgz
tar xf Python-3.13.5.tgz
cd Python-3.13.5
./configure --enable-optimizations --without-profile
make -j$(nproc)
sudo make altinstall

sudo update-alternatives --install /usr/bin/python python /usr/local/bin/python3.13 2
sudo update-alternatives --install /usr/bin/python3 python3 /usr/local/bin/python3.13 2

echo | sudo update-alternatives --config python
echo | sudo update-alternatives --config python3

python --version
python3 --version
