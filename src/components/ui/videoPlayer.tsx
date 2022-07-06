import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = ({options, src}:{options:videojs.PlayerOptions, src:{src:string, type:string}}) => {
  const videoNode = React.useRef<HTMLVideoElement>(null);
  const player = React.useRef<videojs.Player>();
  const srcLoaded = React.useRef<boolean>(false);
  const initialized = React.useRef<boolean>(false);

  React.useEffect(() => {
    if(!srcLoaded.current) {
      if(videoNode.current && !initialized.current) {
        videojs(videoNode.current, {
          ...options,
          ...{
            sources: [src]
          }
        }).ready(function() {
          player.current = this;
          srcLoaded.current = true;
        });
        initialized.current = true;
      }
    } else {
      player.current?.src(src);
      player.current?.load();
    }
  }, [options, src]);

  return <video ref={videoNode} className="video-js" />;
};

export default VideoPlayer;
