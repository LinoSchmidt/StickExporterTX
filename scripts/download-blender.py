from io import BytesIO
import urllib.request
from zipfile import ZipFile
import tarfile
import os
import shutil
import time

windowsURL = 'https://ftp.halifax.rwth-aachen.de/blender/release/Blender3.2/blender-3.2.0-windows-x64.zip'
linuxURL = 'https://ftp.halifax.rwth-aachen.de/blender/release/Blender3.2/blender-3.2.0-linux-x64.tar.xz'

# Windows
if(os.path.exists('./dependencies/windows')):
    print("Removing old windows folder")
    shutil.rmtree('./dependencies/windows')

print("Downloading windows version")
with urllib.request.urlopen(windowsURL) as zipresp:
    with ZipFile(BytesIO(zipresp.read())) as zfile:
        zfile.extractall('./dependencies/windows')

print("Adjust windows version")
oldWindowsName = windowsURL.split('/')[-1].replace('.zip', '')
os.rename('./dependencies/windows/' + oldWindowsName, './dependencies/windows/blender')

# Linux
if(os.path.exists('./dependencies/linux')):
    print("Removing old linux folder")
    shutil.rmtree('./dependencies/linux')
    
print("Downloading linux version")
os.mkdir('./dependencies/linux')

urllib.request.urlretrieve(linuxURL, './dependencies/linux/blender.tar.xz')
print("Extracting linux version")
with tarfile.open('./dependencies/linux/blender.tar.xz') as tfile:
    tfile.extractall('./dependencies/linux')
        
print("Adjust linux version")
oldLinuxName = linuxURL.split('/')[-1].replace('.tar.xz', '')
os.rename('./dependencies/linux/' + oldLinuxName, './dependencies/linux/blender')

print("Clean up linux folder")
os.remove('./dependencies/linux/blender.tar.xz')