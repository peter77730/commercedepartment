(function () {
  "use strict";

  // ── FAQ video switcher ─────────────────────────────────────────────────────
  const faqBtns = document.querySelectorAll(".faq-btn");
  const video = document.getElementById("planVideo");
  const videoPlayer = document.getElementById("planVideoPlayer");
  const videoLightbox = document.getElementById("planVideoLightbox");
  const videoLightboxEl = document.getElementById("planVideoLightboxEl");
  const pathname = window.location.pathname.replace(/index\.html$/, "");
  const coverImageMap = {
    "/innovation/plan-01/": "/assets/images/cover-img-man-1.jpg",
    "/brand/plan-06/": "/assets/images/cover-img-women-1.jpg",
  };
  const coverImageSrc = coverImageMap[pathname] || "/assets/images/cover-img.png";

  let videoCover = document.getElementById("planVideoCover");

  if (videoPlayer && !videoCover) {
    videoCover = document.createElement("figure");
    videoCover.className = "plan-video-cover";
    videoCover.id = "planVideoCover";
    videoCover.setAttribute("aria-hidden", "true");
    videoCover.innerHTML =
      '<img class="plan-video-cover__img" src="' + coverImageSrc + '" alt="" width="1200" height="675" />';
    videoPlayer.insertBefore(videoCover, videoPlayer.firstChild);
  }

  const hideCover = () => {
    if (videoCover) {
      videoCover.classList.add("is-hidden");
    }
  };

  const playCurrentVideo = () => {
    hideCover();

    if (!video) {
      return;
    }

    video.setAttribute("controls", "");

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const openVideoLightbox = (src) => {
    const hasFancybox = typeof window.Fancybox !== "undefined";

    if (!src || !videoLightbox || !videoLightboxEl || !hasFancybox) {
      playCurrentVideo();
      return;
    }

    hideCover();
    videoLightboxEl.pause();
    videoLightboxEl.currentTime = 0;

    const playLightboxVideo = () => {
      const playPromise = videoLightboxEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    videoLightboxEl.addEventListener("loadeddata", playLightboxVideo, { once: true });
    videoLightboxEl.setAttribute("src", src);
    videoLightboxEl.load();

    window.Fancybox.show([{ src: "#planVideoLightbox", type: "inline" }], {
      on: {
        close: () => {
          videoLightboxEl.pause();
          videoLightboxEl.currentTime = 0;
        },
      },
    });
  };

  const switchVideo = (btn) => {
    const videoKey = btn.getAttribute("data-video");
    if (!videoKey) {
      return "";
    }

    faqBtns.forEach((item) => {
      item.setAttribute("aria-expanded", item === btn ? "true" : "false");
    });

    if (!video) {
      return "";
    }

    // 正式站移除註解
    // const nextSrc = `/assets/mp4/video-${videoKey}.mp4`;
    // 正式站註解
    const nextSrc = `https://pub-2f756f30f65145d2bbb98ff8055e9b93.r2.dev/video-${videoKey}.mp4`;

    video.pause();
    video.removeAttribute("controls");
    video.currentTime = 0;

    if (video.getAttribute("src") !== nextSrc) {
      video.setAttribute("src", nextSrc);
      video.load();
    }

    return nextSrc;
  };

  faqBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextSrc = switchVideo(btn);

      if (nextSrc && videoLightbox && videoLightboxEl) {
        openVideoLightbox(nextSrc);
        return;
      }

      if (video) {
        video.addEventListener("loadeddata", playCurrentVideo, { once: true });
      }
      window.requestAnimationFrame(playCurrentVideo);
    });
  });

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
