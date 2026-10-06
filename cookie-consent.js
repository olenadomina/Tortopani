/* Cookie consent for the English pages (EU audience).
 *
 * The Meta Pixel sets the _fbp cookie and tracks visits, so under GDPR /
 * ePrivacy it may only load after an explicit "Accept". Until then
 * window.fbq does not exist and nothing is requested from Facebook.
 * The choice is kept in localStorage; [data-cookie-settings] buttons
 * (on privacy.html) reopen the banner so it can be changed.
 *
 * Usage: <script src="cookie-consent.js" data-pixel="<id>" defer></script>
 */
(function () {
  var KEY = "tp-cookie-consent";
  var script = document.currentScript;
  var pixelId = script && script.getAttribute("data-pixel");
  /* Each page set links its own policy (the green variant has privacy_gr). */
  var privacyHref = (script && script.getAttribute("data-privacy")) || "/privacy.html";

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode: ask again next visit */ }
  }

  function loadPixel() {
    if (!pixelId || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq("init", pixelId);
    fbq("trackSingle", pixelId, "PageView");
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
    if (window.fbq && pixelId) fbq("trackSingle", pixelId, event, params);
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
