(function () {
  // Notifications + sheet owner
  const WAITLIST_EMAIL = "lucas_da_silva@brown.edu";

  /**
   * After Vercel deploy of product/, paste the public app URL here
   * (e.g. https://muse-xxxx.vercel.app). Leave empty to keep static prototype links.
   * See docs/DEPLOY_EXPERIMENTAL.md
   */
  const PRODUCT_APP_URL = "";

  /**
   * After you deploy docs/google-apps-script/MuseWaitlist.gs as a Web app,
   * paste the deployment URL here (ends with /exec).
   * Leave empty to fall back to mailto only.
   */
  const SHEETS_WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbw0fc8XOJOHHlAak1KTsZ12FBjzvqOUuhhBLvvrh389aQroiAedwEMHHgqAsaXLOg/exec";

  const RAISE = 8000;

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal, .process-step").forEach((el) => {
    observer.observe(el);
  });

  function openMailto(subject, body) {
    window.location.href =
      "mailto:" +
      WAITLIST_EMAIL +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  }

  /**
   * Send to Google Sheet via Apps Script when configured.
   * Uses no-cors so Google's redirect response does not block success UX.
   * Also opens mailto as a backup copy to lucas_da_silva@brown.edu when sheet URL is missing.
   */
  function submitInterest(payload, mailtoSubject, mailtoBody) {
    if (SHEETS_WEB_APP_URL) {
      return fetch(SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      }).then(function () {
        return { via: "sheet" };
      });
    }

    openMailto(mailtoSubject, mailtoBody);
    return Promise.resolve({ via: "mailto" });
  }

  function markSuccess(form, via) {
    const success = form.querySelector(".form-success");
    if (success) {
      if (via === "sheet") {
        success.textContent =
          "Thanks — your response was saved to the Muse interest sheet. A copy was also emailed to the team.";
      }
      success.classList.add("is-shown");
    }
    form.reset();
  }

  document.querySelectorAll("[data-waitlist]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const role = form.getAttribute("data-waitlist") || "fan";
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const note = (data.get("note") || "").toString().trim();

      if (!email) return;

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      const payload = {
        type: "waitlist",
        role: role,
        name: name,
        email: email,
        note: note,
        source: window.location.href,
      };

      submitInterest(
        payload,
        "Muse waitlist — " + role,
        "Role: " +
          role +
          "\nName: " +
          name +
          "\nEmail: " +
          email +
          "\nNote: " +
          note +
          "\n"
      )
        .then(function (result) {
          markSuccess(form, result.via);
        })
        .catch(function () {
          openMailto(
            "Muse waitlist — " + role,
            "Role: " +
              role +
              "\nName: " +
              name +
              "\nEmail: " +
              email +
              "\nNote: " +
              note +
              "\n"
          );
          markSuccess(form, "mailto");
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  });

  function formatMoney(n) {
    return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function updateInvestCalc(amount) {
    const calc = document.getElementById("invest-calc");
    const fracDisplay = document.getElementById("frac-display");
    const safe = Math.max(0, Number(amount) || 0);
    const pct = RAISE > 0 ? (safe / RAISE) * 100 : 0;
    const pctLabel = pct.toFixed(2) + "%";

    if (calc) {
      calc.innerHTML =
        "<strong>" +
        formatMoney(safe) +
        " → " +
        pctLabel +
        " of the fan pool</strong>" +
        "Your share of each payout period would be " +
        pctLabel +
        " of (15% × defined net). Max claim vs cap scales with your amount.";
    }

    if (fracDisplay) {
      fracDisplay.textContent = formatMoney(safe) + " / $8,000 = " + pctLabel;
    }
  }

  const amountInput = document.querySelector("[data-invest-amount]");
  if (amountInput) {
    updateInvestCalc(amountInput.value);
    amountInput.addEventListener("input", () => updateInvestCalc(amountInput.value));
  }

  document.querySelectorAll("[data-invest]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const artist = form.getAttribute("data-invest") || "artist";
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const amount = (data.get("amount") || "").toString().trim();

      if (!email || !amount) return;

      const pct = ((Number(amount) / RAISE) * 100).toFixed(2);
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      const mailtoBody = [
        "Type: investment interest (prototype — no payment)",
        "Artist: Mira Vale",
        "Listing: 15% streaming net · 36 months · 1.5× cap · $8,000 raise",
        "Amount: $" + amount,
        "Pool fraction: " + pct + "%",
        "Name: " + name,
        "Email: " + email,
        "",
        "Also add me to the Muse waitlist.",
        "",
      ].join("\n");

      const payload = {
        type: "invest_interest",
        role: "fan",
        name: name,
        email: email,
        note: "Invest interest in Mira Vale (prototype)",
        amount: amount,
        extra: "pool=" + pct + "%; artist=" + artist,
        source: window.location.href,
      };

      submitInterest(payload, "Muse invest interest — " + artist, mailtoBody)
        .then(function (result) {
          markSuccess(form, result.via);
        })
        .catch(function () {
          openMailto("Muse invest interest — " + artist, mailtoBody);
          markSuccess(form, "mailto");
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  });

  // Experimental product app links (set PRODUCT_APP_URL after Vercel deploy)
  document.querySelectorAll("[data-product-app]").forEach(function (el) {
    var path = el.getAttribute("data-product-app") || "/browse";
    if (PRODUCT_APP_URL) {
      el.setAttribute("href", PRODUCT_APP_URL.replace(/\/$/, "") + path);
      el.removeAttribute("data-product-fallback");
    } else if (el.getAttribute("data-product-fallback")) {
      el.setAttribute("href", el.getAttribute("data-product-fallback"));
    }
  });
})();
