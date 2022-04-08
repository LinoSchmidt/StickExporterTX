from ast import While
import csv
from math import fabs
from msilib import make_id
from posixpath import split
from tkinter.filedialog import askopenfilename
from turtle import width
import pygame
import time

Pixelsize = 10
Size = 500



Height = Size/2
Width = Size
HeightMiddle = Height/2
WidthMiddle = Width/2
joystickScaleHeight = Height/2048
joystickScaleWidth = Width/2048

screen = pygame.display.set_mode((Width,Height+1))
pygame.display.set_caption('Log Test')
pygame.draw.rect(screen, (0,0,255), (WidthMiddle, 0, 1, Height))
pygame.display.flip()

log = askopenfilename()

ltime = []

rud = []
ele = []
thr = []
ail = []

with open(log, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        ltime.append(row['Time'])
        rud.append(row['Rud'])
        ele.append(row['Ele'])
        thr.append(row['Thr'])
        ail.append(row['Ail'])
    

i = 0
while i != len(rud):
    iRud = int(rud[i])
    iEle = int(ele[i])
    iThr = int(thr[i])
    iAil = int(ail[i])
    
    if iRud >= 0:
        rud[i] = (iRud + 1024)*(joystickScaleWidth/2)
    else:
        rud[i] = (1024 - abs(iRud))*(joystickScaleWidth/2)
        
    if iEle >= 0:
        ele[i] = (iEle + 1024)*joystickScaleHeight
    else:
        ele[i] = (1024 - abs(iEle))*joystickScaleHeight
        
    if iThr >= 0:
        thr[i] = (iThr + 1024)*joystickScaleHeight
    else:
        thr[i] = (1024 - abs(iThr))*joystickScaleHeight
        
    if iAil >= 0:
        ail[i] = (iAil + 1024)*(joystickScaleWidth/2)
    else:
        ail[i] = (1024 - abs(iAil))*(joystickScaleWidth/2)
        
    i+=1

    
splitTime = []
for e in ltime:
    splitTime.append(e.split(":").pop(2).replace(".", ""))

meanTime = []
i = 0
f = False
for e in splitTime:
    if f != False:
        if int(e) < int(splitTime[i]):
            meanTime.append(60000 - int(splitTime[i]) + int(e))
        else:
            meanTime.append(int(e) - int(splitTime[i]))
        
        i+=1
    else:
        f = True

totalTime = 0
for e in meanTime:
    totalTime+=e
    
timelineStep = Width/totalTime

pygame.draw.circle(screen, (255, 0, 0), (rud[0], ele[0]), Pixelsize)

while True:
    i = 0
    pastTime = 0
    for e in meanTime:
        time.sleep(e/1000)
        pygame.draw.rect(screen, (0,0,0), (0, 0, Width, Height+1))
        pygame.draw.rect(screen, (0,0,255), (WidthMiddle, 0, 1, Height))
        pygame.draw.circle(screen, (255,0,0), (WidthMiddle+ail[i], Height-ele[i]), Pixelsize)
        pygame.draw.circle(screen, (255,0,0), (rud[i], Height-thr[i]), Pixelsize)
        pygame.draw.rect(screen, (0,255,0), (0, Height, pastTime*timelineStep, 1))
        pygame.display.flip()
        pastTime+=e
        i+=1
        
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                exit()