
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

const searchInput = document.querySelector("#locationSearch");
const filterButtons = document.querySelectorAll(".filter-button");
const locationCards = document.querySelectorAll(".location-card");

const siteDialog = document.querySelector("#siteDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogDescription = document.querySelector("#dialogDescription");
const dialogClose = document.querySelector("#dialogClose");

// 1. Open and close the mobile navigation menu
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  });
});

// 2. Search and filter the candidate locations
let activeFilter = "all";

function filterLocations() {
  const query = searchInput.value.trim().toLowerCase();

  locationCards.forEach((card) => {
    const name = card.dataset.name;
    const targets = card.dataset.target.split(" ");

    const matchesSearch = name.includes(query);
    const matchesFilter =
      activeFilter === "all" || targets.includes(activeFilter);

    card.hidden = !(matchesSearch && matchesFilter);
  });
}

searchInput.addEventListener("input", filterLocations);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    filterLocations();
  });

  button.setAttribute(
    "aria-pressed",
    String(button.classList.contains("active"))
  );
});

// 3. Temporary site descriptions for the prototype
// These are introductory summaries, not verified comparison results.
const siteProfiles = {
  atacama: {
    title: "Atacama Desert",
    description:
      "Located in Chile, the Atacama is an extremely arid environment. " +
      "Researchers can investigate selected aspects of dry environments here. " +
      "Any specific comparison with Mars requires verified data and sources."
  },

  haughton: {
    title: "Haughton Crater",
    description:
      "Located on Devon Island in the Canadian Arctic, Haughton Crater " +
      "is an impact structure in a polar desert environment. " +
      "Its relevance depends on the scientific question and the properties being studied."
  },

  iceland: {
    title: "Icelandic Volcanic Terrain",
    description:
      "Selected volcanic landscapes in Iceland may support research into " +
      "rocky terrain and field testing. A specific site must be identified " +
      "and its properties verified before drawing scientific conclusions."
  }
};

// 4. Open a location profile
document.querySelectorAll(".site-button").forEach((button) => {
  button.addEventListener("click", () => {
    const profile = siteProfiles[button.dataset.site];

    if (!profile) return;

    dialogTitle.textContent = profile.title;
    dialogDescription.textContent = profile.description;

    siteDialog.showModal();
  });
});

// 5. Close the location profile
dialogClose.addEventListener("click", () => {
  siteDialog.close();
});

// Close the dialog when the user clicks outside its panel
siteDialog.addEventListener("click", (event) => {
  if (event.target === siteDialog) {
    siteDialog.close();
  }
});
