/* ===================================================================
   TORTOPANI — Home page interactions
   =================================================================== */
(function () {
  "use strict";

  /* ---- Sticky nav shadow on scroll ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-scrolled", y > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");
  var enhancedNav = navLinks && navLinks.getAttribute("data-nav-controller") === "enhanced";
  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove("is-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger && navLinks && !enhancedNav) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---- Smooth-scroll for same-page anchors (respects sticky nav) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var hash = id.slice(1);
      var target = document.querySelector("main #" + CSS.escape(hash));
      if (!target) target = document.querySelector("section#" + CSS.escape(hash));
      if (!target || target.closest(".icon-sprite")) return;
      e.preventDefault();
      closeMenu();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---- Intent-aware lead modal ----
     This site has no checkout. CTA language therefore describes the real next
     step: a manager-assisted order, waitlist, mentorship application, or
     consultation. data-intent on the trigger is the source of truth. */
  var modal = document.getElementById("modal");
  var dialog = modal && modal.querySelector('[role="dialog"]');
  var form = document.getElementById("leadForm");
  var success = document.getElementById("formSuccess");
  var formError = document.getElementById("formError");
  var productField = document.getElementById("leadProduct");
  var productNote = document.getElementById("modalProduct");
  var modalTitle = document.getElementById("modalTitle");
  var modalLead = modal && modal.querySelector(".modal__lead");
  var submit = form && form.querySelector('[type="submit"]');
  var successTitle = success && success.querySelector("h3");
  var successText = success && success.querySelector("p");
  var successIcon = success && success.querySelector(".form__success-ico");
  var successTelegram = success && success.querySelector('a[href*="t.me"], a[href*="telegram"]');
  var telegramFallback = form && form.querySelector("[data-telegram-fallback], .form__telegram-fallback");
  var lastFocused = null;
  var inertSiblings = [];
  var previousBodyOverflow = "";
  var currentIntent = "consultation";
  var currentProduct = "";
  var currentPayUrl = "";
  var currentPurchasePixelEvent = null;
  var submissionPending = false;
  var submissionSucceeded = false;

  var INTENT_COPY = {
    "assisted-order": {
      title: "Оформлення замовлення",
      lead: "Залиш контакти — надішлемо посилання на оплату і відкриємо доступ одразу після неї.",
      submit: "Перейти до оплати",
      loading: "Оформлюємо замовлення…",
      product: "",
      successTitle: "Замовлення прийнято",
      success: "Дякуємо! Зараз відкриємо сторінку оплати в новій вкладці. Доступ відкриється одразу після оплати."
    },
    waitlist: {
      title: "Дізнайся про старт першою",
      lead: "Залиш контакти — ми напишемо в Telegram, коли відкриється набір на курс.",
      submit: "Приєднатися до списку",
      loading: "Додаємо до списку…",
      product: "Цікавить:",
      successTitle: "Ти у списку очікування",
      success: "Ми напишемо в Telegram, коли оголосимо старт. Оплату зараз робити не потрібно."
    },
    mentorship: {
      title: "Заявка на наставництво",
      lead: "Залиш контакти — Лілія або менеджер напише в Telegram, щоб уточнити цілі, формат і наявність місць.",
      submit: "Подати заявку",
      loading: "Надсилаємо заявку…",
      product: "",
      successTitle: "Дякуємо за заявку!",
      success: "Ми отримали твою заявку на наставництво. Напишемо в Telegram, щоб обговорити цілі та наступний крок."
    },
    consultation: {
      title: "Отримати консультацію",
      lead: "Залиш контакти — менеджер напише в Telegram і допоможе обрати курс або формат.",
      submit: "Отримати консультацію",
      loading: "Надсилаємо запит…",
      product: "Запит:",
      successTitle: "Запит отримано",
      success: "Менеджер напише тобі в Telegram, щоб допомогти з вибором і наступним кроком."
    },
    error: "Не вдалося надіслати запит. Дані залишилися у формі — спробуй ще раз або напиши нам у Telegram.",
    empty: "Заповни всі поля — імʼя та Telegram.",
    telegram: "Написати напряму в Telegram"
  };

  function normalizeIntent(value) {
    return value === "assisted-order" || value === "waitlist" || value === "mentorship"
      ? value
      : "consultation";
  }

  function activeCopy() {
    return { language: INTENT_COPY, intent: INTENT_COPY[currentIntent] };
  }

  function setProduct(name) {
    currentProduct = name || "";
    if (productField) productField.value = currentProduct;
  }

  /* A product with a live checkout page carries its URL on the trigger itself,
     in data-pay. Keyed off the attribute rather than the product name, so
     rewording a card never silently detaches it from its checkout. Everything
     without one stays manager-assisted: the lead is recorded and a manager
     sends the link on Telegram. */
  function setPayUrl(url) {
    currentPayUrl = /^https:\/\//.test(url || "") ? url : "";
  }

  function ensureTelegramFallback() {
    if (telegramFallback || !form || !formError || !successTelegram) return;
    telegramFallback = document.createElement("a");
    telegramFallback.className = "form__telegram-fallback";
    telegramFallback.href = successTelegram.href;
    telegramFallback.target = successTelegram.target || "_blank";
    telegramFallback.rel = successTelegram.rel || "noopener";
    telegramFallback.hidden = true;
    formError.insertAdjacentElement("afterend", telegramFallback);
  }

  function setSuccessChrome(isSuccess) {
    /* Confirmation keeps title + thank-you copy only — hide the form lead,
       check mark and Telegram CTA that belong to the fill-out step. */
    if (modalLead) modalLead.hidden = !!isSuccess;
    if (successIcon) successIcon.hidden = !!isSuccess;
    if (successTelegram) successTelegram.hidden = !!isSuccess;
  }

  function applyIntentCopy() {
    var copy = activeCopy();
    if (modalTitle) modalTitle.textContent = copy.intent.title;
    if (modalLead) modalLead.textContent = copy.intent.lead;
    if (submit) submit.textContent = submissionPending ? copy.intent.loading : copy.intent.submit;
    if (formError) formError.textContent = copy.language.error;
    if (successTitle) successTitle.textContent = copy.intent.successTitle;
    if (successText) successText.textContent = copy.intent.success;
    if (successTelegram) successTelegram.textContent = copy.language.telegram;
    if (telegramFallback) telegramFallback.textContent = copy.language.telegram;
    if (productNote) {
      // An intent may ship no label at all — the order modal names the product
      // on its own line, where a "Запит:" style prefix only repeats the title.
      var productLabel = copy.intent.product;
      productNote.textContent = currentProduct
        ? (productLabel ? productLabel + " " + currentProduct : currentProduct)
        : "";
      productNote.hidden = !currentProduct;
    }
  }

  function setBackgroundInert() {
    inertSiblings = [];
    Array.prototype.forEach.call(document.body.children, function (element) {
      if (element === modal || element.contains(modal)) return;
      inertSiblings.push({ element: element, hadInert: element.hasAttribute("inert") });
      element.setAttribute("inert", "");
    });
  }

  function restoreBackground() {
    inertSiblings.forEach(function (state) {
      if (!state.hadInert) state.element.removeAttribute("inert");
    });
    inertSiblings = [];
  }

  function visibleFocusableElements() {
    if (!dialog) return [];
    var selector = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])',
      '[contenteditable="true"]', '[tabindex]:not([tabindex="-1"])'
    ].join(",");
    return Array.prototype.filter.call(dialog.querySelectorAll(selector), function (element) {
      var style = window.getComputedStyle(element);
      return !element.hidden && element.getAttribute("aria-hidden") !== "true" &&
        style.visibility !== "hidden" && style.display !== "none" && element.getClientRects().length > 0;
    });
  }

  function prepareModal() {
    ensureTelegramFallback();
    if (submissionSucceeded && form) {
      form.reset();
      submissionSucceeded = false;
    }
    if (form) {
      form.hidden = false;
      clearFieldErrors();
      form.setAttribute("aria-busy", submissionPending ? "true" : "false");
    }
    if (success) success.hidden = true;
    if (formError) formError.hidden = true;
    if (telegramFallback) telegramFallback.hidden = true;
    if (submit) submit.disabled = submissionPending;
    setSuccessChrome(false);
  }

  function pixelEventData(trigger, eventAttribute) {
    if (!trigger) return null;
    var eventName = trigger.getAttribute(eventAttribute || "data-pixel-event");
    var pixelIds = String(trigger.getAttribute("data-pixel-ids") || "")
      .split(/[\s,]+/)
      .filter(Boolean);
    if (!eventName || !pixelIds.length) return null;

    var params = {};
    var contentName = trigger.getAttribute("data-pixel-content-name");
    var value = trigger.getAttribute("data-pixel-value");
    var currency = trigger.getAttribute("data-pixel-currency");
    if (contentName) params.content_name = contentName;
    if (value) params.value = Number(value);
    if (currency) params.currency = currency;
    return { eventName: eventName, pixelIds: pixelIds, params: params };
  }

  function trackPixelEventData(eventData) {
    if (!eventData || typeof window.fbq !== "function") return;
    eventData.pixelIds.forEach(function (pixelId) {
      window.fbq("trackSingle", pixelId, eventData.eventName, eventData.params);
    });
  }

  function trackPixelEvent(trigger) {
    trackPixelEventData(pixelEventData(trigger));
  }

  function openModal(trigger) {
    if (!modal) return;
    if (modal.classList.contains("is-open")) return;
    lastFocused = trigger || document.activeElement;
    if (!submissionPending) {
      currentIntent = normalizeIntent(trigger && trigger.getAttribute("data-intent"));
      prepareModal();
      setProduct(trigger && trigger.getAttribute("data-product"));
      setPayUrl(trigger && trigger.getAttribute("data-pay"));
      currentPurchasePixelEvent = pixelEventData(trigger, "data-pixel-purchase-event");
    } else {
      prepareModal();
    }
    applyIntentCopy();
    trackPixelEvent(trigger);
    previousBodyOverflow = document.body.style.overflow;
    setBackgroundInert();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(function () {
      var first = visibleFocusableElements()[0];
      if (first) first.focus({ preventScroll: true });
      else if (dialog) {
        dialog.setAttribute("tabindex", "-1");
        dialog.focus({ preventScroll: true });
      }
    });
  }

  function closeModal(event) {
    if (event) event.preventDefault();
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    restoreBackground();
    if (lastFocused && lastFocused.isConnected && lastFocused.focus) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  /* A product with a live checkout goes straight there. Access is the Google
     Drive link the payment provider sends afterwards, so asking for a name and
     Telegram first only added a step between wanting the card and paying for
     it. Anything without a checkout still opens the modal, because that lead is
     the only way a manager learns someone wants it. */
  document.querySelectorAll("[data-modal-open]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault(); /* href="#" must not jump the page to top */
      var pay = button.getAttribute("data-pay");
      if (/^https:\/\//.test(pay || "")) {
        trackPixelEvent(button);
        trackPixelEventData(pixelEventData(button, "data-pixel-purchase-event"));
        window.location.href = pay;
        return;
      }
      openModal(button);
    });
  });
  document.querySelectorAll("[data-modal-close]").forEach(function (button) {
    button.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (event) {
    if (!modal || !modal.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    var focusable = visibleFocusableElements();
    if (!focusable.length) {
      event.preventDefault();
      if (dialog) dialog.focus();
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var active = document.activeElement;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---- Lead form ----
     Posts to /api/lead → Google Sheets (source = product title) and optional
     Telegram. Empty fields get an inline error before the request is sent. */
  function leadFields() {
    return {
      name: form.querySelector('[name="name"]'),
      contact: form.querySelector('[name="contact"]')
    };
  }

  function clearFieldErrors() {
    form.querySelectorAll(".field.is-invalid").forEach(function (field) {
      field.classList.remove("is-invalid");
      var input = field.querySelector("input");
      if (input) input.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".field__error").forEach(function (el) { el.remove(); });
  }

  function markFieldInvalid(input, message) {
    if (!input) return;
    var field = input.closest(".field") || input.parentElement;
    if (!field) return;
    field.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    var tip = document.createElement("span");
    tip.className = "field__error";
    tip.textContent = message;
    field.appendChild(tip);
  }

  function validateLeadForm() {
    clearFieldErrors();
    var fields = leadFields();
    var copy = activeCopy().language;
    var nameOk = fields.name && String(fields.name.value || "").trim();
    var contactOk = fields.contact && String(fields.contact.value || "").trim();
    if (nameOk && contactOk) {
      if (formError) formError.hidden = true;
      return true;
    }
    var emptyMsg = copy.empty || "Заповни всі поля.";
    if (!nameOk) markFieldInvalid(fields.name, emptyMsg);
    if (!contactOk) markFieldInvalid(fields.contact, emptyMsg);
    if (formError) {
      formError.textContent = emptyMsg;
      formError.hidden = false;
    }
    var firstBad = !nameOk ? fields.name : fields.contact;
    if (firstBad && firstBad.focus) firstBad.focus({ preventScroll: true });
    return false;
  }

  if (form) {
    ensureTelegramFallback();
    form.querySelectorAll('[name="name"], [name="contact"]').forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) {
          field.classList.remove("is-invalid");
          var tip = field.querySelector(".field__error");
          if (tip) tip.remove();
        }
        input.removeAttribute("aria-invalid");
        var fields = leadFields();
        var bothFilled = fields.name && String(fields.name.value || "").trim()
          && fields.contact && String(fields.contact.value || "").trim();
        if (bothFilled && formError && formError.textContent === activeCopy().language.empty) {
          formError.hidden = true;
        }
      });
    });
    function showLeadSuccess() {
      submissionSucceeded = true;
      if (formError) formError.hidden = true;
      if (telegramFallback) telegramFallback.hidden = true;
      form.hidden = true;
      if (success) {
        success.hidden = false;
        setSuccessChrome(true);
        applyIntentCopy();
        if (successTitle && modal && modal.classList.contains("is-open")) {
          successTitle.setAttribute("tabindex", "-1");
          successTitle.focus({ preventScroll: true });
        }
      }
    }

    function openCheckoutSoon() {
      if (!currentPayUrl) return;
      var url = currentPayUrl;
      /* Let the success chrome paint before the new tab steals focus. */
      window.setTimeout(function () {
        trackPixelEventData(currentPurchasePixelEvent);
        var payWindow = window.open(url, "_blank");
        if (payWindow) {
          payWindow.opener = null;
        } else {
          window.location.href = url;
        }
      }, 450);
    }

    function finishSubmissionUi() {
      submissionPending = false;
      form.setAttribute("aria-busy", "false");
      if (submit) submit.disabled = false;
      applyIntentCopy();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submissionPending) return;
      if (!validateLeadForm()) return;

      /* Keep the hidden product field and the sheet `source` column in sync
         with the product line shown at the top of the modal. */
      if (productField) productField.value = currentProduct || productField.value || "";
      var payload = {};
      new FormData(form).forEach(function (value, key) { payload[key] = String(value || "").trim(); });
      payload.product = currentProduct || payload.product || "";
      payload.source = payload.product;
      payload.page = location.pathname;

      submissionPending = true;
      submissionSucceeded = false;
      form.setAttribute("aria-busy", "true");
      if (formError) formError.hidden = true;
      if (telegramFallback) telegramFallback.hidden = true;
      if (submit) submit.disabled = true;
      applyIntentCopy();

      var hasCheckout = Boolean(currentPayUrl);

      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          /* Pay products: Sheets/Telegram failures must not block checkout or
             show a red error next to an opening WayForPay tab. */
          if (response.ok || hasCheckout) {
            showLeadSuccess();
            openCheckoutSoon();
            return;
          }
          throw new Error("HTTP " + response.status);
        })
        .catch(function () {
          if (submissionSucceeded) return;
          if (hasCheckout) {
            showLeadSuccess();
            openCheckoutSoon();
            return;
          }
          if (formError) {
            formError.textContent = activeCopy().language.error;
            formError.hidden = false;
          }
          if (telegramFallback) telegramFallback.hidden = false;
        })
        .then(function () {
          finishSubmissionUi();
        });
    });
  }

  /* ---- Motion preference: decorative autoplay must not override the OS ---- */
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion && reducedMotion.matches) {
    document.querySelectorAll("video[autoplay]").forEach(function (video) {
      video.pause();
      video.removeAttribute("autoplay");
      /* The films carry no control bar, since they play themselves. Stop one
         and it becomes a still with no way in, so hand the controls back. */
      video.controls = true;
    });
  }

  /* ---- Discount countdown ----
     The bonus copy promises "until the timer runs out", so the page has to
     show one. It runs on a fixed cycle — data-countdown hours — and the time
     left is derived from the clock rather than stored, so it never has to be
     reset, never sits at 00:00:00, and every visitor looking at the same
     moment sees the same number.

     The cycle is anchored to Kyiv's wall clock, so a 12-hour timer turns over
     at 00:00 and 12:00 in Kyiv. Date.now() % period anchors to the epoch
     instead, which puts the boundary at midnight UTC — two hours early in
     winter, three in summer. Reading the wall clock through Intl also means
     the seasonal shift needs no special case: it moves the boundary with it,
     which is what "resets at midnight" is understood to mean. */
  var kyivClock = null;
  try {
    kyivClock = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Kyiv", hourCycle: "h23",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  } catch (e) {
    /* No tz database in this engine: the visitor's own midnight is closer to
       the promise than the epoch's. */
  }

  function secondsIntoCycle(periodHours) {
    var h, m, s;
    if (kyivClock) {
      var parts = {};
      kyivClock.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      h = parseInt(parts.hour, 10) % 24;
      m = parseInt(parts.minute, 10);
      s = parseInt(parts.second, 10);
    } else {
      var now = new Date();
      h = now.getHours(); m = now.getMinutes(); s = now.getSeconds();
    }
    return (h % periodHours) * 3600 + m * 60 + s;
  }

  /* Both strips below pad to two digits and write only what moved — the largest
     slot changes once in thousands of ticks, so blind writes would be churn. */
  function paintSlots(slots, values) {
    values.forEach(function (n, i) {
      var text = n < 10 ? "0" + n : String(n);
      if (slots[i].textContent !== text) slots[i].textContent = text;
    });
  }

  function slotsOf(root, names) {
    var found = names.map(function (n) { return root.querySelector('[data-count="' + n + '"]'); });
    return found.indexOf(null) === -1 ? found : null;
  }

  document.querySelectorAll("[data-countdown]").forEach(function (root) {
    var slots = slotsOf(root, ["h", "m", "s"]);
    if (!slots) return;

    var periodHours = parseInt(root.getAttribute("data-countdown"), 10) || 12;

    function tick() {
      /* At the boundary this reads the full period rather than zero, so the
         strip rolls over instead of resting on 00:00:00. */
      var left = periodHours * 3600 - secondsIntoCycle(periodHours);
      paintSlots(slots, [Math.floor(left / 3600), Math.floor(left / 60) % 60, left % 60]);
    }

    setInterval(tick, 1000);
    tick();
  });

  /* ---- Deadline countdown ----
     The rolling cycle above is evergreen: it never ends, so it can only back a
     promise like "until the timer runs out". A dated offer needs the opposite —
     one fixed instant everyone counts down to, given in data-deadline as an ISO
     string WITH its offset, so the moment is absolute and the visitor's own time
     zone cannot shift it. Days/hours/minutes rather than h/m/s: over weeks a
     seconds digit is noise, and an hours slot would climb into the hundreds.
     Past the deadline the strip clamps to zero instead of counting up. */
  document.querySelectorAll("[data-deadline]").forEach(function (root) {
    var slots = slotsOf(root, ["d", "h", "m"]);
    if (!slots) return;

    var endsAt = Date.parse(root.getAttribute("data-deadline"));
    if (isNaN(endsAt)) return;

    function tick() {
      var left = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      paintSlots(slots, [
        Math.floor(left / 86400), Math.floor(left / 3600) % 24, Math.floor(left / 60) % 60
      ]);
    }

    /* Minute resolution, so a per-second interval would burn 59 wasted wakeups. */
    setInterval(tick, 1000 * 15);
    tick();
  });

  /* ---- Green hub gallery rail ----
     Overflow scroll for hand control (touch / trackpad / wheel / drag).
     Track is duplicated in HTML; we wrap at half scrollWidth for a seamless
     loop. Gentle auto-scroll runs only when the user is idle and motion is OK. */
  function initGhRail(rail, track) {
    /* The loop needs the set twice so the wrap has somewhere to land. The food
       reel spells both copies out in HTML; a rail can instead ask for the copy
       here, which keeps long sets out of the markup and stops the two halves
       drifting apart when one is edited. Clones are aria-hidden so a screen
       reader hears each item once. */
    if (track.hasAttribute("data-rail-clone")) {
      Array.prototype.slice.call(track.children).forEach(function (node) {
        var copy = node.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        track.appendChild(copy);
      });
    }

    var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var reducedMotion = motionMq.matches;
    var idleMs = 2400;
    var pxPerSec = 32;
    var interacting = false;
    var dragging = false;
    var pointerId = null;
    var lastPointerX = 0;
    var resumeTimer = null;
    var lastTs = 0;
    var inView = true;
    var suppressClick = false;

    track.querySelectorAll("img").forEach(function (img) {
      img.setAttribute("draggable", "false");
    });

    function halfWidth() {
      return track.scrollWidth / 2;
    }

    /* Keep scrollLeft inside the first copy; the second copy is only for
       seamless wrapping. Thresholds avoid a 0 ↔ half ping-pong. */
    function wrapScroll() {
      var half = halfWidth();
      if (half <= 1) return;
      if (rail.scrollLeft >= half) {
        rail.scrollLeft -= half;
      }
    }

    function scrollByX(dx) {
      if (!dx) return;
      var half = halfWidth();
      if (half > 1 && dx < 0 && rail.scrollLeft <= 0) {
        rail.scrollLeft += half;
      }
      rail.scrollLeft += dx;
      wrapScroll();
    }

    function pauseAuto() {
      interacting = true;
      lastTs = 0;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () {
        interacting = false;
        lastTs = 0;
      }, idleMs);
    }

    function onMotionChange() {
      reducedMotion = motionMq.matches;
      lastTs = 0;
      if (reducedMotion) rail.classList.remove("is-dragging");
    }
    if (typeof motionMq.addEventListener === "function") {
      motionMq.addEventListener("change", onMotionChange);
    } else if (typeof motionMq.addListener === "function") {
      motionMq.addListener(onMotionChange);
    }

    rail.addEventListener(
      "wheel",
      function (e) {
        var absX = Math.abs(e.deltaX);
        var absY = Math.abs(e.deltaY);
        if (absX < 0.5 && absY < 0.5) return;
        /* Only claim primarily-horizontal gestures; vertical must scroll the page. */
        if (absX <= absY) return;
        e.preventDefault();
        scrollByX(e.deltaX);
        pauseAuto();
      },
      { passive: false }
    );

    rail.addEventListener(
      "touchstart",
      function () {
        pauseAuto();
      },
      { passive: true }
    );

    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") {
        pauseAuto();
        return;
      }
      if (e.button !== 0) return;
      dragging = true;
      suppressClick = false;
      pointerId = e.pointerId;
      lastPointerX = e.clientX;
      rail.classList.add("is-dragging");
      try {
        rail.setPointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
      pauseAuto();
    });

    rail.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== pointerId) return;
      var dx = e.clientX - lastPointerX;
      if (dx === 0) return;
      if (Math.abs(dx) > 2) suppressClick = true;
      lastPointerX = e.clientX;
      scrollByX(-dx);
      pauseAuto();
    });

    function endDrag(e) {
      if (!dragging || (e && e.pointerId !== pointerId)) return;
      dragging = false;
      pointerId = null;
      rail.classList.remove("is-dragging");
      pauseAuto();
    }
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("lostpointercapture", endDrag);

    rail.addEventListener(
      "click",
      function (e) {
        if (!suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      },
      true
    );

    rail.addEventListener(
      "scroll",
      function () {
        wrapScroll();
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", function () {
      lastTs = 0;
    });

    if ("IntersectionObserver" in window) {
      var railIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            inView = en.isIntersecting;
            if (!inView) lastTs = 0;
          });
        },
        { rootMargin: "80px 0px", threshold: 0 }
      );
      railIo.observe(rail);
    }

    function tick(ts) {
      requestAnimationFrame(tick);
      if (reducedMotion || interacting || dragging || document.hidden || !inView) {
        lastTs = 0;
        return;
      }
      if (!lastTs) {
        lastTs = ts;
        return;
      }
      var dt = Math.min(48, ts - lastTs) / 1000;
      lastTs = ts;
      scrollByX(pxPerSec * dt);
    }
    requestAnimationFrame(tick);
  }

  /* Every rail on the page, each with its own state — the reviews wall runs the
     same loop as the food reel, so it is one mechanism rather than two. */
  document.querySelectorAll(".gh-rail").forEach(function (rail) {
    var track = rail.querySelector(".gh-rail__track");
    if (track) initGhRail(rail, track);
  });

  /* ---- Techcard catalog category pills (techcards.html only) ---- */
  var pillBar = document.querySelector("[data-tc-pills]");
  if (pillBar) {
    var catalogGrid = document.querySelector("[data-tc-grid]");
    var filterPills = pillBar.querySelectorAll("[data-filter]");
    var catalogCards = catalogGrid
      ? catalogGrid.querySelectorAll("[data-category]")
      : [];

    function selectedCatalogFilters() {
      var active = {};
      filterPills.forEach(function (pill) {
        if (pill.getAttribute("aria-pressed") === "true") {
          active[pill.getAttribute("data-filter")] = true;
        }
      });
      return active;
    }

    function applyCatalogFilter() {
      var active = selectedCatalogFilters();
      var showAll = true;
      var key;
      for (key in active) {
        if (Object.prototype.hasOwnProperty.call(active, key)) {
          showAll = false;
          break;
        }
      }
      catalogCards.forEach(function (card) {
        var match = showAll || active[card.getAttribute("data-category")];
        card.hidden = !match;
        if (match) card.classList.add("is-in");
      });
    }

    filterPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var pressed = pill.getAttribute("aria-pressed") === "true";
        pill.setAttribute("aria-pressed", pressed ? "false" : "true");
        applyCatalogFilter();
      });
    });
  }

  /* ---- Reveal on scroll ---- */
  /* [data-reveal] lets a page opt in declaratively instead of extending
     this selector every time a new section component appears. */
  var revealEls = document.querySelectorAll(
    ".course-card, .feature, .review, .stat, .about__copy, .about__media, .section__head, [data-reveal]"
  );
  revealEls.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- Active nav link (scroll spy) — grounds "where am I" in the nav ---- */
  if (navLinks && "IntersectionObserver" in window) {
    var spyMap = {};
    var spySections = [];
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec) { spyMap[sec.id] = a; spySections.push(sec); }
    });
    if (spySections.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            navLinks.querySelectorAll("a.is-active").forEach(function (a) { a.classList.remove("is-active"); });
            if (spyMap[en.target.id]) spyMap[en.target.id].classList.add("is-active");
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      spySections.forEach(function (s) { spy.observe(s); });
    }
  }
})();

