/* ==================================
   RJL Group Website JavaScript
   Bright Glassmorphism Theme — FINAL FIXED
   =================================== */

const BACKEND_URL = window.location.origin;
const API_BASE = `${BACKEND_URL}/api`;

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------
     MOBILE NAVIGATION TOGGLE
  ------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });

    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
      });
    });
  }

  /* -------------------------------
     HEADER LINE & ACTIVE LINK
  ------------------------------- */
  const navLinks = document.querySelectorAll(".nav-link");
  let headerLine = document.querySelector(".header-line");

  // Buat header-line jika belum ada
  if (!headerLine && navMenu) {
    headerLine = document.createElement("div");
    headerLine.className = "header-line";
    headerLine.style.position = "absolute";
    headerLine.style.bottom = "6px";
    headerLine.style.height = "2px";
    headerLine.style.background = "var(--color-warm-brown)";
    headerLine.style.transition = "all 0.25s ease";
    headerLine.style.willChange = "transform, width";
    navMenu.style.position = "relative";
    navMenu.appendChild(headerLine);
  }

  function moveHeaderLine(link) {
    if (!headerLine || !link) return;
    const rect = link.getBoundingClientRect();
    const menuRect = link.parentElement.getBoundingClientRect();
    headerLine.style.width = `${rect.width}px`;
    headerLine.style.transform = `translateX(${rect.left - menuRect.left}px)`;
  }

  // Smooth scroll (untuk halaman 1-page)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      navLinks.forEach(l => l.classList.remove("active"));
      anchor.classList.add("active");
      moveHeaderLine(anchor);
    });
  });

  // Highlight active section saat scroll
  const sections = document.querySelectorAll("section[id]");
  if (sections.length > 0) {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY + 120;
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
        if (scrollY >= top && scrollY < bottom && link) {
          navLinks.forEach(l => l.classList.remove("active"));
          link.classList.add("active");
          moveHeaderLine(link);
        }
      });
    });
    } else {
    // Multi-page: aktifkan link berdasarkan nama file halaman
    window.addEventListener("DOMContentLoaded", () => {
      const currentFile = window.location.pathname.split("/").pop() || "index.html";
      let currentLink = [...navLinks].find(l => {
        const href = l.getAttribute("href") || "";
        return href.endsWith(currentFile) || l.href.includes(currentFile);
      });
      if (currentLink) {
        navLinks.forEach(l => l.classList.remove("active"));
        currentLink.classList.add("active");

        // Pindahkan garis setelah halaman benar-benar siap
        setTimeout(() => moveHeaderLine(currentLink), 150);
      }
    });
  }

  window.addEventListener("resize", () => {
    const activeNow = document.querySelector(".nav-link.active");
    if (activeNow) moveHeaderLine(activeNow);
  });

  /* -------------------------------
     SCROLL ANIMATIONS (fade / slide)
  ------------------------------- */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

  document.querySelectorAll(".slide-up").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    observer.observe(el);
  });

/* -------------------------------
   CONTACT FORM
------------------------------- */
const contactForm = document.getElementById("contactForm");
const contactMsg = document.getElementById("contactFormMessage");

if (contactForm) {
  contactForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(contactForm));
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;

    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
      // 💡 Simulasi delay 1 detik biar terasa realistis
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ✅ Anggap pesan terkirim sukses
      console.log("Contact form data:", formData);
      contactMsg.textContent = "✅ Thank you! We’ll get back soon.";
      contactMsg.className = "form-message success";
      contactForm.reset();
    } catch {
      contactMsg.textContent = "❌ Error sending message.";
      contactMsg.className = "form-message error";
    } finally {
      btn.textContent = original;
      btn.disabled = false;
      contactMsg.style.display = "block";
      setTimeout(() => (contactMsg.style.display = "none"), 4000);
    }
  });
}

/* -------------------------------
   REGISTRATION FORM (FIXED)
------------------------------- */
// 1. Pastikan ID ini sesuai dengan yang ada di tag <form id="..."> di HTML kamu
const regForm = document.getElementById("regForm");
const regMsg = document.getElementById("registrationFormMessage");

