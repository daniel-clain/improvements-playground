
document
  .querySelectorAll<HTMLElement>("[data-video-container]")
  .forEach((videoContainer) => {
    let videoPlaying = false;

    const playBtn = videoContainer.querySelector<HTMLDivElement>(
      "[data-video-play-button]"
    );
    const video = videoContainer.querySelector<HTMLVideoElement>(
      "[data-video]"
    );

    if(!video || !playBtn) return

    video.onclick = _ => {
      videoPlaying = !videoPlaying;
      videoPlaying ? 
        (video.play(), playBtn.classList.add('is-hidden')) : 
        (video.load(), playBtn.classList.remove('is-hidden'));
    };

    video.onended = _ => {
      video.load()
      playBtn.classList.remove('is-hidden')
      videoPlaying = false
    }


  });
