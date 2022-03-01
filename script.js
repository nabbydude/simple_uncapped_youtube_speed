// ==UserScript==
// @name        Simple Uncapped Youtube Speed
// @namespace   nabby
// @version     0.1
// @description simple uncapped speed changer for youtube that matches the vanilla one
// @author      nabbydude
// @match       *://*.youtube.com/*
// ==/UserScript==

(function() {
	const hudTime = 500;
	const speed_up_icon_path = "M 10,24 18.5,18 10,12 V 24 z M 19,12 V 24 L 27.5,18 19,12 z";
	const speed_down_icon_path = "M 17,24 V 12 l -8.5,6 8.5,6 z m .5,-6 8.5,6 V 12 l -8.5,6 z";
	let speed, timeout_id;
	function enforceSpeed(e) {
		if (speed) e.target.playbackRate = speed;
	}

	function setSpeed(delta, relative, show_bezel) {
		const player = document.querySelector("#ytd-player .html5-video-player");
		if (!player) return false;

		const video = document.querySelector("#ytd-player .html5-main-video");
		if (!video) return false;
		// video.addEventListener("ratechange", enforceSpeed);
		video.addEventListener("play", enforceSpeed);
		speed = Math.max(delta + (relative ? video.playbackRate : 0), 0.25);
		video.playbackRate = speed;

		// show current speed next to timecode
		const label = document.querySelector("#ytd-player .nabby-speed-label");
		if (!label) {
			const duration = document.querySelector("#ytd-player .ytp-time-duration");
			if (!duration) return false;
			label = document.createElement("span");
			label.classList.add("nabby-speed-label");
			label.style = "color: #ddd;";
			duration.parentElement.appendChild(label);
		}
		if (speed === 1) {
			label.innerText = "";
		} else {
			label.innerText = " (" + speed + "x)";
		}

		// show speed up animation and current speed toast
		const bezel_text = document.querySelector("#ytd-player .ytp-bezel-text");
		if (show_bezel && bezel_text) {

			bezel_text.innerText = String(speed) + "x";

			const bezel_container = bezel_text.parentElement.parentElement;
			const bezel_icon = bezel_container.querySelector(".ytp-bezel-icon");
			const bezel_icon_container = bezel_icon.parentElement;

			bezel_container.style = "";
			bezel_container.classList.remove("ytp-bezel-text-hide");

			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("height", "100%");
			svg.setAttribute("width", "100%");
			svg.setAttribute("version", "1.1");
			svg.setAttribute("viewBox", "0 0 36 36");

			const shadow = document.createElementNS("http://www.w3.org/2000/svg", "use");
			shadow.setAttribute("class", "ytp-svg-shadow");
			shadow.setAttributeNS("xlink", "href", "#nabby-speed-icon");

			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("id", "nabby-speed-icon");
			path.setAttribute("class", "ytp-svg-fill");
			path.setAttribute("d", delta > 0 ? speed_up_icon_path : speed_down_icon_path);

			svg.replaceChildren(shadow, path);
			bezel_icon.replaceChildren(svg);

			// restart animation hack for when triggered multiple times in quick succession
			bezel_icon_container.style.animation = "none";
			bezel_icon_container.offsetHeight;
			bezel_icon_container.style.animation = "";


			if (timeout_id) clearTimeout(timeout_id);
			timeout_id = setTimeout(() => {
				timeout_id = undefined;
				bezel_container.style = "display: none;";
			}, hudTime)
		}
		return true;
	}

	window.addEventListener("keydown", e => {
		if (!e.shiftKey) return;
		if (e.key === "<") {
			if (setSpeed(-0.25, true, true)) e.stopImmediatePropagation();
		} else if (e.key === ">") {
			if (setSpeed(0.25, true, true)) e.stopImmediatePropagation();
		} else if (e.key === ":") {
			if (setSpeed(1, false, true)) e.stopImmediatePropagation();
		}
	}, { capture: true });
	window.addEventListener("click", e => {
		const item = e.target.closest(".ytp-menuitem");
		if (!item) return;
		const panel = item.closest(".ytp-panel");
		if (!panel) return;
		const title = panel.querySelector(".ytp-panel-options");
		// assuming this is the "Custom" button if it exists, meaning this is the speed control menu
		if (!title) return;
		const speed = parseFloat(e.target.innerText) || 1;
		setSpeed(speed, false, false)
	}, { capture: true });
})();
