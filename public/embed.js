/**
 * Optional helper for host pages embedding Career Job Widgets iframes.
 * Include once on the parent page, then add data-cjw-embed to each iframe.
 *
 * <script src="https://careermedia.github.io/CareerJobWidgets/embed.js" defer></script>
 */
(function () {
  function resizeIframe(iframe, height) {
    if (!iframe || !height) return;
    var next = Math.max(240, Math.ceil(height));
    iframe.style.height = next + "px";
    iframe.setAttribute("height", String(next));
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.type !== "cjw-embed-height") return;
    var frames = document.querySelectorAll("iframe[data-cjw-embed]");
    for (var i = 0; i < frames.length; i++) {
      var frame = frames[i];
      if (frame.contentWindow === event.source) {
        resizeIframe(frame, data.height);
      }
    }
  });

  function init() {
    var frames = document.querySelectorAll("iframe[data-cjw-embed]");
    for (var i = 0; i < frames.length; i++) {
      frames[i].style.overflow = "hidden";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
