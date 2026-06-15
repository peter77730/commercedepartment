(function () {
  "use strict";

  // ── FAQ video switcher ─────────────────────────────────────────────────────
  const faqBtns = document.querySelectorAll(".faq-btn");
  const playBtn = document.getElementById("planVideoPlayBtn");
  const video = document.getElementById("planVideo");

  const switchVideo = (btn) => {
    const videoKey = btn.getAttribute("data-video");
    if (!videoKey) {
      return;
    }

    faqBtns.forEach((item) => {
      item.setAttribute("aria-expanded", item === btn ? "true" : "false");
    });

    if (!video) {
      return;
    }

    const nextSrc = `/assets/mp4/video-${videoKey}.mp4`;

    video.pause();
    video.removeAttribute("controls");
    video.currentTime = 0;

    if (video.getAttribute("src") !== nextSrc) {
      video.setAttribute("src", nextSrc);
      video.load();
    }

    if (playBtn) {
      playBtn.classList.remove("is-hidden");
    }
  };

  faqBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchVideo(btn);
    });
  });

  // ── Video play button ──────────────────────────────────────────────────────

  if (playBtn && video) {
    playBtn.addEventListener("click", () => {
      playBtn.classList.add("is-hidden");
      video.setAttribute("controls", "");
      video.play();
    });

    video.addEventListener("ended", () => {
      video.removeAttribute("controls");
      playBtn.classList.remove("is-hidden");
    });
  }

  // ── PDF.js inline preview + local Fancybox lightbox ───────────────────────
  const pdfViewer = document.querySelector(".plan-pdf-viewer[data-pdf-src]");
  const pdfPreviewCanvas = document.getElementById("planPdfPreviewCanvas");
  const pdfPreviewLoading = document.getElementById("planPdfPreviewLoading");
  const pdfPreviewError = document.getElementById("planPdfPreviewError");
  const pdfLightboxFrame = document.getElementById("planPdfLightboxFrame");
  const pdfTriggers = document.querySelectorAll('[data-fancybox="plan-pdf"]');

  if (pdfViewer && pdfPreviewCanvas && pdfPreviewLoading && pdfPreviewError && pdfLightboxFrame && pdfTriggers.length) {
    const pdfSrc = pdfViewer.getAttribute("data-pdf-src");
    const hasFancybox = typeof window.Fancybox !== "undefined";
    const frameSrc = pdfSrc ? pdfSrc + "#page=1&view=FitH" : "";
    let pdfDocument = null;
    let resizeTimer = null;

    const setDirectPdfLinks = () => {
      pdfTriggers.forEach((trigger) => {
        trigger.setAttribute("href", pdfSrc);
        trigger.setAttribute("target", "_blank");
        trigger.setAttribute("rel", "noopener noreferrer");
        trigger.removeAttribute("data-fancybox");
      });
    };

    const showPreviewError = () => {
      pdfPreviewCanvas.hidden = true;
      pdfPreviewLoading.hidden = true;
      pdfPreviewError.hidden = false;
    };

    const renderPreview = async () => {
      if (!pdfDocument) {
        return;
      }

      const firstPage = await pdfDocument.getPage(1);
      const baseViewport = firstPage.getViewport({ scale: 1 });
      const availableWidth = Math.max(pdfViewer.clientWidth, 320);
      const cssScale = availableWidth / baseViewport.width;
      const deviceScale = window.devicePixelRatio || 1;
      const renderScale = cssScale * Math.max(deviceScale, 2);
      const renderViewport = firstPage.getViewport({ scale: renderScale });
      const context = pdfPreviewCanvas.getContext("2d");

      pdfPreviewCanvas.width = Math.floor(renderViewport.width);
      pdfPreviewCanvas.height = Math.floor(renderViewport.height);
      pdfPreviewCanvas.style.width = "100%";
      pdfPreviewCanvas.style.height = "auto";

      await firstPage.render({
        canvasContext: context,
        viewport: renderViewport,
      }).promise;

      pdfPreviewCanvas.hidden = false;
      pdfPreviewLoading.hidden = true;
      pdfPreviewError.hidden = true;
    };

    const initPdfModules = async () => {
      if (!pdfSrc || typeof window.pdfjsLib === "undefined") {
        showPreviewError();
        setDirectPdfLinks();
        return;
      }

      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/vendor/pdfjs/pdf.worker.min.js";

      try {
        pdfDocument = await window.pdfjsLib.getDocument(pdfSrc).promise;
        await renderPreview();
      } catch (error) {
        showPreviewError();
      }
    };

    const initPdfLightbox = () => {
      if (!pdfSrc) {
        setDirectPdfLinks();
        return;
      }

      pdfLightboxFrame.setAttribute("src", frameSrc);

      if (hasFancybox) {
        window.Fancybox.bind('[data-fancybox="plan-pdf"]', {
          animated: true,
          dragToClose: false,
          hideScrollbar: false,
        });
      } else {
        setDirectPdfLinks();
      }
    };

    window.addEventListener("resize", () => {
      if (!pdfDocument) {
        return;
      }

      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        renderPreview().catch(() => {
          showPreviewError();
        });
      }, 150);
    });

    initPdfModules();
    initPdfLightbox();
  }
})();
