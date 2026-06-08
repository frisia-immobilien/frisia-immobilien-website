(() => {
  const CONSENT_KEY = "frisia_cookie_consent_v1";
  const CONSENT_VERSION = "2026-03-08";
  const CONSENT_EVENT = "frisia:consent-updated";
  const GA_ID = "G-CWXHCEWKE5";
  const TTL_DAYS = 183;

  const addDays = (date, days) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  };

  const readConsent = () => {
    try {
      const raw = window.localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.choice) return null;
      const now = new Date();
      const expiresAt = typeof parsed.expiresAt === "string" ? parsed.expiresAt : addDays(now, TTL_DAYS).toISOString();
      if (Number.isNaN(Date.parse(expiresAt)) || new Date(expiresAt).getTime() <= Date.now()) {
        window.localStorage.removeItem(CONSENT_KEY);
        return null;
      }
      return {
        choice: parsed.choice,
        analytics: Boolean(parsed.analytics),
        necessary: true,
        consentVersion: typeof parsed.consentVersion === "string" ? parsed.consentVersion : CONSENT_VERSION,
        savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : now.toISOString(),
        expiresAt,
      };
    } catch {
      return null;
    }
  };

  const writeConsent = (choice, analytics) => {
    const now = new Date();
    const payload = {
      choice,
      analytics: Boolean(analytics),
      necessary: true,
      consentVersion: CONSENT_VERSION,
      savedAt: now.toISOString(),
      expiresAt: addDays(now, TTL_DAYS).toISOString(),
    };
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    } catch {}
  };

  const dispatchConsent = (analytics) => {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { analytics } }));
  };

  const consentMode = (analytics) => {
    const analyticsStorage = analytics ? "granted" : "denied";
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag("consent", "update", {
      analytics_storage: analyticsStorage,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
      personalization_storage: "denied",
      security_storage: "granted",
    });
  };

  const onIdle = (callback, timeout = 4500) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout });
      return;
    }
    window.setTimeout(callback, timeout);
  };

  const initHeaderScroll = () => {
    const header = document.querySelector("[data-site-header='true']");
    const mobileMenu = document.querySelector("[data-site-mobile-menu='true']");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;
    let hidden = false;

    const setHidden = (nextHidden) => {
      if (hidden === nextHidden) return;
      hidden = nextHidden;
      header.style.transform = nextHidden ? "translateY(-100%)" : "translateY(0)";
    };

    const update = () => {
      ticking = false;
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (
        window.scrollY <= 96 ||
        (mobileMenu && mobileMenu.open) ||
        (document.activeElement && header.contains(document.activeElement))
      ) {
        setHidden(false);
        lastY = currentY;
        return;
      }

      if (Math.abs(delta) < 6) return;
      setHidden(delta > 0);
      lastY = currentY;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    header.addEventListener("focusin", () => setHidden(false));
    if (mobileMenu) mobileMenu.addEventListener("toggle", () => setHidden(false));
  };

  const installTracking = () => {
    if (window.__frisiaTrackingInstalled) return;
    window.__frisiaTrackingInstalled = true;

    const hasAnalytics = () => Boolean(readConsent() && readConsent().analytics);
    const pagePayload = () => ({
      page_path: window.location.pathname,
      page_location: window.location.href,
    });
    const track = (event, payload = {}) => {
      if (!hasAnalytics()) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event, ...payload });
      if (typeof window.gtag === "function") window.gtag("event", event, payload);
    };

    document.addEventListener("click", (evt) => {
      const target = evt.target instanceof Element ? evt.target.closest("a, button, [role='button']") : null;
      if (!target) return;
      const href = target.getAttribute("href") || "";
      const text = (target.textContent || "").replace(/\s+/g, " ").trim();
      const label = target.dataset.trackLabel || "";
      const location = target.dataset.trackLocation || "";
      const haystack = `${text} ${label} ${href}`.toLowerCase();
      const payload = { ...pagePayload(), label, location, link_text: text.slice(0, 140), link_url: href };

      if (href.toLowerCase().startsWith("tel:")) {
        track("phone_click", { ...payload, phone_number: href.replace(/^tel:/i, "") });
        return;
      }

      if (
        haystack.includes("immobilie bewerten lassen") ||
        haystack.includes("immobilie_bewerten") ||
        haystack.includes("immobilienbewertung") ||
        haystack.includes("#bewertung") ||
        haystack.includes("#immobilienbewertung")
      ) {
        track("valuation_cta_click", { ...payload, cta_name: "Immobilie bewerten lassen" });
        return;
      }

      const tracked = evt.target instanceof Element ? evt.target.closest("[data-track]") : null;
      if (tracked && tracked.dataset.track) {
        track(tracked.dataset.track, {
          ...pagePayload(),
          label: tracked.dataset.trackLabel || "",
          location: tracked.dataset.trackLocation || "",
          href: tracked.getAttribute("href") || "",
        });
      }
    }, { passive: true });

    window.addEventListener("frisia:lead", (evt) => {
      const detail = evt.detail || {};
      const event = typeof detail.event === "string" ? detail.event : "lead_event";
      const payload = { ...detail };
      delete payload.event;
      track(event, payload);
    });
  };

  const loadAnalytics = () => {
    const consent = readConsent();
    if (!consent || !consent.analytics || window.__frisiaGaLoaded) return;
    window.__frisiaGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
      personalization_storage: "denied",
      security_storage: "granted",
    });
    window.gtag("set", "ads_data_redaction", true);
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
    window.gtag("event", "page_view", {
      page_path: window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    installTracking();
  };

  const closeCookieBar = () => {
    const node = document.querySelector("[data-frisia-cookie-bar]");
    if (node) node.remove();
  };

  const showCookieBar = (settingsOpen = false) => {
    closeCookieBar();
    const current = readConsent();
    let analytics = Boolean(current && current.analytics);
    const wrap = document.createElement("div");
    wrap.setAttribute("data-frisia-cookie-bar", "true");
    wrap.className = "fixed inset-x-0 bottom-0 z-[90] isolate pointer-events-auto border-t border-[color:var(--color-brass)]/20 bg-white/95 text-[color:var(--color-graphite)] shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Cookie-Einstellungen");

    const render = () => {
      const settingsMarkup = settingsOpen
        ? `
          <div class="mt-3 rounded-xl border border-[color:var(--color-brass)]/30 bg-white/90 px-4 py-3 backdrop-blur">
            <h2 class="mb-3 text-base font-semibold text-[color:var(--color-navy)]">Cookie-Einstellungen</h2>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between gap-3 text-sm">
                <span><span class="block font-semibold">Notwendige Cookies (immer aktiv)</span><span class="block text-xs text-[color:var(--color-graphite)]/85">Diese Cookies sind erforderlich, damit die Website technisch funktioniert.</span></span>
                <span aria-hidden="true" class="relative inline-flex h-12 w-14 items-center rounded-full bg-[color:var(--color-navy)]/85"><span class="ml-7 inline-block h-5 w-5 rounded-full bg-white shadow-sm"></span></span>
              </div>
              <div class="flex items-center justify-between gap-3 text-sm">
                <span><span class="block font-semibold">Analyse-Cookies (anonymisiert)</span><span class="block text-xs text-[color:var(--color-graphite)]/85">Diese Cookies helfen uns zu verstehen, wie Besucher die Website nutzen.</span></span>
                <button type="button" role="switch" aria-checked="${analytics}" aria-label="Analyse-Cookies umschalten" data-cookie-analytics class="relative inline-flex h-12 w-14 cursor-pointer items-center rounded-full transition-colors ${analytics ? "bg-[color:var(--color-navy)]" : "bg-slate-300"}"><span class="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${analytics ? "translate-x-8" : "translate-x-1.5"}"></span></button>
              </div>
              <div class="flex justify-end"><button type="button" data-cookie-save class="mt-2 inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-[#1B3040] px-4 py-2 text-sm font-semibold text-white">Einstellungen speichern</button></div>
            </div>
          </div>`
        : "";

      wrap.innerHTML = `
        <div class="relative mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="max-w-3xl text-[0.82rem] leading-[1.55]">
              <p>Diese Website verwendet Cookies, um die Funktion der Seite sicherzustellen und die Nutzung anonym zu analysieren.</p>
              <p class="mt-1">Sie können selbst entscheiden, welche Kategorien Sie zulassen möchten. Weitere Informationen finden Sie in unserer <a href="/recht/datenschutz" class="underline underline-offset-4">Datenschutzerklärung</a> und in den <a href="/recht/cookies" class="underline underline-offset-4">Cookie-Hinweisen</a>.</p>
              <p class="mt-1">Sie können Ihre Einwilligung jederzeit über „Cookie-Einstellungen ändern“ im Footer widerrufen oder anpassen.</p>
            </div>
            <div class="relative z-[1] flex flex-wrap items-center gap-2 md:justify-end">
              <button type="button" data-cookie-necessary class="pointer-events-auto inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-[#1B3040] px-4 py-2 text-sm font-semibold text-white">Nur notwendige Cookies</button>
              <button type="button" data-cookie-all class="pointer-events-auto inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-[color:var(--color-navy)] bg-white/90 px-4 py-2 text-sm font-semibold text-[color:var(--color-navy)]">Alle akzeptieren</button>
              <button type="button" data-cookie-settings class="pointer-events-auto inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-[color:var(--color-brass)]/30 bg-white/90 px-4 py-2 text-sm font-semibold text-[color:var(--color-graphite)]">Einstellungen</button>
            </div>
          </div>
          ${settingsMarkup}
        </div>`;
    };

    render();
    document.body.appendChild(wrap);

    wrap.addEventListener("click", (evt) => {
      const target = evt.target instanceof Element ? evt.target : null;
      if (!target) return;

      if (target.closest("[data-cookie-necessary]")) {
        writeConsent("necessary", false);
        consentMode(false);
        dispatchConsent(false);
        closeCookieBar();
      } else if (target.closest("[data-cookie-all]")) {
        writeConsent("all", true);
        consentMode(true);
        dispatchConsent(true);
        closeCookieBar();
        onIdle(loadAnalytics, 1200);
      } else if (target.closest("[data-cookie-settings]")) {
        settingsOpen = !settingsOpen;
        render();
      } else if (target.closest("[data-cookie-analytics]")) {
        analytics = !analytics;
        render();
      } else if (target.closest("[data-cookie-save]")) {
        writeConsent("custom", analytics);
        consentMode(analytics);
        dispatchConsent(analytics);
        closeCookieBar();
        if (analytics) onIdle(loadAnalytics, 1200);
      }
    });
  };

  const initCookieAndAnalytics = () => {
    const consent = readConsent();
    consentMode(Boolean(consent && consent.analytics));
    if (consent && consent.analytics) onIdle(loadAnalytics, 4500);

    document.addEventListener("click", (evt) => {
      const trigger = evt.target instanceof Element ? evt.target.closest("[data-cookie-settings-trigger]") : null;
      if (!trigger) return;
      evt.preventDefault();
      showCookieBar(true);
    });

    if (!consent) {
      onIdle(() => {
        const reveal = () => window.setTimeout(() => showCookieBar(false), 2500);
        window.addEventListener("pointerdown", reveal, { passive: true, once: true });
        window.addEventListener("keydown", reveal, { passive: true, once: true });
        window.addEventListener("touchstart", reveal, { passive: true, once: true });
      }, 3500);
    }
  };

  initHeaderScroll();
  initCookieAndAnalytics();
})();
