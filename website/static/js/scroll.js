(function(scroll_x) {
  window.addEventListener("load", function() {
    const media_infograph = document.querySelector(".media_infograph");
    if (media_infograph) {
      const media_infograph_scroll = scroll_x(media_infograph);
      document
        .getElementById("media_infograph_R")
        .addEventListener("click", media_infograph_scroll.right);
      document
        .getElementById("media_infograph_L")
        .addEventListener("click", media_infograph_scroll.left);
    }

    const media_videos = document.querySelector(".media_videos");
    if (media_videos) {
      const media_videos_scroll = scroll_x(media_videos);
      document
        .getElementById("media_videos_R")
        .addEventListener("click", media_videos_scroll.right);
      document
        .getElementById("media_videos_L")
        .addEventListener("click", media_videos_scroll.left);
    }
  });
})(function(element) {
  let x = element.scrollLeft;

  function easeOutQuad(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  }

  function scroll_animation(scroll_value) {
    const scroll_left_old = element.scrollLeft;
    let current_step = 0;
    function navbar_collapse_height() {
      const scroll_add = easeOutQuad(current_step++, 0, scroll_value, 30);
      element.scrollTo(scroll_left_old + scroll_add, 0);
      if (current_step < 30) {
        requestAnimationFrame(navbar_collapse_height);
      }
    }
    cancelAnimationFrame(navbar_collapse_height);
    requestAnimationFrame(navbar_collapse_height);
  }

  return {
    right: function() {
      scroll_animation(500);
    },
    left: function() {
      scroll_animation(-500);
    }
  };
});
