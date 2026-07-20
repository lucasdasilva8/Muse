(function () {
  const WAITLIST_EMAIL = "muse.waitlist@example.com";
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

  document.querySelectorAll("[data-waitlist]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const role = form.getAttribute("data-waitlist") || "fan";
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const note = (data.get("note") || "").toString().trim();

      if (!email) return;

      openMailto(
        `Muse waitlist — ${role}`,
        `Role: ${role}\nName: ${name}\nEmail: ${email}\nNote: ${note}\n`
      );

      const success = form.querySelector(".form-success");
      if (success) success.classList.add("is-shown");
      form.reset();
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

      openMailto(
        `Muse invest interest — ${artist}`,
        [
          "Type: investment interest (prototype — no payment)",
          "Artist: Mira Vale",
          "Listing: 15% streaming net · 36 months · 1.5× cap · $8,000 raise",
          `Amount: $${amount}`,
          `Pool fraction: ${pct}%`,
          `Name: ${name}`,
          `Email: ${email}`,
          "",
          "Also add me to the Muse waitlist.",
          "",
        ].join("\n")
      );

      const success = form.querySelector(".form-success");
      if (success) success.classList.add("is-shown");
    });
  });
})();
