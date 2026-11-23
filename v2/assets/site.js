function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function avatar(profile, lazy = false) {
  const words = profile.name.split(/\s+/);
  const initials = [words[0], words.length > 1 ? words.at(-1) : ""].map(word => word.charAt(0)).join("");
  const node = element("span", "avatar", initials.toLocaleUpperCase());
  node.setAttribute("aria-hidden", "true");
  if (profile.photo) {
    const image = element("img");
    image.alt = "";
    if (lazy) image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => image.remove(), { once: true });
    image.src = profile.photo;
    node.append(image);
  }
  return node;
}

function showProfile(profile) {
  const heading = element("div", "profile-heading");
  const title = element("div");
  const name = element("h2", "", profile.name);
  name.id = "profile-name";
  title.append(name);
  if (profile.role) title.append(element("p", "", profile.role));
  heading.append(avatar(profile), title);

  const content = document.getElementById("profile-content");
  content.replaceChildren(heading);
  for (const [label, value] of [["Research", profile.research], ["Education", profile.education], ["About", profile.bio]]) {
    if (!value) continue;
    const detail = element("section", "profile-detail");
    detail.append(element("h3", "", label), element("p", "", value));
    content.append(detail);
  }

  const links = [...profile.links];
  if (profile.email) links.unshift({ label: profile.email, url: `mailto:${profile.email}` });
  if (links.length) {
    const list = element("ul", "profile-links");
    list.setAttribute("aria-label", "Contact and profile links");
    for (const { label, url } of links) {
      const item = element("li");
      const link = element("a", "", label);
      link.href = url;
      item.append(link);
      list.append(item);
    }
    content.append(list);
  }

  if (content.childElementCount === 1 && !profile.role) {
    content.append(element("p", "person-role", "Profile details have yet to be added."));
  }
  document.getElementById("profile-dialog").showModal();
}

function renderDirectory(groups) {
  if (!groups) {
    document.getElementById("people-unavailable").hidden = false;
    return;
  }

  const directory = document.getElementById("people-directory");
  const tabs = [...directory.querySelectorAll("[role='tab']")];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));
  const selectTab = selected => {
    tabs.forEach((tab, index) => {
      const active = index === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
  };

  tabs.forEach((tab, index) => {
    const group = tab.id.slice("tab-".length);
    const profiles = groups[group];
    if (profiles.length) {
      const list = element("ul", "people-grid");
      for (const profile of profiles) {
        const item = element("li");
        const card = element("button", "person-card");
        const info = element("span", "person-info");
        info.append(element("span", "person-name", profile.name));
        if (profile.role) info.append(element("span", "person-role", profile.role));
        card.type = "button";
        card.setAttribute("aria-haspopup", "dialog");
        card.append(avatar(profile, true), info);
        card.addEventListener("click", () => showProfile(profile));
        item.append(card);
        list.append(item);
      }
      panels[index].prepend(list);
    } else {
      panels[index].prepend(element("p", "", "There are no profiles in this group yet."));
    }

    tab.addEventListener("click", () => selectTab(index));
    tab.addEventListener("keydown", event => {
      let next;
      switch (event.key) {
        case "ArrowLeft": next = (index + tabs.length - 1) % tabs.length; break;
        case "ArrowRight": next = (index + 1) % tabs.length; break;
        case "Home": next = 0; break;
        case "End": next = tabs.length - 1; break;
        default: return;
      }
      event.preventDefault();
      selectTab(next);
      tabs[next].focus();
    });
  });

  directory.hidden = false;
}

function renderGroupPhotos(photos) {
  if (!photos?.length) {
    const message = document.getElementById("group-photo-message");
    message.textContent = photos ? "There are no group photos yet." : "Group photos are currently unavailable.";
    message.hidden = false;
    return;
  }

  const grid = document.getElementById("group-photo-grid");
  const dialog = document.getElementById("photo-dialog");
  const image = dialog.querySelector("img");
  const caption = document.getElementById("photo-caption");
  for (const { src, caption: description } of photos) {
    const item = element("figure", "gallery-item");
    const link = element("a", "gallery-photo");
    const preview = element("img");
    preview.alt = "";
    preview.loading = "lazy";
    preview.decoding = "async";
    preview.src = src;
    link.href = src;
    link.setAttribute("aria-label", `View photo: ${description}`);
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      image.src = link.href;
      caption.textContent = description;
      dialog.showModal();
    });
    link.append(preview);
    item.append(link, element("figcaption", "", description));
    grid.append(item);
  }

  const dupuisPhotos = ["01-anastrepha-working-group.webp", "02-dupuis-lab-visit.webp"];
  document.getElementById("group-photo-credit").hidden = !photos.some(({ src }) => dupuisPhotos.includes(src.split("/").at(-1)));
}

function enableProfileAccess() {
  const profileAccessPassword = "student@labev_website";
  const note = document.querySelector(".profile-access");
  const trigger = note.querySelector("button");
  const dialog = document.getElementById("profile-access-dialog");
  const form = dialog.querySelector(".profile-access-form");
  const password = document.getElementById("profile-access-password");
  const error = document.getElementById("profile-access-error");
  const clearError = () => {
    password.removeAttribute("aria-invalid");
    error.textContent = "";
  };

  trigger.addEventListener("click", () => dialog.showModal());
  password.addEventListener("input", clearError);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (password.value.trim() !== profileAccessPassword) {
      password.setAttribute("aria-invalid", "true");
      error.textContent = "That password is incorrect. Try again.";
      password.focus();
      password.select();
      return;
    }

    window.open("People/editar-perfil.html", "_blank", "noopener");
    dialog.close();
  });
  dialog.addEventListener("close", () => {
    form.reset();
    clearError();
  });
  note.hidden = false;
}

