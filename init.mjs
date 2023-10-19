const scriptElem = document.createElement("script");
scriptElem.src = chrome.runtime.getURL("src/index.mjs");
scriptElem.type = "module";
scriptElem.defer = true;

scriptElem.onload = () => {
  scriptElem.remove();
}

(document.head || document.documentElement).appendChild(scriptElem);