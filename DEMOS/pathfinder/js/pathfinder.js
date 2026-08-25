/* ============================================================
   PATHFINDER DESIGN SYSTEM 2.0 — Behaviors
   Declarative, data-attribute driven so HTML injected at runtime
   (live demos, hot-swapped fragments) just works. No build step.
   ============================================================ */
(function () {
  "use strict";

  const Pathfinder = (window.Pathfinder = window.Pathfinder || {});

  /* ---------- Modal ---------- */
  let lastTrigger = null;

  Pathfinder.openModal = function (id, trigger) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    lastTrigger = trigger || document.activeElement;
    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("open"));
    Pathfinder.syncGates();
    const focusable = overlay.querySelector(
      "button, [href], input, select, textarea, [tabindex]"
    );
    if (focusable) focusable.focus();
  };

  Pathfinder.closeModal = function (overlay) {
    if (typeof overlay === "string") overlay = document.getElementById(overlay);
    if (!overlay) overlay = document.querySelector(".pf-modal-overlay.open");
    if (!overlay) return;
    overlay.classList.remove("open");
    setTimeout(() => (overlay.style.display = "none"), 200);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    lastTrigger = null;
  };

  /* ---------- Toast ---------- */
  Pathfinder.toast = function (title, detail, tone) {
    let region = document.querySelector(".pf-toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "pf-toast-region";
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const icons = { positive: "✓", negative: "✕", info: "ℹ" };
    const el = document.createElement("div");
    el.className = "pf-toast " + (tone || "info");
    el.innerHTML =
      '<span class="icon">' + (icons[tone] || icons.info) + "</span>" +
      '<div><div class="t"></div><div class="d"></div></div>';
    el.querySelector(".t").textContent = title;
    el.querySelector(".d").textContent = detail || "";
    region.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity .3s";
      setTimeout(() => el.remove(), 320);
    }, 4200);
  };

  /* ---------- Table: sort ---------- */
  function sortTable(th) {
    const table = th.closest("table");
    const tbody = table.querySelector("tbody");
    const idx = Array.from(th.parentNode.children).indexOf(th);
    const current = th.getAttribute("aria-sort");
    const dir = current === "ascending" ? "descending" : "ascending";
    table.querySelectorAll("th[data-sort]").forEach((h) => h.removeAttribute("aria-sort"));
    th.setAttribute("aria-sort", dir);
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const num = (s) => parseFloat(s.replace(/[^0-9.\-]/g, ""));
    rows.sort((a, b) => {
      const av = a.children[idx].textContent.trim();
      const bv = b.children[idx].textContent.trim();
      const an = num(av), bn = num(bv);
      const cmp =
        !isNaN(an) && !isNaN(bn) && av.match(/[0-9]/)
          ? an - bn
          : av.localeCompare(bv);
      return dir === "ascending" ? cmp : -cmp;
    });
    rows.forEach((r) => tbody.appendChild(r));
  }

  /* ---------- Confirmation gate ----------
     data-confirm-gate="checkboxId" on a button keeps it disabled until that
     checkbox is checked. The spec requires this on the most critical deletes. */
  Pathfinder.syncGates = function () {
    document.querySelectorAll("[data-confirm-gate]").forEach(function (btn) {
      const cb = document.getElementById(btn.getAttribute("data-confirm-gate"));
      btn.disabled = !(cb && cb.checked);
    });
  };

  /* ---------- Table: selection ---------- */
  function syncRow(cb) {
    const tr = cb.closest("tr");
    if (tr) tr.setAttribute("aria-selected", cb.checked ? "true" : "false");
  }

  /* ---------- Global delegated events ---------- */
  document.addEventListener("click", function (e) {
    // data-toast="Title|Detail|tone" — first, so it can share a button with
    // data-modal-close (e.g. "Save" closes the modal AND confirms via toast)
    const toaster = e.target.closest("[data-toast]");
    if (toaster) {
      const parts = toaster.getAttribute("data-toast").split("|");
      Pathfinder.toast(parts[0], parts[1] || "", parts[2] || "info");
    }
    // data-modal-open="modalId"
    const opener = e.target.closest("[data-modal-open]");
    if (opener) {
      Pathfinder.openModal(opener.getAttribute("data-modal-open"), opener);
      return;
    }
    // data-modal-close (inside a modal)
    if (e.target.closest("[data-modal-close]")) {
      Pathfinder.closeModal(e.target.closest(".pf-modal-overlay"));
      return;
    }
    // overlay click dismisses (unless data-static)
    if (
      e.target.classList &&
      e.target.classList.contains("pf-modal-overlay") &&
      !e.target.hasAttribute("data-static")
    ) {
      Pathfinder.closeModal(e.target);
      return;
    }
    // sortable header
    const th = e.target.closest("th[data-sort]");
    if (th) { sortTable(th); return; }
    // tabs
    const tab = e.target.closest(".pf-tab");
    if (tab) {
      tab.closest(".pf-tabs").querySelectorAll(".pf-tab")
        .forEach((t) => t.setAttribute("aria-selected", t === tab ? "true" : "false"));
      return;
    }
    // pagination
    const page = e.target.closest(".pf-page");
    if (page) {
      page.closest(".pages").querySelectorAll(".pf-page")
        .forEach((p) => p.removeAttribute("aria-current"));
      page.setAttribute("aria-current", "page");
      return;
    }
  });

  document.addEventListener("change", function (e) {
    // select-all checkbox: data-select-all
    if (e.target.matches("[data-select-all]")) {
      const table = e.target.closest("table");
      table.querySelectorAll("tbody [data-select-row]").forEach((cb) => {
        cb.checked = e.target.checked;
        syncRow(cb);
      });
      return;
    }
    if (e.target.matches("[data-select-row]")) syncRow(e.target);
    if (e.target.matches('input[type="checkbox"]')) Pathfinder.syncGates();
    // data-filter-table targets tbody rows by data-status
    if (e.target.matches("[data-filter-table]")) {
      const table = document.querySelector(e.target.getAttribute("data-filter-table"));
      const val = e.target.value;
      table.querySelectorAll("tbody tr").forEach((tr) => {
        tr.style.display = val === "all" || tr.dataset.status === val ? "" : "none";
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    // Danger/confirmation dialogs are data-static: they require an explicit
    // button press, so Escape must not dismiss them either.
    const open = document.querySelector(".pf-modal-overlay.open");
    if (open && open.hasAttribute("data-static")) return;
    Pathfinder.closeModal();
  });

  /* ---------- Live stage hot-swap ----------
     stage/index.html polls app.html and swaps it in when it changes,
     so components written to disk appear on screen within ~1s. */
  Pathfinder.live = function (target, url, interval) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    let last = null;
    async function tick() {
      try {
        const res = await fetch(url + "?t=" + Date.now(), { cache: "no-store" });
        if (res.ok) {
          const html = await res.text();
          if (html !== last) {
            const first = last === null;
            last = html;
            el.innerHTML = html;
            Pathfinder.syncGates();
            // data-open on an overlay renders it already open after a swap —
            // routed through openModal so focus and gating are set up properly.
            const pre = el.querySelector(".pf-modal-overlay[data-open]");
            if (pre) requestAnimationFrame(() => Pathfinder.openModal(pre.id));
            el.classList.remove("pf-swap");
            void el.offsetWidth;
            el.classList.add("pf-swap");
            if (!first) {
              const chip = document.getElementById("pf-live-chip");
              if (chip) {
                chip.classList.remove("pulse");
                void chip.offsetWidth;
                chip.classList.add("pulse");
              }
            }
          }
        }
      } catch (err) { /* server briefly unavailable — keep polling */ }
      setTimeout(tick, interval || 800);
    }
    tick();
  };
})();