function followNavigation() {
  const header = document.querySelector(".site-header");
  const links = [...document.querySelectorAll(".site-nav a")];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  let queued = false;
  let lastActive;
  const update = () => {
    queued = false;
    const threshold = header.getBoundingClientRect().bottom + 44;
    let active = sections.findLastIndex(section => section.getBoundingClientRect().top <= threshold);
    const page = document.documentElement;
    if (active >= 0 && page.scrollTop + page.clientHeight >= page.scrollHeight - 2) active = sections.length - 1;
    if (lastActive === active) return;
    lastActive = active;
    links.forEach((link, index) => {
      if (index === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  const scheduleUpdate = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  addEventListener("scroll", scheduleUpdate, { passive: true });
  addEventListener("resize", scheduleUpdate);
  showLegacyGallery();
  addEventListener("hashchange", showLegacyGallery);
  update();
}

function showLegacyGallery() {
  if (location.hash === "#News") document.getElementById("Group-Photos").scrollIntoView();
}

function revealOnScroll() {
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove("reveal-pending");
      observer.unobserve(entry.target);
    }
  });
  for (const node of document.querySelectorAll("[data-reveal]")) {
    if (node.getBoundingClientRect().top > innerHeight) {
      node.classList.add("reveal-pending");
      observer.observe(node);
    }
  }
}

function enableHeroScrolling() {
  let frameId;
  const stop = () => {
    if (frameId === undefined) return;
    cancelAnimationFrame(frameId);
    frameId = undefined;
  };
  addEventListener("wheel", stop, { passive: true });
  addEventListener("touchstart", stop, { passive: true });
  addEventListener("popstate", stop);
  const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"]);
  addEventListener("keydown", event => {
    if (scrollKeys.has(event.key)) stop();
  });

  for (const link of document.querySelectorAll(".hero-actions a[href^='#']")) {
    const section = document.getElementById(link.hash.slice(1));
    link.addEventListener("click", event => {
      if (!section || event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      stop();
      let updateFragmentAfterScroll = false;
      if (location.hash !== link.hash) {
        try {
          history.pushState(history.state, "", link.hash);
        } catch {
          updateFragmentAfterScroll = true;
        }
      }

      const page = document.documentElement;
      const start = window.scrollY;
      const padding = parseFloat(getComputedStyle(page).scrollPaddingTop) || 0;
      const limit = Math.max(0, page.scrollHeight - page.clientHeight);
      const end = Math.max(0, Math.min(limit, start + section.getBoundingClientRect().top - padding));
      const distance = end - start;
      const duration = Math.max(690, Math.min(1180, 590 + Math.abs(distance) * .24));
      let startedAt;
      const finish = () => {
        frameId = undefined;
        if (updateFragmentAfterScroll) location.hash = link.hash;
        section.tabIndex = -1;
        section.focus({ preventScroll: true });
      };
      const step = now => {
        startedAt ??= now;
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress * progress * (3 - 2 * progress);
        window.scrollTo({ top: start + distance * eased, behavior: "instant" });
        if (progress < 1) frameId = requestAnimationFrame(step);
        else finish();
      };
      if (Math.abs(distance) < 1) finish();
      else frameId = requestAnimationFrame(step);
    });
  }
}

function enableHeroPhotoRotation() {
  const stage = document.getElementById("hero-slides");
  const list = document.getElementById("hero-photo-list");
  const credit = document.getElementById("hero-credit");
  const caption = credit.parentElement;
  const initialPhoto = stage.querySelector("img");
  const photos = [initialPhoto, ...list.content.querySelectorAll("img")];
  if (photos.length < 2) return;

  const pointerCanHover = matchMedia("(hover: hover)");
  let activeImage = initialPhoto;
  let index = 0;
  let inView = true;
  let loading = false;

  const canAdvance = () => inView && !document.hidden && !caption.contains(document.activeElement)
    && !(pointerCanHover.matches && caption.matches(":hover"));
  const updateCredit = photo => {
    const { credit: label, source } = photo.dataset;
    if (source) {
      const link = element("a", "", label);
      link.href = source;
      credit.replaceChildren(link);
    } else {
      credit.textContent = label;
    }
  };

  const advance = async () => {
    if (loading || !canAdvance()) return;
    loading = true;
    index = (index + 1) % photos.length;

    try {
      const image = document.importNode(photos[index], false);
      image.removeAttribute("fetchpriority");
      image.decoding = "async";
      await image.decode();
      if (!canAdvance()) return;

      const previous = activeImage;
      previous.className = "hero-slide is-leaving";
      previous.setAttribute("aria-hidden", "true");
      image.className = "hero-slide is-entering";
      image.removeAttribute("aria-hidden");
      stage.append(image);
      activeImage = image;
      updateCredit(image);
      setTimeout(() => previous.remove(), 1250);
    } catch {
      // A missing photo leaves the current one in place until the next interval.
    } finally {
      loading = false;
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; });
    observer.observe(stage);
  }
  setInterval(advance, 6200);
}

renderDirectory(window.LABEV_PEOPLE);
renderGroupPhotos(window.LABEV_GROUP_PHOTOS);
enableProfileAccess();
followNavigation();
revealOnScroll();
enableHeroScrolling();
enableHeroPhotoRotation();

for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
}
