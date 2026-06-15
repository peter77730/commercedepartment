"use strict";

// ── About Section Swiper ────────────────────────────────────────────
(function () {
  if (typeof Swiper === "undefined") return;

  var swiper = new Swiper("#aboutSwiper", {
    loop: true,
    speed: 600,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: "#aboutPagination",
      clickable: true,
    },
    a11y: {
      enabled: true,
      prevSlideMessage: "上一張",
      nextSlideMessage: "下一張",
    },
  });

  // 播放 / 暫停按鈕（WCAG 2.1 SC 2.2.2）
  var btn = document.getElementById("aboutPlayPause");
  if (!btn) return;

  var playing = true;

  btn.addEventListener("click", function () {
    if (playing) {
      swiper.autoplay.stop();
      btn.classList.add("is-paused");
      btn.setAttribute("aria-label", "播放輪播");
    } else {
      swiper.autoplay.start();
      btn.classList.remove("is-paused");
      btn.setAttribute("aria-label", "暫停輪播");
    }
    playing = !playing;
  });
})();

// ── 手機漢堡選單 ────────────────────────────────────────────────────
(function () {
  var toggle = document.getElementById("navToggle");
  var panel = document.getElementById("mobileMenu");
  var backdrop = document.getElementById("navBackdrop");
  var header = document.querySelector(".site-header");

  if (!toggle || !panel || !header) return;

  // 動態設定 --header-height CSS 變數，讓手機選單緊貼 header 底部
  function syncHeaderHeight() {
    document.documentElement.style.setProperty("--header-height", header.getBoundingClientRect().height + "px");
  }
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);

  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "關閉主選單");
    panel.classList.add("is-open");
    panel.removeAttribute("aria-hidden");
    panel.removeAttribute("inert");
    if (backdrop) backdrop.classList.add("is-visible");
    document.body.classList.add("nav-open");
    // 聚焦第一個選單連結（無障礙）
    var first = panel.querySelector(".mobile-nav-link");
    if (first) first.focus();
  }

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "展開主選單");
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("inert", "");
    if (backdrop) backdrop.classList.remove("is-visible");
    document.body.classList.remove("nav-open");
  }

  toggle.addEventListener("click", function () {
    toggle.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeMenu);
  }

  // ESC 鍵關閉選單
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      toggle.focus();
    }
  });

  // 點擊選單連結後關閉
  panel.querySelectorAll(".mobile-nav-link").forEach(function (link) {
    link.addEventListener("click", closeMenu);
    link.addEventListener("focus", function () {
      link.scrollIntoView({ block: "nearest" });
    });
  });

  // 焦點離開最後一個連結時關閉選單（Tab 鍵導覽離開）
  var links = panel.querySelectorAll(".mobile-nav-link");
  var lastLink = links[links.length - 1];
  if (lastLink) {
    lastLink.addEventListener("blur", function (e) {
      // relatedTarget 為 null 表示焦點移出頁面，也關閉
      if (!e.relatedTarget || !panel.contains(e.relatedTarget)) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  // 視窗放大超過斷點時重置選單狀態
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1100) closeMenu();
  });
})();

// ── 計畫分類 下拉選單（≤921px） ──────────────────────────────────────
(function () {
  var toggle = document.getElementById("subnavToggle");
  var list = document.getElementById("subnavList");
  if (!toggle || !list) return;

  function openSubnav() {
    toggle.setAttribute("aria-expanded", "true");
    list.classList.add("is-open");
  }

  function closeSubnav() {
    toggle.setAttribute("aria-expanded", "false");
    list.classList.remove("is-open");
  }

  toggle.addEventListener("click", function () {
    toggle.getAttribute("aria-expanded") === "true" ? closeSubnav() : openSubnav();
  });

  // 點選清單項目後關閉
  list.addEventListener("click", function (e) {
    if (e.target.closest(".innov-subnav__link")) closeSubnav();
  });

  // ESC 關閉
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeSubnav();
      toggle.focus();
    }
  });

  // 焦點移出 nav 時關閉
  var nav = toggle.closest(".innov-subnav");
  if (nav) {
    nav.addEventListener("focusout", function (e) {
      if (!nav.contains(e.relatedTarget)) closeSubnav();
    });
  }

  // 視窗放大超過斷點時重置
  window.addEventListener("resize", function () {
    if (window.innerWidth > 921) closeSubnav();
  });
})();

