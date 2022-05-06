import csv
from tkinter.filedialog import askopenfilename
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

try:
    with open(log, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            ltime.append(row['Time'])
            rud.append(row['Rud'])
            ele.append(row['Ele'])
            thr.append(row['Thr'])
            ail.append(row['Ail'])
except:
    print("Can't read Log File!")
    exit()

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
                
while True:
    i = 0
    lastTime = 0
    while i < len(meanTime):
        if(i == 0):
            pygame.draw.circle(screen, (255,0,0), (WidthMiddle+ail[0], Height-ele[0]), Pixelsize)
            pygame.draw.circle(screen, (255,0,0), (rud[0], Height-thr[0]), Pixelsize)
            pygame.display.flip()
            startTime = int(time.time()*1000)
            i+=1
        else:
            while(startTime+lastTime+meanTime[i-1] >= int(time.time()*1000)):
                multiplier = (int(time.time()*1000)-(startTime+lastTime))/meanTime[i-1]
                
                ailP = (WidthMiddle+ail[i-1])+((WidthMiddle+ail[i])-(WidthMiddle+ail[i-1]))*multiplier
                eleP = (Height-ele[i-1])+((Height-ele[i])-(Height-ele[i-1]))*multiplier
                rudP = (rud[i-1])+((rud[i])-(rud[i-1]))*multiplier
                thrP = (Height-thr[i-1])+((Height-thr[i])-(Height-thr[i-1]))*multiplier
                
                pygame.draw.rect(screen, (0,0,0), (0, 0, Width, Height+1))
                pygame.draw.rect(screen, (0,0,255), (WidthMiddle, 0, 1, Height))
                pygame.draw.circle(screen, (255,0,0), (ailP, eleP), Pixelsize)
                pygame.draw.circle(screen, (255,0,0), (rudP, thrP), Pixelsize)
                pygame.draw.rect(screen, (0,255,0), (0, Height, (int(time.time()*1000)-startTime)*timelineStep, 1))
                pygame.display.flip()
            i+=1
            if i < len(meanTime):
                lastTime += meanTime[i]
            
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                exit()