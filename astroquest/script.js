
/* ========================================
   ASTROQUEST - LOCATION DATA
======================================== */

const locations = {
  atacama: {
    name: "Atacama Desert",
    tag: "CHILE | SOUTH AMERICA",
    description:
      "The Atacama Desert is one of the driest regions on Earth. Its extremely low rainfall, mineral-rich soils and challenging conditions make it useful for testing some instruments and research methods relevant to Mars exploration. Scientists can investigate soil chemistry, microbial survival and robotic field operations.",
    value:
      "Extreme aridity, soil chemistry and field testing.",
    connection:
      "Selected Mars surface and exploration conditions.",
    limitation:
      "The Atacama still has Earth's atmosphere, gravity and magnetic protection. It cannot reproduce the Martian environment.",
    coordinates: [-23.0, -68.2]
  },

  mcmurdo: {
    name: "McMurdo Dry Valleys",
    tag: "ANTARCTICA",
    description:
      "The McMurdo Dry Valleys are a group of cold, dry valleys in Antarctica. Their exposed rocks, frozen ground, glaciers and unusual liquid-water systems provide a valuable setting for studying cold-desert processes and the limits of life.",
    value:
      "Cold-desert geology, ice, water and microbial life.",
    connection:
      "Research into polar environments, ice and possible habitats.",
    limitation:
      "Antarctica is still on Earth. Its atmosphere, gravity and radiation conditions are not the same as those on the Moon or Mars.",
    coordinates: [-77.5, 162.0]
  },

  mauna: {
    name: "Mauna Kea",
    tag: "HAWAII | UNITED STATES",
    description:
      "Mauna Kea is a high volcanic mountain on the island of Hawaii. Its volcanic rocks, cinder cones, rocky surfaces and high-altitude environment can support geological studies and the testing of equipment and exploration procedures.",
    value:
      "Volcanic materials, rocky terrain and field operations.",
    connection:
      "Planetary geology and preparation for surface exploration.",
    limitation:
      "Mauna Kea does not reproduce lunar vacuum, Martian atmospheric pressure, reduced gravity or space radiation.",
    coordinates: [19.82, -155.47]
  }
};


/* ========================================
   ICONS
======================================== */

function refreshIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

refreshIcons();


/* ========================================
   MOBILE MENU
======================================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");

  menuToggle.innerHTML = isOpen
    ? '<i data-lucide="x"></i>'
    : '<i data-lucide="menu"></i>';

  refreshIcons();
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");

    menuToggle.innerHTML = '<i data-lucide="menu"></i>';
    refreshIcons();
  });
});


/* ========================================
   SCROLL REVEAL
======================================== */

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(element => {
  revealObserver.observe(element);
});


/* ========================================
   LOCATION MODAL
======================================== */

const modal = document.getElementById("locationModal");
const modalClose = document.getElementById("modalClose");

let selectedLocation = "atacama";

function openLocation(locationId) {
  const data = locations[locationId];

  if (!data) return;

  selectedLocation = locationId;

  document.getElementById("modalTag").textContent = data.tag;
  document.getElementById("modalTitle").textContent = data.name;
  document.getElementById("modalDescription").textContent = data.description;
  document.getElementById("modalValue").textContent = data.value;
  document.getElementById("modalConnection").textContent = data.connection;
  document.getElementById("modalLimitation").textContent = data.limitation;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".details-btn").forEach(button => {
  button.addEventListener("click", () => {
    openLocation(button.dataset.location);
  });
});

modalClose.addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});


/* ========================================
   REAL INTERACTIVE MAP
======================================== */

let worldMap = null;

const mapMarkers = {};

function createPopup(locationId) {
  const data = locations[locationId];

  return `
    <div class="map-popup">
      <strong>${data.name}</strong>
      <p>${data.tag}</p>
      <button onclick="openLocation('${locationId}')">
        Explore Details
      </button>
    </div>
  `;
}

function initializeMap() {

  const mapElement = document.getElementById("worldMap");

  if (!mapElement || typeof L === "undefined") {
    console.error("Leaflet map could not be loaded.");
    return;
  }

  worldMap = L.map("worldMap", {
    center: [15, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true
  });

  // Satellite imagery
  const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      maxZoom: 18
    }
  );

  // Standard street map
  const streetLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  );

  // Terrain map
  const terrainLayer = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17
    }
  );

  satelliteLayer.addTo(worldMap);

  L.control.layers(
    {
      "Satellite Imagery": satelliteLayer,
      "Street Map": streetLayer,
      "Terrain": terrainLayer
    },
    null,
    {
      collapsed: false,
      position: "topright"
    }
  ).addTo(worldMap);

  // Add the three research locations
  Object.entries(locations).forEach(([id, data]) => {

    const marker = L.marker(data.coordinates).addTo(worldMap);

    marker.bindPopup(createPopup(id));

    mapMarkers[id] = marker;

    marker.on("click", () => {
      setActiveMapLocation(id);
    });

  });

  fitAllLocations();

  setTimeout(() => {
    worldMap.invalidateSize();
  }, 300);
}

function fitAllLocations() {
  if (!worldMap) return;

  const allCoordinates = Object.values(locations).map(
    location => location.coordinates
  );

  worldMap.fitBounds(allCoordinates, {
    padding: [45, 45],
    maxZoom: 3
  });
}


/* ========================================
   MAP NAVIGATION
======================================== */

function setActiveMapLocation(locationId) {

  const data = locations[locationId];

  if (!data || !worldMap) return;

  document.querySelectorAll(".map-location").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.map === locationId
    );
  });

  worldMap.flyTo(data.coordinates, 7, {
    duration: 1.5
  });

  if (mapMarkers[locationId]) {
    setTimeout(() => {
      mapMarkers[locationId].openPopup();
    }, 1200);
  }
}

document.querySelectorAll(".map-location").forEach(button => {
  button.addEventListener("click", () => {
    setActiveMapLocation(button.dataset.map);
  });
});


/* ========================================
   RESET MAP
======================================== */

document.getElementById("resetMap").addEventListener("click", () => {

  fitAllLocations();

  document.querySelectorAll(".map-location").forEach(button => {
    button.classList.remove("active");
  });

});


/* ========================================
   MODAL MAP BUTTON
======================================== */

document.getElementById("modalMapButton").addEventListener("click", () => {

  const locationId = selectedLocation;

  closeModal();

  document.getElementById("map-section").scrollIntoView({
    behavior: "smooth"
  });

  setTimeout(() => {
    setActiveMapLocation(locationId);
  }, 700);

});


/* ========================================
   START
======================================== */

initializeMap();