if (regForm) {
    regForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Ambil data dari input
        const payload = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            classType: document.getElementById('classType').value,
            preferredDate: document.getElementById('preferredDate').value,
            message: document.getElementById('message').value
        };

        // 2. Efek Visual Tombol
        const btn = regForm.querySelector('button[type="submit"]');
        btn.textContent = "Processing...";
        btn.disabled = true;

        try {
            // 3. Kirim ke Backend
            const response = await fetch('http://127.0.0.1:8000/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Berhasil
                alert("✅ Registration Successful!");
                regForm.reset();
                // Refresh participants list
                regForm.dispatchEvent(new Event("participants-refresh"));
                if (regMsg) {
                    regMsg.textContent = "Data successfully saved to database!";
                    regMsg.style.color = "green";
                    regMsg.style.display = "block";
                }
            } else {
                const errorData = await response.json();
                alert("❌ Server Error: " + JSON.stringify(errorData.detail));
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("❌ Failed to connect to server. Is Uvicorn running?");
        } finally {
            btn.textContent = "Submit Registration";
            btn.disabled = false;
        }
    });
}

  /* -------------------------------
     GALLERY MODAL & BUTTON EFFECTS
  ------------------------------- */
  document.querySelectorAll(".gallery-image, .gallery-item").forEach(img => {
    img.addEventListener("click", () => {
      const bg = img.style.backgroundImage || "";
      const url = bg.slice(5, -2);
      if (!url) return;

      const modal = document.createElement("div");
      modal.style.cssText = `
        position:fixed;inset:0;display:flex;
        align-items:center;justify-content:center;
        background:rgba(0,0,0,.9);z-index:10000;
        cursor:pointer;animation:fadeIn .3s ease;
      `;

      const image = document.createElement("img");
      image.src = url;
      image.style.cssText = `
        max-width:90%;max-height:90%;
        border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.5);
      `;
      modal.appendChild(image);
      document.body.appendChild(modal);

      modal.addEventListener("click", () => {
        modal.style.animation = "fadeOut .3s ease";
        setTimeout(() => modal.remove(), 300);
      });
    });
  });

  document.querySelectorAll(".btn-glass, .btn-small").forEach(btn => {
    btn.addEventListener("mouseenter", () => (btn.style.transform = "translateY(-2px)"));
    btn.addEventListener("mouseleave", () => (btn.style.transform = "translateY(0)"));
  });

  /* -------------------------------
     NAVBAR SHADOW ON SCROLL
  ------------------------------- */
  const navbar = document.querySelector(".navbar-glass");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.style.boxShadow =
        window.scrollY > 50
          ? "0 4px 30px rgba(0,0,0,.1)"
          : "0 4px 20px rgba(0,0,0,.05)";
    });
  }

  /* -------------------------------
     FORM VALIDATION + LAZY LOAD + DATE INPUT
  ------------------------------- */
  document.querySelectorAll(".form-input, .form-textarea, .form-select").forEach(input => {
    input.addEventListener("blur", function () {
      if (this.hasAttribute("required")) {
        this.style.borderColor = this.value.trim()
          ? "rgba(76,175,80,0.5)"
          : "rgba(244,67,54,0.5)";
      }
    });
    input.addEventListener("focus", function () {
      this.style.borderColor = "var(--color-soft-gold)";
    });
  });

  const lazyItems = document.querySelectorAll(".gallery-item, .menu-image, .product-image");
  const lazyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.opacity = "0";
        el.style.transition = "opacity 0.6s ease";
        requestAnimationFrame(() => (el.style.opacity = "1"));
        lazyObs.unobserve(el);
      }
    });
  }, { rootMargin: "50px" });
  lazyItems.forEach(el => lazyObs.observe(el));

  const dateInput = document.getElementById("preferredDate");
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split("T")[0];
  }

  /* -------------------------------
     PAGE LOAD ANIMATION
  ------------------------------- */
  document.body.style.opacity = "0";
  window.addEventListener("load", () => {
    document.body.style.transition = "opacity 0.6s ease";
    document.body.style.opacity = "1";
  });

  /* =======================================
     REGISTERED PARTICIPANTS — FETCH & RENDER
     ======================================= */

  const PT_PAGE_SIZE = 5;
  let ptCurrentPage = 1;

  // Map classType value → badge CSS class + display label
  function getClassBadge(classType) {
    const map = {
      beginner:     { cls: "badge-beginner",    label: "Basic Class" },
      intermediate: { cls: "badge-intermediate", label: "Intermediate Class" },
      advanced:     { cls: "badge-advanced",     label: "Advanced Class" },
      private:      { cls: "badge-private",      label: "Private Session" },
    };
    const key = (classType || "").toLowerCase().trim();
    for (const [k, v] of Object.entries(map)) {
      if (key.includes(k)) return v;
    }
    return { cls: "badge-beginner", label: classType || "—" };
  }

  // Format preferred date string to "DD Mon YYYY"
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  // Get initials for avatar
  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  async function loadParticipants(page) {
    page = page || ptCurrentPage;
    const skeleton   = document.getElementById("participantsSkeleton");
    const empty      = document.getElementById("participantsEmpty");
    const table      = document.getElementById("participantsTable");
    const tbody      = document.getElementById("participantsTbody");
    const filled     = document.getElementById("spotsFilled");
    const total      = document.getElementById("spotsTotal");
    const pagination = document.getElementById("participantsPagination");
    const prevBtn    = document.getElementById("ptPrevBtn");
    const nextBtn    = document.getElementById("ptNextBtn");
    const pageInfo   = document.getElementById("ptPageInfo");

    if (!skeleton) return; // not on registration page

    // Show skeleton, hide others
    skeleton.style.display = "flex";
    empty.style.display    = "none";
    table.style.display    = "none";
    if (pagination) pagination.style.display = "none";

    const skip = (page - 1) * PT_PAGE_SIZE;

    try {
      const res  = await fetch(`http://127.0.0.1:8000/api/registrations?limit=${PT_PAGE_SIZE}&skip=${skip}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      // Update spots badge
      filled.textContent = data.filledSpots ?? "—";
      total.textContent  = data.totalSpots  ?? 16;

      skeleton.style.display = "none";

      const totalParticipants = data.totalParticipants ?? data.filledSpots ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalParticipants / PT_PAGE_SIZE));

      // Clamp page within valid range
      if (page > totalPages) page = totalPages;
      ptCurrentPage = page;

      if (!data.participants || data.participants.length === 0) {
        empty.style.display = "block";
        return;
      }

      // Build rows
      tbody.innerHTML = "";
      data.participants.forEach((p, idx) => {
        const badge = getClassBadge(p.classType);
        const tr = document.createElement("tr");
        tr.className = "pt-row-animate";
        tr.style.animationDelay = `${idx * 0.07}s`;
        tr.innerHTML = `
          <td class="pt-no" data-label="">${String(p.no).padStart(2, "0")}</td>
          <td data-label="Participant">
            <div class="pt-participant">
              <div class="pt-avatar">${getInitials(p.fullName)}</div>
              <div>
                <div class="pt-name">${p.fullName || "—"}</div>
                <div class="pt-email">${p.email || ""}</div>
              </div>
            </div>
          </td>
          <td data-label="Class Type">
            <span class="class-badge ${badge.cls}">${badge.label}</span>
          </td>
          <td data-label="Date">
            <div class="pt-date">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              ${formatDate(p.preferredDate)}
            </div>
          </td>
          <td class="pt-reg" data-label="Registered On">${p.registeredAt || "—"}</td>
        `;
        tbody.appendChild(tr);
      });

      table.style.display = "table";

      // Update pagination controls
      if (pagination) {
        if (totalPages > 1) {
          pagination.style.display = "flex";
          pageInfo.textContent     = `Page ${ptCurrentPage} of ${totalPages}`;
          prevBtn.disabled         = ptCurrentPage <= 1;
          nextBtn.disabled         = ptCurrentPage >= totalPages;
        } else {
          pagination.style.display = "none";
        }
      }

    } catch (err) {
      console.warn("Participants fetch failed:", err);
      skeleton.style.display = "none";
      empty.style.display    = "block";
    }
  }

  // Wire Prev / Next buttons
  const ptPrevBtn = document.getElementById("ptPrevBtn");
  const ptNextBtn = document.getElementById("ptNextBtn");

  if (ptPrevBtn) {
    ptPrevBtn.addEventListener("click", () => {
      if (ptCurrentPage > 1) loadParticipants(ptCurrentPage - 1);
    });
  }

  if (ptNextBtn) {
    ptNextBtn.addEventListener("click", () => {
      loadParticipants(ptCurrentPage + 1);
    });
  }

  // Initial load
  loadParticipants(1);

  // Refresh list after successful registration submission
  const regForm2 = document.getElementById("regForm");
  if (regForm2) {
    regForm2.addEventListener("participants-refresh", () => {
      ptCurrentPage = 1;
      loadParticipants(1);
    });
  }

  // Poll every 30 seconds for real-time feel
  setInterval(() => loadParticipants(ptCurrentPage), 30000);

});
