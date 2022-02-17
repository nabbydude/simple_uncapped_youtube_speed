// ==UserScript==
// @name        Simple Uncapped Youtube Speed
// @namespace   nabby
// @version     0.1
// @description simple uncapped speed changer for youtube that matches the vanilla one
// @author      nabbydude
// @match       *://*.youtube.com/*
// ==/UserScript==

(function() {
	var hudTime = 500;
	var speed_up_icon_path = "M 10,24 18.5,18 10,12 V 24 z M 19,12 V 24 L 27.5,18 19,12 z";
	var speed_down_icon_path = "M 17,24 V 12 l -8.5,6 8.5,6 z m .5,-6 8.5,6 V 12 l -8.5,6 z";
	var speed, timeout_id;
	function enforceSpeed(e) {
		if (speed && e.target.playbackRate !== speed) e.target.playbackRate = speed;
	}

	function setSpeed(delta, relative, show_bezel) {
		var player = document.querySelector("#ytd-player .html5-video-player");
		if (!player) return false;

		var video = document.querySelector("#ytd-player .html5-main-video");
		if (!video) return false;
		// video.addEventListener("ratechange", enforceSpeed);
		video.addEventListener("play", enforceSpeed);

		var label = document.querySelector("#ytd-player .nabby-speed-label");
		if (!label) {
			var duration = document.querySelector("#ytd-player .ytp-time-duration");
			if (!duration) return false;
			label = document.createElement("span");
			label.classList.add("nabby-speed-label");
			label.style = "color: #ddd;";
			duration.parentElement.appendChild(label);
		}
		speed = Math.max(delta + (relative ? video.playbackRate : 0), 0.25);
		video.playbackRate = speed;
		if (speed === 1) {
			label.innerText = "";
		} else {
			label.innerText = " (" + speed + "x)";
		}

		var bezel_text = document.querySelector(".ytp-bezel-text");
		if (show_bezel && bezel_text) {

			bezel_text.innerText = String(speed) + "x";

			var bezel_container = bezel_text.parentElement.parentElement;
			var bezel_icon = bezel_container.querySelector(".ytp-bezel-icon");
			var bezel_icon_container = bezel_icon.parentElement;

			bezel_container.style = "";
			bezel_container.classList.remove("ytp-bezel-text-hide");

			var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("height", "100%");
			svg.setAttribute("width", "100%");
			svg.setAttribute("version", "1.1");
			svg.setAttribute("viewBox", "0 0 36 36");

			var shadow = document.createElementNS("http://www.w3.org/2000/svg", "use");
			shadow.setAttribute("class", "ytp-svg-shadow");
			shadow.setAttributeNS("xlink", "href", "#nabby-speed-icon");

			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
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
			timeout_id = setTimeout(function() {
				timeout_id = undefined;
				bezel_container.style = "display: none;";
			}, hudTime)
		}
		return true;
	}

	window.addEventListener("keydown", function(e) {
		if (!e.shiftKey) return;
		if (e.key === "<") {
			if (setSpeed(-0.25, true, true)) e.stopImmediatePropagation();
		} else if (e.key === ">") {
			if (setSpeed(0.25, true, true)) e.stopImmediatePropagation();
		} else if (e.key === ":") {
			if (setSpeed(1, false, true)) e.stopImmediatePropagation();
		}
	}, { capture: true });
	window.addEventListener("click", function(e) {
		var item = e.target.closest(".ytp-menuitem");
		if (!item) return;
		var panel = item.closest(".ytp-panel");
		if (!panel) return;
		var title = panel.querySelector(".ytp-panel-options");
		if (!title) return; // assuming this is the "Custom" button, meaning this is the speed control menu
		var speed = parseFloat(e.target.innerText);
		if (!speed) speed = 1;
		setSpeed(speed, false, false)
	}, { capture: true });
})();
