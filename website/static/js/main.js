let BOARD_MEMBERS = undefined;
let BOARD_MEMBERS_INDEX = 0;


function easeOutQuad(t, b, c, d) {
  return -c *(t/=d)*(t-2) + b;
}


function toggle_side_links(event) {
  const navbar_collapse = document.getElementById("side_links");
  const navbar_root = document.getElementById("side_links_root");
  if(navbar_collapse.style.display !== 'block' && window.innerWidth < 1001) {
    document.body.style.overflow = "hidden";
    navbar_root.style.display = 'block';
    navbar_collapse.style.display = 'block';
    current_step = 0
    const is_rtl = window.location.href.includes("/AR/");
    function navbar_collapse_height() {
      height = easeOutQuad(current_step++, 0, 20, 20);
      if(is_rtl) {
        navbar_collapse.style.right = height - 20 + 'rem';
      }
      else {
        navbar_collapse.style.left = height - 20 + 'rem';
      }
      if(height < 20) {
        requestAnimationFrame(navbar_collapse_height)
      }
    }
    requestAnimationFrame(navbar_collapse_height)
  }
  else {
    navbar_collapse.style.display = 'none';
    navbar_root.style.display = 'none';
    document.body.style.overflow = "hidden auto";
  }
}


function hide_navigation() {
  const root = document.getElementById("navigation_root");
  root.style.display = 'none';
  document.body.style.overflow = "hidden auto";
}


function add_video_to_home() {
  const video_root = document.getElementById("video_root");
  if (video_root) {
    const video = document.createElement("video");
    video.src = "../static/video/video_2.mp4";
    video.type = "video/mp4";
    video.controls = true;
    video.muted = true;
    video.autoplay = true;
    video.playsinline = true;
    video.loop = true;
    video_root.appendChild(video);
  }
}

function show_banner_img(dir) {
  const all_img = document.querySelectorAll(".banner_img div");
  let img_index = 0;
  return function() {
    for(let i=0;i < all_img.length;i++) {
      all_img[i].className = all_img[i].className.replace(" active", "");
    }
    img_index = (dir === "next" ? img_index+1 : img_index-1);
    img_index = (img_index >= all_img.length ? 0 : img_index)
    all_img[img_index].className += " active";
  }
}

function show_sections_box(ids) {
  const all_sections = document.querySelectorAll(".sections_box_root section");
  for(let i=0;i < all_sections.length;i++) {
    all_sections[i].style.display = "none";
  }
  ids.map(function(id) {
    const section_box = document.getElementById("section_" + id);
    section_box.style.display = "flex";
  })
}


window.onload = function() {

  document.getElementById("show_side_links")
    .addEventListener("click", toggle_side_links);

  document.getElementById("side_links_root")
    .addEventListener("click", toggle_side_links);

  document.getElementById("side_links")
    .addEventListener("click", e => e.stopPropagation());

  document.getElementById("side_links_close")
  .addEventListener("click", function(event) {
    event.stopPropagation();
    toggle_side_links();
  });

  const ln_ar = document.getElementById("ln_ar")
  if(ln_ar) {
    ln_ar.addEventListener("click", function(event) {
      let href = window.location.href;
      href = href.replace("/EN/", "/AR/")
      window.location.href = href
    });
  }

  const ln_en = document.getElementById("ln_en")
  if(ln_en) {
    ln_en.addEventListener("click", function(event) {
      let href = window.location.href;
      href = href.replace("/AR/", "/EN/")
      window.location.href = href
    });
  }
  
  setTimeout(add_video_to_home, 0);

  const next_banner_img = show_banner_img("next");
  const previous_banner_img = show_banner_img("previous");

  document.getElementById("banner_right")
    .addEventListener("click", next_banner_img);

  document.getElementById("banner_left")
    .addEventListener("click", previous_banner_img);
};