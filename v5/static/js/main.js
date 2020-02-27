$(document).ready(function() {
  $(".dropdown-submenu a.nav-link").on("click", function(e) {
    $(this)
      .next("ul")
      .toggle();
    e.stopPropagation();
    e.preventDefault();
  });
});
