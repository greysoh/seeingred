console.log("[debug] Monitoring begin.");
let oldHref = window.location.href;
let isRunningAdObserver = window.location.href.includes("watch?v=");

const observer = new MutationObserver((mutations) => {
  if (oldHref != window.location.href) {
    oldHref = window.location.href;
    isRunningAdObserver = window.location.href.includes("watch?v=");
  }
});

async function doBackgroundAdsChecker() {
  while (true) {
    if (isRunningAdObserver) {      
      const usualAdTextElement = document.getElementsByClassName("ytp-title-link yt-uix-sessionlink ytp-title-fullerscreen-link")[0];
      const usualTitleElement = document.querySelector("yt-formatted-string.style-scope.ytd-watch-metadata");
      
      if (!usualAdTextElement || !usualTitleElement) {
        await new Promise((i) => setTimeout(i, 100));
        continue;
      }
  
      const videoPlayer = document.querySelector("video.video-stream.html5-main-video");
  
      if (usualAdTextElement.innerText.trim() == "") continue;
      while (usualAdTextElement.innerText != usualTitleElement.innerText) {
        // Psychic attack this mofo
        videoPlayer.muted = true;
        videoPlayer.pause();
        videoPlayer.currentTime += 1;
        videoPlayer.play();
  
        await new Promise((i) => setTimeout(i, 10));
      }

      videoPlayer.muted = false;
    }
  
    await new Promise((i) => setTimeout(i, 100));
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  doBackgroundAdsChecker();

  observer.observe(document.querySelector("body"), {
    childList: true,
    subtree: true
  });
});