// ==UserScript==
// @name        Simple Uncapped Youtube Speed
// @namespace   nabby
// @version     0.1
// @description simple uncapped speed changer for youtube that matches the vanilla one
// @author      nabbydude
// @match       *://*.youtube.com/*
// ==/UserScript==

(function() {
	const config = {
		hud_time: 500, // how long the current speed toast shows for in milliseconds
		show_speed_in_timecode: true,
		click_timecode_to_reset_speed: true, // true, false, or "speed_only"
		speed_up_key: ">",
		speed_down_key: "<",
		speed_reset_key: "<",
		speed_key_increment: 0.25,
		minimum_speed: 0.25, // dont set this to 0, a speed of 0 will throw errors
		selectable_speeds: [
			0.25,
			0.5,
			0.75,
			1, // normal
			1.25,
			1.5,
			1.75,
			2,
			2.25,
			2.5,
			2.75,
			3,
			3.25,
			3.5,
			3.75,
			4,
		],

	};

	const speed_up_icon_path = "M 10,24 18.5,18 10,12 V 24 z M 19,12 V 24 L 27.5,18 19,12 z";
	const speed_down_icon_path = "M 17,24 V 12 l -8.5,6 8.5,6 z m .5,-6 8.5,6 V 12 l -8.5,6 z";

	let speed, timeout_id;
	function enforceSpeed(e) {
		if (speed) e.target.playbackRate = speed;
	}

	function setSpeed(delta, relative, show_bezel) {
		const player = document.querySelector("#ytd-player .html5-video-player");
		if (!player) return false;

		const video = player.querySelector(".html5-main-video");
		if (!video) return false;
		// video.addEventListener("ratechange", enforceSpeed);
		video.addEventListener("play", enforceSpeed);
		const old_speed = video.playbackRate
		speed = Math.max(delta + (relative ? video.playbackRate : 0), config.minimum_speed);
		video.playbackRate = speed;

		// show current speed next to timecode
		let label = player.querySelector(".nabby-speed-label");
		if (!label) {
			const duration = player.querySelector(".ytp-time-duration");
			if (!duration) return false;
			label = document.createElement("span");
			label.classList.add("nabby-speed-label");
			label.style = "color: #ddd;";
			const parent = duration.parentElement;
			parent.appendChild(label);
			if (config.click_timecode_to_reset_speed) {
				const button = config.click_timecode_to_reset_speed === "speed_only" ? label : parent;
				button.addEventListener("click", e => { setSpeed(1, false, true); });
			}
		}
		if (speed === 1 || !config.show_speed_in_timecode) {
			label.innerText = "";
		} else {
			label.innerText = " (" + String(speed) + "x)";
		}

		// show speed up animation and current speed toast
		const bezel_text = player.querySelector(".ytp-bezel-text");
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
			}, config.hud_time)
		}
		return true;
	}

	window.addEventListener("keydown", e => {
		if (!e.shiftKey) return;
		if (e.key === config.speed_down_key) {
			if (setSpeed(-config.speed_key_increment, true, true)) e.stopImmediatePropagation();
		} else if (e.key === config.speed_up_key) {
			if (setSpeed(config.speed_key_increment, true, true)) e.stopImmediatePropagation();
		} else if (e.key === config.speed_reset_key) {
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
		if (setSpeed(speed, false, false)) {
			console.log(item);
			for (const v of item.parentElement.children) {
				v.removeAttribute("aria-checked")
			}
			item.setAttribute("aria-checked", "true");
			document.querySelector("#ytd-player .ytp-panel-title").click();
		}
	}, { capture: true });

	const observer = new MutationObserver(mutationsList => {
		for(const mutation of mutationsList) {
			if (mutation.target.matches(".ytp-settings-menu")) {
				const node = mutation.addedNodes[0]
				if (!node) return;
				// assuming this is the "Custom" button if it exists, meaning this is the speed control menu
				if (!node.querySelector(".ytp-panel-options")) return;
				const menu = node.querySelector(".ytp-panel-menu");
				console.log(menu);
				const speed_buttons = config.selectable_speeds.map(v => {
					const item = document.createElement("div");
					item.setAttribute("class", "ytp-menuitem");
					item.setAttribute("tabindex", "0");
					item.setAttribute("role", "menuitemradio");
					if (speed == v) item.setAttribute("aria-checked", "true");

					const label = document.createElement("div");
					label.setAttribute("class", "ytp-menuitem-label");
					label.innerText = v;

					item.appendChild(label);
					return item;
				});
				menu.replaceChildren(...speed_buttons);
			}
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });
})();
