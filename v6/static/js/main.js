$(document).ready(function() {
  $(".dropdown-submenu a.nav-link").on("click", function(e) {
    $(this)
      .next("ul")
      .toggle();
    e.stopPropagation();
    e.preventDefault();
  });

  $("nav .dropdown, .btn-group").hover(function() {
    var dropdownMenu = $(this).children(".dropdown-menu");
    if (dropdownMenu.is(":visible")) {
      dropdownMenu.parent().toggleClass("open");
    }
  });

  $("#show-calculator-video h4").click(function() {
    $("#show-calculator-video iframe").show();
  });

  $(".custom-file-input").on("change", function() {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
  });

  $("#hijri-date-input").hijriDatePicker({
    hijri:true,
    showTodayButton: true
  });
});
