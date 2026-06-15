(function () {
  "use strict";

  var tabs = document.querySelectorAll(".usa-market__tab");
  var lists = document.querySelectorAll(".usa-market__download-list");
  if (!tabs.length || !lists.length) return;

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (item) {
        item.classList.remove("is-active");
        item.setAttribute("aria-pressed", "false");
      });
      lists.forEach(function (list) {
        list.classList.remove("is-active");
      });

      tab.classList.add("is-active");
      tab.setAttribute("aria-pressed", "true");
      if (lists[index]) {
        lists[index].classList.add("is-active");
      }
    });
  });
})();
