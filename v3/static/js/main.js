function easeOutQuad(t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b;
}

function toggle_side_links(event) {
  const navbar_collapse = document.getElementById("side_links");
  const navbar_root = document.getElementById("side_links_root");
  if (navbar_collapse.style.display !== "block" && window.innerWidth < 1001) {
    document.body.style.overflow = "hidden";
    navbar_root.style.display = "block";
    navbar_collapse.style.display = "block";
    current_step = 0;
    const is_rtl = window.location.href.includes("/AR/");
    function navbar_collapse_height() {
      height = easeOutQuad(current_step++, 0, 20, 20);
      if (is_rtl) {
        navbar_collapse.style.right = height - 20 + "rem";
      } else {
        navbar_collapse.style.left = height - 20 + "rem";
      }
      if (height < 20) {
        requestAnimationFrame(navbar_collapse_height);
      }
    }
    requestAnimationFrame(navbar_collapse_height);
  } else {
    navbar_collapse.style.display = "none";
    navbar_root.style.display = "none";
    document.body.style.overflow = "hidden auto";
  }
}

function hide_navigation() {
  const root = document.getElementById("navigation_root");
  root.style.display = "none";
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

const show_banner_img = (function() {
  let img_index = 0;
  return function(dir) {
    const all_img = document.querySelectorAll(".banner_img div");
    for (let i = 0; i < all_img.length; i++) {
      all_img[i].className = all_img[i].className.replace(" active show", "");
    }
    if (img_index === 0 && dir === "previous") {
      img_index = all_img.length - 1;
    } else {
      img_index = dir === "next" ? img_index + 1 : img_index - 1;
      img_index = img_index >= all_img.length ? 0 : img_index;
    }
    all_img[img_index].className += " active show";
  };
})();

function show_sections_box(ids) {
  const all_sections = document.querySelectorAll(
    ".sections_box_root > section"
  );
  const all_sections_nav = document.querySelectorAll(
    ".sections_nav_hover > .sections_text"
  );
  for (let i = 0; i < all_sections.length; i++) {
    all_sections[i].style.display = "none";
  }
  for (let i = 0; i < all_sections_nav.length; i++) {
    all_sections_nav[i].className = "sections_text";
  }
  ids.map(function(id) {
    document.getElementById("section_" + id).style.display = "flex";
    if (id === 4) {
      all_sections_nav[1].className = "sections_text sections_nav_selected";
    } else if (id === 5) {
      all_sections_nav[0].className = "sections_text sections_nav_selected";
    } else {
      all_sections_nav[2].className = "sections_text sections_nav_selected";
    }
  });
}

function show_calculator() {
  const radio_1 = document.getElementById("radio_1");
  const radio_2 = document.getElementById("radio_2");
  const radio_3 = document.getElementById("radio_3");
  const radio_4 = document.getElementById("radio_4");
  const input_1 = document.querySelector(".input_1");
  const section_alert = document.querySelector(".section_alert");
  if (radio_1.checked) {
  }
  if (radio_3.checked) {
    section_alert.innerHTML =
      "تعريف الفرد المستقل: ذكر أو أنثى عمر 24 ومافوق (غير المتزوج الأعزب، الأرمل أو الأرملة، ليس لديه تابعين، أو معالين)";
    input_1.placeholder = "";
    document.querySelector(".text_6").style.display = "none";
    document.querySelector(".input_6").style.display = "none";
    document.querySelector(".text_7").style.display = "none";
    document.querySelector(".input_7").style.display = "none";
  } else {
    section_alert.innerHTML =
      "تعريف رب الأسرة: ذكر أو أنثى ( الزوج، زوجة غير المواطن، أم غير متزوجة، أب غير متزوج، زوجة فاقد الأهلية)";
    input_1.placeholder = "يشمل الدخل الخاص برب الأسرة والزوجة والأبناء";
    document.querySelector(".text_6").style.display = "block";
    document.querySelector(".input_6").style.display = "block";
    document.querySelector(".text_7").style.display = "block";
    document.querySelector(".input_7").style.display = "block";
  }
  if (
    (radio_1.checked || radio_2.checked) &&
    (radio_3.checked || radio_4.checked)
  ) {
    document.getElementById("calculator_root").style.display = "grid";
    section_alert.style.display = "block";
  }
}

function show_urv_title(id) {
  document.getElementById("btn_title_1").className = "button-h";
  document.getElementById("btn_title_3").className = "button-h";
  document.getElementById("btn_title_" + id).className = "button";

  document.getElementById("title_1").style.display = "none";
  document.getElementById("title_3").style.display = "none";
  document.getElementById("title_" + id).style.display = "flex";
}

function show_urv_box(id) {
  document.getElementById("btn_sec_2").className = "button-h";
  document.getElementById("btn_sec_4").className = "button-h";
  document.getElementById("btn_sec_" + id).className = "button";

  document.getElementById("section_2").style.display = "none";
  document.getElementById("section_4").style.display = "none";
  document.getElementById("section_" + id).style.display = "flex";
}

window.addEventListener("load", function() {
  const show_side_links = document.getElementById("show_side_links");
  if (show_side_links) {
    show_side_links.addEventListener("click", toggle_side_links);
  }

  const side_links_root = document.getElementById("side_links_root");
  if (side_links_root) {
    side_links_root.addEventListener("click", toggle_side_links);
  }

  const side_links = document.getElementById("side_links");
  if (side_links) {
    side_links.addEventListener("click", e => e.stopPropagation());
  }

  const side_links_close = document.getElementById("side_links_close");
  if (side_links_close) {
    side_links_close.addEventListener("click", function(event) {
      event.stopPropagation();
      toggle_side_links();
    });
  }

  const banner_right = document.getElementById("banner_right");
  if (banner_right) {
    banner_right.addEventListener("click", _ => show_banner_img("next"));
  }

  const banner_left = document.getElementById("banner_left");
  if (banner_left) {
    banner_left.addEventListener("click", _ => show_banner_img("previous"));
  }

  const ln_ar = document.getElementById("ln_ar");
  if (ln_ar) {
    ln_ar.addEventListener("click", function(event) {
      let href = window.location.href;
      href = href.replace("/EN/", "/AR/");
      window.location.href = href;
    });
  }

  const ln_en = document.getElementById("ln_en");
  if (ln_en) {
    ln_en.addEventListener("click", function(event) {
      let href = window.location.href;
      href = href.replace("/AR/", "/EN/");
      window.location.href = href;
    });
  }

  const side_links_navs = document.querySelectorAll(".side_links nav");
  for (let i = 0; i < side_links_navs.length; i++) {
    const nav_span = document.createElement("span");
    nav_span.addEventListener("click", function() {
      const parent_parent = nav_span.parentElement.parentElement;
      if (parent_parent.className === "side_links") {
        const side_links_first = document.querySelectorAll(".side_links > nav");
        for (let x = 0; x < side_links_first.length; x++) {
          console.log(side_links_first[x]);
          side_links_first[x].querySelector("div").className = "";
          side_links_first[x].querySelector("span").className = "";
        }
      }
      nav_span.classList.toggle("rotate_span");
      nav_span.previousElementSibling.classList.toggle("nav_show");
    });
    side_links_navs[i].appendChild(nav_span);
  }

  setTimeout(add_video_to_home, 0);

  $(document).ready(function() {
    $(".dropdown-submenu a.nav-link").on("click", function(e) {
      $(this)
        .next("ul")
        .toggle();
      e.stopPropagation();
      e.preventDefault();
    });
  });
});