// ── 5大補給包 Scroll 動畫 ────────────────────────────────────────────
(function () {
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  var programGrids = document.querySelectorAll(".innov-programs__grid");
  programGrids.forEach(function (grid) {
    grid.querySelectorAll("article.prog-card").forEach(function (card, index) {
      card.style.setProperty("--reveal-delay", index * 0.08 + "s");
    });
  });

  // ---- Fade-in + slide-up：視窗底部觸碰卡片頂部時觸發 ----
  var animatedBlocks = document.querySelectorAll(".pkg-inner, article.prog-card");
  if (animatedBlocks.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0 },
    );

    animatedBlocks.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---- 慣性微視差：左右元素以不同速率位移，停捲後仍帶有落差緩動 ----
  var sectionStates = Array.prototype.map
    .call(document.querySelectorAll(".pkg-section"), function (section) {
      return {
        section: section,
        circle: section.querySelector(".pkg-circle"),
        content: section.querySelector(".pkg-content"),
        direction: section.classList.contains("pkg-section--right") ? 1 : -1,
        circleX: 0,
        circleY: 0,
        circleScale: 1,
        contentX: 0,
        contentY: 0,
        targetCircleX: 0,
        targetCircleY: 0,
        targetCircleScale: 1,
        targetContentX: 0,
        targetContentY: 0,
      };
    })
    .filter(function (item) {
      return item.circle || item.content;
    });
  if (!sectionStates.length) return;

  var parallaxMedia = window.matchMedia("(max-width: 921px)");
  var rafId = null;
  var isTicking = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resetParallax() {
    sectionStates.forEach(function (item) {
      item.circleX = 0;
      item.circleY = 0;
      item.circleScale = 1;
      item.contentX = 0;
      item.contentY = 0;
      item.targetCircleX = 0;
      item.targetCircleY = 0;
      item.targetCircleScale = 1;
      item.targetContentX = 0;
      item.targetContentY = 0;

      if (item.circle) item.circle.style.transform = "";
      if (item.content) item.content.style.transform = "";
    });
  }

  function updateTargets() {
    var vh = window.innerHeight;
    var hasVisibleSection = false;

    sectionStates.forEach(function (item) {
      var rect = item.section.getBoundingClientRect();
      var isVisible = rect.bottom > -vh * 0.2 && rect.top < vh * 1.2;

      if (!isVisible) {
        item.targetCircleX = 0;
        item.targetCircleY = 0;
        item.targetCircleScale = 1;
        item.targetContentX = 0;
        item.targetContentY = 0;
        return;
      }

      hasVisibleSection = true;

      // relPos：0 = 區塊中心在視窗中央；正值 = 區塊在下方；負值 = 已捲過視窗中央
      var relPos = clamp((rect.top + rect.height / 2 - vh / 2) / vh, -1.2, 1.2);
      var depth = 1 - Math.min(1, Math.abs(relPos));

      item.targetCircleY = relPos * -110;
      item.targetCircleX = item.direction * relPos * -36;
      item.targetCircleScale = 1 + depth * 0.035;

      item.targetContentY = relPos * 52;
      item.targetContentX = item.direction * relPos * 26;
    });

    return hasVisibleSection;
  }

  function tickParallax() {
    if (parallaxMedia.matches) {
      resetParallax();
      isTicking = false;
      rafId = null;
      return;
    }

    var hasVisibleSection = updateTargets();
    var hasPendingMotion = false;

    sectionStates.forEach(function (item) {
      item.circleX += (item.targetCircleX - item.circleX) * 0.12;
      item.circleY += (item.targetCircleY - item.circleY) * 0.12;
      item.circleScale += (item.targetCircleScale - item.circleScale) * 0.08;

      item.contentX += (item.targetContentX - item.contentX) * 0.14;
      item.contentY += (item.targetContentY - item.contentY) * 0.14;

      if (
        Math.abs(item.targetCircleX - item.circleX) > 0.15 ||
        Math.abs(item.targetCircleY - item.circleY) > 0.15 ||
        Math.abs(item.targetContentX - item.contentX) > 0.15 ||
        Math.abs(item.targetContentY - item.contentY) > 0.15 ||
        Math.abs(item.targetCircleScale - item.circleScale) > 0.002
      ) {
        hasPendingMotion = true;
      }

      if (item.circle) {
        item.circle.style.transform =
          "translate3d(" +
          item.circleX.toFixed(2) +
          "px, " +
          item.circleY.toFixed(2) +
          "px, 0) scale(" +
          item.circleScale.toFixed(4) +
          ")";
      }

      if (item.content) {
        item.content.style.transform =
          "translate3d(" + item.contentX.toFixed(2) + "px, " + item.contentY.toFixed(2) + "px, 0)";
      }
    });

    if (hasVisibleSection || hasPendingMotion) {
      rafId = requestAnimationFrame(tickParallax);
      return;
    }

    isTicking = false;
    rafId = null;
  }

  function requestParallaxTick() {
    if (isTicking) return;
    isTicking = true;
    rafId = requestAnimationFrame(tickParallax);
  }

  window.addEventListener(
    "scroll",
    function () {
      requestParallaxTick();
    },
    { passive: true },
  );

  window.addEventListener("resize", function () {
    if (parallaxMedia.matches) {
      resetParallax();
      isTicking = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }

    requestParallaxTick();
  });

  requestParallaxTick();
})();

