/* Cookie consent for the English pages (EU audience).
 *
 * The Meta Pixel sets the _fbp cookie and tracks visits, so under GDPR /
 * ePrivacy it may only load after an explicit "Accept". Until then
 * window.fbq does not exist and nothing is requested from Facebook.
 * The choice is kept in localStorage; [data-cookie-settings] buttons
 * (on privacy.html) reopen the banner so it can be changed.
 *
 * Usage: <script src="cookie-consent.js" data-pixel="<id>" defer></script>
 * A page that also reports to a campaign's own pixel lists it, space-separated
 * if there are several, in data-pixel-extra — every event goes to all of them.
 */
(function () {
  var KEY = "tp-cookie-consent";
  var script = document.currentScript;
  var pixelIds = ["data-pixel", "data-pixel-extra"]
    .map(function (a) { return (script && script.getAttribute(a)) || ""; })
    .join(" ").split(/\s+/).filter(Boolean);
  /* Each page set links its own policy (the green variant has privacy_gr). */
  var privacyHref = (script && script.getAttribute("data-privacy")) || "/privacy.html";

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode: ask again next visit */ }
  }

  function loadPixel() {
    if (!pixelIds.length || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    pixelIds.forEach(function (id) { fbq("init", id); });
    pixelIds.forEach(function (id) { fbq("trackSingle", id, "PageView"); });
    /* Lets a page send its own event (the thank-you page's Purchase) the
       moment consent arrives, not only on the next visit. */
    document.dispatchEvent(new Event("tp-pixel-ready"));
  }

  var banner;
  function buildBanner() {
    banner = document.createElement("section");
    banner.id = "cookieBanner";
    banner.className = "cookie";
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML =
      '<p class="cookie__text">We use cookies to measure our ads. <a href="' + privacyHref + '#cookies">Learn more</a></p>' +
      '<div class="cookie__actions">' +
      '<button type="button" class="cookie__btn cookie__btn--ghost" data-consent="denied">Decline</button>' +
      '<button type="button" class="cookie__btn" data-consent="granted">Accept</button>' +
      "</div>";
    banner.addEventListener("click", function (e) {
      var choice = e.target.getAttribute && e.target.getAttribute("data-consent");
      if (!choice) return;
      var was = read();
      write(choice);
      hide();
      if (choice === "granted") loadPixel();
      /* Withdrawing consent: a reload is the only way to unload the pixel. */
      else if (was === "granted") location.reload();
    });
    document.body.appendChild(banner);
  }
  function show() {
    if (!banner) buildBanner();
    banner.hidden = false;
    document.documentElement.classList.add("has-cookie-banner");
  }
  function hide() {
    if (banner) banner.hidden = true;
    document.documentElement.classList.remove("has-cookie-banner");
  }

  /* Pages call this on a buy click; it is a no-op without consent. */
  window.tpTrack = function (event, params) {
    if (window.fbq) pixelIds.forEach(function (id) { fbq("trackSingle", id, event, params); });
  };

  function init() {
    var choice = read();
    if (choice === "granted") loadPixel();
    else if (choice !== "denied") show();
    document.querySelectorAll("[data-cookie-settings]").forEach(function (b) {
      b.addEventListener("click", show);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
