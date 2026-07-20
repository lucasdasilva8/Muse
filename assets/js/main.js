(function () {
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

  document.querySelectorAll("[data-waitlist]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const role = form.getAttribute("data-waitlist") || "fan";
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const note = (data.get("note") || "").toString().trim();

      if (!email) return;

      const subject = encodeURIComponent(`Muse waitlist — ${role}`);
      const body = encodeURIComponent(
        `Role: ${role}\nName: ${name}\nEmail: ${email}\nNote: ${note}\n`
      );

      // Opens the visitor's mail client — replace with Formspree/Google Form later
      window.location.href = `mailto:muse.waitlist@example.com?subject=${subject}&body=${body}`;

      const success = form.querySelector(".form-success");
      if (success) success.classList.add("is-shown");
      form.reset();
    });
  });
})();
