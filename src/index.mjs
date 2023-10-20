// ==UserScript==
// @name         SeeingRed
// @namespace    http://github.com/greysoh/
// @version      1.0.0
// @description  A stupidly simple YouTube adblock implementation.
// @author       @greysoh
// @match        *://*.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

// Home page
const bannerAdSelector = "div#masthead-ad";
const fakeVideoAdSelector = "ytd-ad-inline-playback-meta-block";
const searchPopupAdSelector = "ytd-ad-slot-renderer.style-scope.ytd-search-pyv-renderer";

// Upsells
const youtubeTvUpsellSelector = "ytd-primetime-promo-renderer.style-scope.ytd-rich-section-renderer";

// Video player + friends
const adTextQuerySelector = "a.ytp-title-link.yt-uix-sessionlink.ytp-title-fullerscreen-link";
const usualTitleSelector = "yt-formatted-string.style-scope.ytd-watch-metadata";
const videoPlayerSelector = "video.video-stream.html5-main-video";

// Video player recommended
const fakeRecommendedAdSelector = "ytd-ad-slot-renderer.style-scope.ytd-watch-next-secondary-results-renderer";

let oldHref = window.location.href;
let isRunningAdObserver = window.location.href.includes("watch?v=");

const observer = new MutationObserver((mutations) => {
  if (oldHref != window.location.href) {
    oldHref = window.location.href;
    isRunningAdObserver = window.location.href.includes("watch?v=");
  }
});

async function doMainPageAdsChecker() {
  // == Main page ==
  document.querySelectorAll(bannerAdSelector).forEach((i) => i.remove());

  // FIXME: improve these?
  document.querySelectorAll(fakeVideoAdSelector).forEach((i) => i.parentElement.parentElement.remove()); 
  document.querySelectorAll(youtubeTvUpsellSelector).forEach((i) => i.parentElement.parentElement.remove());
  
  // == Search ==
  document.querySelectorAll(searchPopupAdSelector).forEach((i) => i.remove());
}

let prevTitle;

async function doBackgroundAdsChecker() {
  document.querySelectorAll(fakeRecommendedAdSelector).forEach((i) => i.remove());

  const usualAdTextElement = document.querySelector(adTextQuerySelector);
  const usualTitleElement = document.querySelector(usualTitleSelector);

  let iCanHazFlag = false;
  if (!usualAdTextElement || !usualTitleElement) return;
  
  const videoPlayer = document.querySelector(videoPlayerSelector);
  if (usualAdTextElement.innerText.trim() == "" || usualTitleElement.innerText.trim() == "") return;

  const previousTitleIsAMatch = prevTitle == usualTitleElement.innerText && prevTitle != "";
  
  if (usualAdTextElement.innerText != usualTitleElement.innerText && previousTitleIsAMatch) {
    iCanHazFlag = true;

    videoPlayer.style.visibility = "hidden";
    videoPlayer.muted = true;
    videoPlayer.pause();
  }

  while (usualAdTextElement.innerText != usualTitleElement.innerText && previousTitleIsAMatch) {
    videoPlayer.currentTime += 4;
    await new Promise((i) => setTimeout(i, 5));
  }

  if (iCanHazFlag) {
    videoPlayer.style.visibility = "visible";
    videoPlayer.muted = false;
    videoPlayer.currentTime = 0; // TODO: remove this?

    videoPlayer.play();
  }

  prevTitle = usualTitleElement.innerText;
}

async function oneTrueMain() {
  while (true) {
    if (isRunningAdObserver) await doBackgroundAdsChecker();
    else await doMainPageAdsChecker();

    await new Promise((i) => setTimeout(i, 100));
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  oneTrueMain();

  observer.observe(document.querySelector("body"), {
    childList: true,
    subtree: true
  });
});