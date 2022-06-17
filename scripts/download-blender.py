from io import BytesIO
import platform
import urllib.request
from zipfile import ZipFile
import tarfile
import os
import shutil

windowsURL = 'https://ftp.halifax.rwth-aachen.de/blender/release/Blender3.2/blender-3.2.0-windows-x64.zip'
linuxURL = 'https://ftp.halifax.rwth-aachen.de/blender/release/Blender3.2/blender-3.2.0-linux-x64.tar.xz'

if(platform.system() == 'Windows'):
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

if(platform.system() == 'Linux'):
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
    
if(platform.system() == 'Darwin'):
    if(os.path.exists('./dependencies/darwin')):
        print("Removing old darwin folder")
        shutil.rmtree('./dependencies/darwin')
    
    print("Darwin is not supported yet!")
    
    # TODO: Add darwin support as following:
    # - look for blender
    # -- if blender not found, ask user to install blender or let the script do it
    # --- if user wants the script to install blender, download the installer
    # --- ask the user to follow the installer
    # - try copy the blender files into the dependencies blender folder
    # -- if it doesn't work, ask the user for admin rights and try to copy again
    # remove the "Darwin is not supported yet!" comment