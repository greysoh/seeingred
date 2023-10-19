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

      let iCanHazFlag = false;
      
      if (!usualAdTextElement || !usualTitleElement) {
        await new Promise((i) => setTimeout(i, 100));
        continue;
      }
  
      const videoPlayer = document.querySelector("video.video-stream.html5-main-video");
      
      if (usualAdTextElement.innerText.trim() == "") continue;
      else if (usualAdTextElement.innerText != usualTitleElement.innerText) {
        iCanHazFlag = true;

        videoPlayer.pause();
        videoPlayer.muted = true;
      }

      while (usualAdTextElement.innerText != usualTitleElement.innerText) {
        console.log(usualAdTextElement.innerText, usualTitleElement.innerText);
        // Psychic attack this mofo
        videoPlayer.currentTime += 2;
  
        await new Promise((i) => setTimeout(i, 10));
      }

      if (iCanHazFlag) {
        videoPlayer.play();

        videoPlayer.muted = false;
        videoPlayer.currentTime = 0; // TODO: remove this?
      }
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