/* ---------- Techcard rail (phone only) ----------
   Two columns on a phone stacked the flavours into rows, so the row looked like
   the whole catalogue and the "see all" button read as decoration. The grid
   becomes one snap-scrolling row, and the button moves down beside the arrows so
   it sits on the cards it belongs to. Desktop keeps the plain grid. */
(function () {
  "use strict";

  var phone = window.matchMedia("(max-width: 700px)");
  var rails = [];

  document.querySelectorAll(".gh-tc__grid").forEach(function (grid) {
    var section = grid.closest(".gh-tc");
    if (!section) return;

    var rail = document.createElement("div");
    rail.className = "gh-tc__rail";

    var arrows = document.createElement("div");
    arrows.className = "gh-tc__arrows";

    var cta = section.querySelector(".gh-tc__cta");
    var ctaHome = cta ? { parent: cta.parentNode, next: cta.nextSibling } : null;

    var buttons = ["prev", "next"].map(function (dir) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gh-tc__arrow";
      b.dataset.dir = dir;
      b.setAttribute("aria-label", dir === "prev" ? "Попередні техкарти" : "Наступні техкарти");
      b.textContent = dir === "prev" ? "‹" : "›";
      b.addEventListener("click", function () {
        var card = grid.firstElementChild;
        /* Step one whole card, gap included, so the scroller lands on a snap
           point instead of drifting a few pixels off it with every press. */
        var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
        var step = card ? card.getBoundingClientRect().width + gap : grid.clientWidth * 0.7;
        grid.scrollBy({ left: dir === "prev" ? -step : step, behavior: "smooth" });
      });
      arrows.appendChild(b);
      return b;
    });

    rail.appendChild(arrows);
    grid.parentNode.insertBefore(rail, grid);

    /* The trailing spacer makes scrollWidth overshoot the last snap point, so
       "at the end" is when the last card is fully in view, not when the
       scrollbar bottoms out. */
    function syncArrows() {
      var last = grid.lastElementChild;
      buttons[0].disabled = grid.scrollLeft <= 4;
      buttons[1].disabled = !last ||
        last.getBoundingClientRect().right <= grid.getBoundingClientRect().right + 4;
    }

    /* The button lives in the section head on desktop and in the rail on a
       phone; keep a handle on where it came from so the trip back is exact. */
    function place() {
      if (!cta || !ctaHome) return;
      if (phone.matches) {
        if (cta.parentNode !== rail) rail.insertBefore(cta, arrows);
      } else if (cta.parentNode !== ctaHome.parent) {
        ctaHome.parent.insertBefore(cta, ctaHome.next);
      }
    }

    grid.addEventListener("scroll", syncArrows, { passive: true });
    rails.push(function () { place(); syncArrows(); });
  });

  function refresh() { rails.forEach(function (fn) { fn(); }); }
  if (rails.length) {
    refresh();
    window.addEventListener("resize", refresh);
    if (phone.addEventListener) phone.addEventListener("change", refresh);
  }
})();
