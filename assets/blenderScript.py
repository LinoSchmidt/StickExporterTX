from ast import Str
import csv
import logging
import math
import sys
import time
import bpy
import xml.etree.ElementTree as ET

argv = sys.argv
argv = argv[argv.index("--") + 1:]

logger = logging.getLogger('simple_example')
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(message)s')
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)
logger.addHandler(console_handler)

GimbalL = bpy.data.objects["GimbalL"]
StickL = bpy.data.objects["StickL"]
GimbalR = bpy.data.objects["GimbalR"]
StickR = bpy.data.objects["StickR"]
GimbalCoverR = bpy.data.objects["GimbalCoverR"]
TrailR = bpy.data.objects["TrailR"]
Camera = bpy.data.objects["Camera"]
Plane = bpy.data.objects["Plane.001"]
scn = bpy.context.scene

lyMax = 0.436
lyMin = -0.436
lxMax = -0.436
lxMin = 0.436
ryMax = -0.436
ryMin = 0.436
rxMax = 0.436
rxMin = -0.436

def _map(x, in_min, in_max, out_min, out_max):
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

logger.info("Blender started successfully!")

while True:
    command = input("Waiting for command: ")
    
    time.sleep(0.5)
    
    settingsRoot = ET.parse(argv[0]+"/settings.xml").getroot()
    
    StickMode = settingsRoot[3].text
    if(StickMode == "true"):
        StickMode = 2
    else:
        StickMode = 1
    
    fps = int(settingsRoot[0].text)
    width = int(settingsRoot[1].text)
    StickDistance = _map(int(settingsRoot[2].text), 0, 100, 5, 105)
    logs = settingsRoot[4].text[1:][:-1].split("\"\"")
    output = settingsRoot[5].text
    
    if(command == "startRendering"):
        
        logCount = len(logs)
        logNumber = 1
        
        for log in logs:
            logger.info("Lognr:" + ((str)(logNumber)) + ":")
            
            logTime = []
            rud = []
            ele = []
            thr = []
            ail = []
            
            try:
                with open(log, newline='') as csvFile:
                    reader = csv.DictReader(csvFile)
                    for row in reader:
                        logTime.append(row['Time'].split(":").pop(2).replace(".", ""))
                        rud.append(int(row['Rud']))
                        ele.append(int(row['Ele']))
                        thr.append(int(row['Thr']))
                        ail.append(int(row['Ail']))
                
                meanTime = []
                i = 0
                while i < len(logTime)-1:
                    if int(logTime[i]) > int(logTime[i+1]):
                        meanTime.append(60000 - int(logTime[i]) + int(logTime[i+1]))
                    else:
                        meanTime.append(int(logTime[i+1]) - int(logTime[i]))
                    i+=1
                
                totalTime = 0
                for e in meanTime:
                    totalTime+=e
                
                frameCount = math.floor(totalTime/1000*fps-1)
                FPSxxx = 1000/fps
            except Exception as e:
                logger.error("Can't read Log: " + (Str)(e))
                
            bpy.context.scene.render.image_settings.file_format = 'FFMPEG'
            bpy.context.scene.render.ffmpeg.format = "QUICKTIME"
            bpy.context.scene.render.ffmpeg.codec = "QTRLE"
            
            scn.render.resolution_x = width
            GimbalCoverR.location[0] = StickDistance
            GimbalR.location[0] = StickDistance
            TrailR.location[0] = StickDistance
            Plane.location[0] = StickDistance
            Camera.location[0] = StickDistance/2
            Camera.data.ortho_scale = StickDistance+5
            scn.render.resolution_y = int(width/_map(StickDistance, 5, 105, 2, 21.6))
            bpy.context.scene.render.filepath = output + "\\" + log.split("/")[-1].split("\\")[-1].replace(".csv", ".mov")
            
            scn.render.fps = 1000
            scn.render.fps_base = FPSxxx
            
            scn.frame_start = 0
            scn.frame_end = frameCount
            logger.info("Frames:" + str(frameCount) + ":")
            
            frame = 0
            log = 0
            pastTime = 0
            while frame <= frameCount:
                currentTime = math.floor(FPSxxx*frame)
                while currentTime >= pastTime+meanTime[log]:
                    pastTime+=meanTime[log]
                    log+=1
                    
                multiplier = (currentTime-pastTime)/meanTime[log]
                
                ailP = _map(ail[log]+(ail[log+1]-ail[log])*multiplier, -1024, 1024, rxMin, rxMax)
                eleP = _map(ele[log]+(ele[log+1]-ele[log])*multiplier, -1024, 1024, ryMin, ryMax)
                rudP = _map(rud[log]+(rud[log+1]-rud[log])*multiplier, -1024, 1024, lyMin, lyMax)
                thrP = _map(thr[log]+(thr[log+1]-thr[log])*multiplier, -1024, 1024, lxMin, lxMax)
                
                bpy.context.scene.frame_set(frame)
                
                if StickMode == "1":
                    StickL.rotation_euler=[0,0,0]
                    StickL.rotation_euler.rotate_axis("Y", ailP)
                    StickL.keyframe_insert(data_path="rotation_euler", index=-1)
                    GimbalL.rotation_euler=[0,0,0]
                    GimbalL.rotation_euler.rotate_axis("X", eleP)
                    GimbalL.keyframe_insert(data_path="rotation_euler", index=-1)
                    StickR.rotation_euler=[0,0,0]
                    StickR.rotation_euler.rotate_axis("Y", rudP)
                    StickR.keyframe_insert(data_path="rotation_euler", index=-1)
                    GimbalR.rotation_euler=[0,0,0]
                    GimbalR.rotation_euler.rotate_axis("X", thrP)
                    GimbalR.keyframe_insert(data_path="rotation_euler", index=-1)
                else:
                    StickL.rotation_euler=[0,0,0]
                    StickL.rotation_euler.rotate_axis("Y", rudP)
                    StickL.keyframe_insert(data_path="rotation_euler", index=-1)
                    GimbalL.rotation_euler=[0,0,0]
                    GimbalL.rotation_euler.rotate_axis("X", thrP)
                    GimbalL.keyframe_insert(data_path="rotation_euler", index=-1)
                    StickR.rotation_euler=[0,0,0]
                    StickR.rotation_euler.rotate_axis("Y", ailP)
                    StickR.keyframe_insert(data_path="rotation_euler", index=-1)
                    GimbalR.rotation_euler=[0,0,0]
                    GimbalR.rotation_euler.rotate_axis("X", eleP)
                    GimbalR.keyframe_insert(data_path="rotation_euler", index=-1)
                
                logger.info("Init:" + ((str)(frame)) + ":")
                frame+=1
            
            bpy.ops.render.render(animation=True)
            
            if(logCount <= logNumber):
                logger.info("Finished")
            
            logNumber+=1
    
    elif(command == "getRender"):
        
        bpy.context.scene.render.image_settings.file_format = 'PNG'
        bpy.context.scene.frame_set(0)
        bpy.context.scene.render.filepath = argv[0] + "\\render.png"
        
        scn.render.resolution_x = width
        GimbalCoverR.location[0] = StickDistance
        GimbalR.location[0] = StickDistance
        TrailR.location[0] = StickDistance
        Plane.location[0] = StickDistance
        Camera.location[0] = StickDistance/2
        Camera.data.ortho_scale = StickDistance+5
        scn.render.resolution_y = int(width/_map(StickDistance, 5, 105, 2, 21.6))
        
        StickL.rotation_euler=[0,0,0]
        StickL.rotation_euler.rotate_axis("Y", 0.436)
        StickL.keyframe_insert(data_path="rotation_euler", index=-1)
        GimbalL.rotation_euler=[0,0,0]
        GimbalL.rotation_euler.rotate_axis("X", 0.236)
        GimbalL.keyframe_insert(data_path="rotation_euler", index=-1)
        StickR.rotation_euler=[0,0,0]
        StickR.rotation_euler.rotate_axis("Y", -0.056)
        StickR.keyframe_insert(data_path="rotation_euler", index=-1)
        GimbalR.rotation_euler=[0,0,0]
        GimbalR.rotation_euler.rotate_axis("X", -0.436)
        GimbalR.keyframe_insert(data_path="rotation_euler", index=-1)
        
        bpy.ops.render.render(write_still=True)