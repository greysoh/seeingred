console.log("[debug] Monitoring begin.");

const adTextQuerySelector = "a.ytp-title-link.yt-uix-sessionlink.ytp-title-fullerscreen-link";
const usualTitleSelector = "yt-formatted-string.style-scope.ytd-watch-metadata";
const videoPlayerSelector = "video.video-stream.html5-main-video";

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
      const usualAdTextElement = document.querySelector(adTextQuerySelector);
      const usualTitleElement = document.querySelector(usualTitleSelector);

      let iCanHazFlag = false;
      
      if (!usualAdTextElement || !usualTitleElement) {
        await new Promise((i) => setTimeout(i, 100));
        continue;
      }
  
      const videoPlayer = document.querySelector(videoPlayerSelector);
      
      if (usualAdTextElement.innerText.trim() == "" || usualTitleElement.innerText.trim() == "") {
        await new Promise((i) => setTimeout(i, 100));
        continue;
      } else if (usualAdTextElement.innerText != usualTitleElement.innerText) {
        iCanHazFlag = true;

        videoPlayer.style.visibility = "hidden";
        videoPlayer.pause();
        videoPlayer.muted = true;
      }

      while (usualAdTextElement.innerText != usualTitleElement.innerText) {
        videoPlayer.currentTime += 4;
        await new Promise((i) => setTimeout(i, 10));
      }

      if (iCanHazFlag) {
        videoPlayer.style.visibility = "visible";
        videoPlayer.muted = false;
        videoPlayer.currentTime = 0; // TODO: remove this?

        videoPlayer.play();
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