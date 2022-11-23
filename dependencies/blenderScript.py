from ast import Str
import csv
import logging
import math
import sys
import time
import bpy
import json

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
    command = input("Waiting for command: ").split(" -- ")
    
    time.sleep(0.5)
    
    settings = json.loads(command[1])
    
    stickMode2 = settings["stickMode2"]
    width = settings["width"]
    stickDistance = _map(settings["stickDistance"], 0, 100, 5, 105)
    fps = settings["fps"]
    videoFormat = settings["videoFormat"]
    logs = settings["logs"][1:][:-1].split("\"\"")
    output = settings["output"]
    dataPath = settings["dataPath"]
    
    if(command[0] == "startRendering"):
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
            
            if(videoFormat == "mp4"):
                bpy.context.scene.render.ffmpeg.format = 'MPEG4'
                bpy.context.scene.render.ffmpeg.codec = 'H264'
                bpy.context.scene.render.image_settings.color_mode = 'RGB'
            elif(videoFormat == "mov"):
                bpy.context.scene.render.ffmpeg.format = 'QUICKTIME'
                bpy.context.scene.render.ffmpeg.codec = 'QTRLE'
                bpy.context.scene.render.image_settings.color_mode = 'RGBA'
            elif(videoFormat == "avi"):
                bpy.context.scene.render.ffmpeg.format = 'AVI'
                bpy.context.scene.render.ffmpeg.codec = 'FFV1'
                bpy.context.scene.render.image_settings.color_mode = 'RGBA'
            elif(videoFormat == "webm"):
                bpy.context.scene.render.ffmpeg.format = 'WEBM'
                bpy.context.scene.render.ffmpeg.codec = 'WEBM'
                bpy.context.scene.render.image_settings.color_mode = 'RGBA'
            elif(videoFormat == "mkv"):
                bpy.context.scene.render.ffmpeg.format = 'MKV'
                bpy.context.scene.render.ffmpeg.codec = 'WEBM'
                bpy.context.scene.render.image_settings.color_mode = 'RGBA'
            
            scn.render.resolution_x = width
            GimbalCoverR.location[0] = stickDistance
            GimbalR.location[0] = stickDistance
            TrailR.location[0] = stickDistance
            Plane.location[0] = stickDistance
            Camera.location[0] = stickDistance/2
            Camera.data.ortho_scale = stickDistance+5
            scn.render.resolution_y = int(width/_map(stickDistance, 5, 105, 2, 21.6))
            bpy.context.scene.render.filepath = output + "\\" + log.split("/")[-1].split("\\")[-1].replace(".csv", "."+videoFormat)
            
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
                
                StickL.rotation_euler=[0,0,0]
                GimbalL.rotation_euler=[0,0,0]
                StickR.rotation_euler=[0,0,0]
                GimbalR.rotation_euler=[0,0,0]
                
                if stickMode2 == False:
                    StickL.rotation_euler.rotate_axis("Y", ailP)
                    GimbalL.rotation_euler.rotate_axis("X", eleP)
                    StickR.rotation_euler.rotate_axis("Y", rudP)
                    GimbalR.rotation_euler.rotate_axis("X", thrP)
                else:
                    StickL.rotation_euler.rotate_axis("Y", rudP)
                    GimbalL.rotation_euler.rotate_axis("X", thrP)
                    StickR.rotation_euler.rotate_axis("Y", ailP)
                    GimbalR.rotation_euler.rotate_axis("X", eleP)
                    
                StickL.keyframe_insert(data_path="rotation_euler", index=-1)
                GimbalL.keyframe_insert(data_path="rotation_euler", index=-1)
                StickR.keyframe_insert(data_path="rotation_euler", index=-1)
                GimbalR.keyframe_insert(data_path="rotation_euler", index=-1)
                
                logger.info("Init:" + ((str)(frame)) + ":")
                frame+=1
            
            bpy.ops.render.render(animation=True)
            
            if(logCount <= logNumber):
                logger.info("Finished")
            
            logNumber+=1
    
    elif(command[0] == "getRender"):
        
        bpy.context.scene.render.image_settings.file_format = 'PNG'
        bpy.context.scene.render.filepath = dataPath + "\\render.png"
        
        scn.render.resolution_x = width
        GimbalCoverR.location[0] = stickDistance
        GimbalR.location[0] = stickDistance
        TrailR.location[0] = stickDistance
        Plane.location[0] = stickDistance
        Camera.location[0] = stickDistance/2
        Camera.data.ortho_scale = stickDistance+5
        scn.render.resolution_y = int(width/_map(stickDistance, 5, 105, 2, 21.6))
        
        bpy.context.scene.frame_set(0)
        
        StickL.rotation_euler=[0,0,0]
        GimbalL.rotation_euler=[0,0,0]
        StickR.rotation_euler=[0,0,0]
        GimbalR.rotation_euler=[0,0,0]
        
        if(stickMode2 == True):
            StickL.rotation_euler.rotate_axis("Y", 0)
            GimbalL.rotation_euler.rotate_axis("X", 0.436)
            StickR.rotation_euler.rotate_axis("Y", 0)
            GimbalR.rotation_euler.rotate_axis("X", 0)
        else:
            StickL.rotation_euler.rotate_axis("Y", 0)
            GimbalL.rotation_euler.rotate_axis("X", 0)
            StickR.rotation_euler.rotate_axis("Y", 0)
            GimbalR.rotation_euler.rotate_axis("X", 0.436)
            
        StickL.keyframe_insert(data_path="rotation_euler", index=-1)
        GimbalL.keyframe_insert(data_path="rotation_euler", index=-1)
        StickR.keyframe_insert(data_path="rotation_euler", index=-1)
        GimbalR.keyframe_insert(data_path="rotation_euler", index=-1)
        
        bpy.context.scene.frame_set(1)
        
        StickL.rotation_euler=[0,0,0]
        GimbalL.rotation_euler=[0,0,0]
        StickR.rotation_euler=[0,0,0]
        GimbalR.rotation_euler=[0,0,0]
        
        if(stickMode2 == True):
            StickL.rotation_euler.rotate_axis("Y", 0)
            GimbalL.rotation_euler.rotate_axis("X", 0.436)
            StickR.rotation_euler.rotate_axis("Y", 0)
            GimbalR.rotation_euler.rotate_axis("X", 0)
        else:
            StickL.rotation_euler.rotate_axis("Y", 0)
            GimbalL.rotation_euler.rotate_axis("X", 0)
            StickR.rotation_euler.rotate_axis("Y", 0)
            GimbalR.rotation_euler.rotate_axis("X", 0.436)
            
        StickL.keyframe_insert(data_path="rotation_euler", index=-1)
        GimbalL.keyframe_insert(data_path="rotation_euler", index=-1)
        StickR.keyframe_insert(data_path="rotation_euler", index=-1)
        GimbalR.keyframe_insert(data_path="rotation_euler", index=-1)
        
        bpy.context.scene.frame_set(0)
        
        bpy.ops.render.render(write_still=True)