// ── Footer 上飄動畫 ───────────────────────────────────────────────────
(function () {
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  var footer = document.querySelector(".site-footer");
  if (!footer) return;

  var reveals = footer.querySelectorAll(".footer-reveal");
  if (!reveals.length) return;

  reveals.forEach(function (el, index) {
    el.style.setProperty("--reveal-delay", (index * 0.07).toFixed(2) + "s");
  });

  var triggered = false;
  var observer = new IntersectionObserver(
    function (entries) {
      if (triggered) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          triggered = true;
          reveals.forEach(function (el) {
            el.classList.add("is-visible");
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.05 },
  );

  observer.observe(footer);

  // footer 以外的 .footer-reveal（如回首頁連結）各自獨立觸發
  var standaloneReveals = document.querySelectorAll(".footer-reveal:not(.site-footer .footer-reveal)");
  if (standaloneReveals.length) {
    var standaloneObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            standaloneObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    standaloneReveals.forEach(function (el) {
      standaloneObserver.observe(el);
    });
  }
})();

// ── 網站瀏覽人數 ──────────────────────────────────────────────────────
(function () {
  var counter = document.getElementById("counter");
  if (!counter || typeof window.fetch !== "function") return;

  var key = "moea_resource_map_site_visits";
  var apiUrl = "https://countapi.mileshilliard.com/api/v1/hit/" + key;

  counter.setAttribute("aria-live", "polite");
  counter.textContent = "讀取中";

  fetch(apiUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Counter request failed");
      }
      return response.json();
    })
    .then(function (data) {
      var count = Number(data && data.value);
      if (!Number.isFinite(count)) {
        throw new Error("Invalid counter response");
      }
      counter.textContent = count.toLocaleString("zh-TW");
    })
    .catch(function () {
      // 保留原本的數字結構，避免 API 暫時失效時顯示壞掉。
      counter.textContent = "0";
    });
})();

// ── 首頁文字 hover 左右動態效果 ─────────────────────────────────────────
(function () {
  const sections = document.querySelectorAll(".itemset");
  if (!sections.length) return;

  // 最大位移量（px），可自行調整強度
  const STRENGTH = 40;

  sections.forEach(function (section) {
    const targets = section.querySelectorAll(".parallax-text");
    if (!targets.length) return;

    // 用 requestAnimationFrame 平滑更新，避免 mousemove 過度觸發
    let targetX = 0; // 目標位移
    let currentX = 0; // 目前位移（緩動用）
    let rafId = null;

    function onMouseMove(e) {
      const rect = section.getBoundingClientRect();
      // ratio: 0（最左）~ 1（最右）
      const ratio = (e.clientX - rect.left) / rect.width;
      // 轉成 -0.5 ~ 0.5，再取負號 → 滑鼠往右(ratio大)時往左移
      targetX = -(ratio - 0.5) * 2 * STRENGTH;
      startLoop();
    }

    function onMouseLeave() {
      // 滑鼠離開時回到中心
      targetX = 0;
      startLoop();
    }

    function startLoop() {
      if (rafId === null) rafId = requestAnimationFrame(update);
    }

    function update() {
      // 線性插值做緩動 (easing)，0.1 = 越小越慢越柔順
      currentX += (targetX - currentX) * 0.1;
      const tx = currentX.toFixed(2);
      targets.forEach(function (t) {
        t.style.transform = "translate(" + tx + "px)";
      });

      // 還沒到位就繼續跑，到位就停止迴圈
      if (Math.abs(targetX - currentX) > 0.1) {
        rafId = requestAnimationFrame(update);
      } else {
        currentX = targetX;
        const finalX = currentX.toFixed(2);
        targets.forEach(function (t) {
          t.style.transform = "translate(" + finalX + "px)";
        });
        rafId = null;
      }
    }

    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onMouseLeave);
  });
})();
