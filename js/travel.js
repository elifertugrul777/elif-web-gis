(() => {
  const $ = (id) => document.getElementById(id);
  const storageKey = "elif-personal-atlas-v1";
  const allowedCategories = ["city", "restaurant", "museum", "nature", "other"];
  const allowedStatuses = ["visited", "wishlist"];
  function valid(p) {
    return (
      p &&
      typeof p.name === "string" &&
      p.name.trim().length > 0 &&
      p.name.length <= 100 &&
      typeof p.lat === "number" &&
      Number.isFinite(p.lat) &&
      Math.abs(p.lat) <= 85 &&
      typeof p.lng === "number" &&
      Number.isFinite(p.lng) &&
      Math.abs(p.lng) <= 180 &&
      allowedCategories.includes(p.category) &&
      allowedStatuses.includes(p.status) &&
      (p.note === undefined || (typeof p.note === "string" && p.note.length <= 500)) &&
      (p.region === undefined || (typeof p.region === "string" && p.region.length <= 100))
    );
  }
  function clean(p, i) {
    return {
      id: typeof p.id === "string" ? p.id : "place-" + Date.now() + "-" + i,
      name: p.name.trim(),
      region: p.region || "",
      lat: p.lat,
      lng: p.lng,
      category: p.category,
      status: p.status,
      note: p.note || "",
      source:
        typeof p.source === "string" && /^https:\/\//.test(p.source) ? p.source : "",
    };
  }
  const base = (window.ELIF_PLACES || []).filter(valid).map(clean);
  let local = [],
    storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(saved)) local = saved.filter(valid).map(clean);
  } catch (e) {
    storageAvailable = false;
  }
  let demo = false,
    filter = "all",
    query = "",
    map = null,
    markerLayer = null;
  const dialog = $("place-dialog");
  function allPlaces() {
    return demo ? window.EXAMPLE_PLACES : [...base, ...local];
  }
  function visible() {
    return allPlaces().filter(
      (p) =>
        (filter === "all" || p.status === filter || p.category === filter) &&
        `${p.name} ${p.region} ${p.note}`.toLocaleLowerCase().includes(query),
    );
  }
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(local));
      return true;
    } catch (e) {
      storageAvailable = false;
      return false;
    }
  }
  function render() {
    const places = visible(),
      list = $("place-list");
    list.replaceChildren();
    $("place-count").textContent = places.length;
    $("visited-count").textContent =
      allPlaces().filter((p) => p.status === "visited").length + " visited";
    $("wish-count").textContent =
      allPlaces().filter((p) => p.status === "wishlist").length + " wishlist";
    if (!places.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      const symbol = document.createElement("span");
      symbol.textContent = "◎";
      const title = document.createElement("h3");
      title.textContent = allPlaces().length
        ? "No matching places."
        : "Your story starts here.";
      const text = document.createElement("p");
      text.textContent = allPlaces().length
        ? "Try another filter or search."
        : "Add your first city, restaurant or museum. Or try example places to preview the design.";
      empty.append(symbol, title, text);
      list.append(empty);
    }
    for (const p of places) {
      const row = document.createElement("div");
      row.className = "place-row";
      const button = document.createElement("button");
      button.className = "place-item";
      const top = document.createElement("span");
      top.className = "place-type";
      top.textContent = p.category.toUpperCase() + " / " + p.status.toUpperCase();
      const name = document.createElement("strong");
      name.textContent = p.name;
      const sub = document.createElement("span");
      sub.className = "place-region";
      sub.textContent = p.region || "A place in your atlas";
      const dot = document.createElement("i");
      dot.className = "dot " + (p.status === "visited" ? "green" : "gold");
      button.append(top, name, sub, dot);
      button.onclick = () => {
        if (!map) return;
        map.setView(
          [p.lat, p.lng],
          Math.max(
            map.getZoom(),
            p.category === "city" ? 6 : p.category === "nature" ? 8 : 14,
          ),
        );
        const marker = markerLayer.getLayers().find((m) => m.placeId === p.id);
        if (marker) marker.openPopup();
      };
      row.append(button);
      if (!demo && local.some((x) => x.id === p.id)) {
        const del = document.createElement("button");
        del.className = "delete-place";
        del.textContent = "×";
        del.setAttribute("aria-label", "Delete " + p.name);
        del.onclick = () => {
          if (confirm("Remove " + p.name + " from this browser’s atlas?")) {
            local = local.filter((x) => x.id !== p.id);
            persist();
            render();
          }
        };
        row.append(del);
      }
      list.append(row);
    }
    renderMarkers();
  }
  function popup(p) {
    const box = document.createElement("div");
    box.className = "place-popup";
    const type = document.createElement("small");
    type.textContent = p.category + " / " + p.status;
    const title = document.createElement("h3");
    title.textContent = p.name;
    const region = document.createElement("p");
    region.textContent = p.region;
    const note = document.createElement("p");
    note.textContent = p.note;
    box.append(type, title, region, note);
    if (p.source) {
      const link = document.createElement("a");
      link.href = p.source;
      link.textContent = "Destination information ↗";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      box.append(link);
    }
    return box;
  }
  function renderMarkers() {
    if (!map) return;
    markerLayer.clearLayers();
    const shown = map.getZoom() > 4;
    $("zoom-status").textContent = shown
      ? `${visible().length} places match your filters`
      : "Zoom in above level 4 to see place markers.";
    if (!shown) return;
    for (const p of visible()) {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: p.category === "city" ? 8 : 6,
        color: "#ffffff",
        weight: 2,
        fillColor: p.status === "visited" ? "#526c42" : "#b27536",
        fillOpacity: 1,
      }).bindPopup(popup(p));
      marker.placeId = p.id;
      marker.addTo(markerLayer);
    }
  }
  if (window.L) {
    map = L.map("travel-map", {
      minZoom: 1,
      maxZoom: 19,
      maxBounds: [
        [-85, -180],
        [85, 180],
      ],
      maxBoundsViscosity: 1,
      zoomControl: false,
    }).setView([46, 3], 5);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    // Keep offline geography BELOW street tiles, never over them.
    const fallbackPane = map.createPane("fallback-world");
    fallbackPane.style.zIndex = "150";
    fallbackPane.style.pointerEvents = "none";
    L.geoJSON(window.WORLD_COUNTRIES, {
      pane: "fallback-world",
      interactive: false,
      style: { color: "#b8b4a1", weight: 0.7, fillColor: "#f2efe9", fillOpacity: 1 },
    }).addTo(map);
    map.attributionControl.addAttribution(
      '<a href="https://www.naturalearthdata.com/">Natural Earth</a>',
    );
    const note = $("basemap-note");
    if (location.protocol === "http:" || location.protocol === "https:") {
      note.textContent =
        "OpenStreetMap street detail · bundled world map available as fallback.";
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        noWrap: true,
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      tiles.on("tileerror", () => {
        note.textContent =
          "Some map tiles could not load. Loaded tiles remain visible; zoom or pan to load more.";
      });
      tiles.on("load", () => {
        note.textContent =
          "OpenStreetMap · original colours. An internet connection is required for street detail.";
      });
    } else {
      note.textContent =
        "Offline world map · for street detail, open with Go Live in VS Code or double-click BASLAT.bat.";
    }
    markerLayer = L.layerGroup().addTo(map);
    map.on("zoomend", renderMarkers);
    map.on("click", (e) => {
      $("place-lat").value = e.latlng.lat.toFixed(6);
      $("place-lng").value = e.latlng.lng.toFixed(6);
      $("save-message").textContent = "Coordinates selected from the map.";
      dialog.showModal();
    });
  } else {
    $("map-error").hidden = false;
  }
  $("reset-map").onclick = () => {
    if (map) map.setView([46, 3], 5);
  };
  document.querySelectorAll("[data-filter]").forEach(
    (button) =>
      (button.onclick = () => {
        filter = button.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach((b) => {
          b.classList.toggle("active", b === button);
          b.setAttribute("aria-pressed", String(b === button));
        });
        render();
      }),
  );
  $("place-search").oninput = (e) => {
    query = e.target.value.toLocaleLowerCase();
    render();
  };
  $("demo-toggle").onclick = () => {
    demo = !demo;
    $("demo-toggle").textContent = demo ? "Return to my places" : "Try example places";
    $("demo-toggle").setAttribute("aria-pressed", String(demo));
    $("demo-notice").hidden = !demo;
    render();
    if (map && demo) map.setView([46, 12], 5);
  };
  $("add-place").onclick = () => {
    $("save-message").textContent = "";
    dialog.showModal();
  };
  document.querySelector(".close-dialog").onclick = () => dialog.close();
  $("place-form").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const p = {
      id: "place-" + Date.now() + "-" + Math.random().toString(36).slice(2),
      name: String(f.get("name")).trim(),
      region: String(f.get("region")).trim(),
      lat: Number(f.get("lat")),
      lng: Number(f.get("lng")),
      category: f.get("category"),
      status: f.get("status"),
      note: String(f.get("note")).trim(),
    };
    if (!valid(p)) {
      $("save-message").textContent = "Check the place name and coordinate ranges.";
      return;
    }
    local.push(p);
    const saved = persist();
    demo = false;
    filter = "all";
    query = "";
    $("place-search").value = "";
    $("demo-notice").hidden = true;
    $("demo-toggle").textContent = "Try example places";
    $("demo-toggle").setAttribute("aria-pressed", "false");
    document.querySelectorAll("[data-filter]").forEach((b) => {
      const active = b.dataset.filter === "all";
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    dialog.close();
    e.target.reset();
    render();
    if (map)
      map.setView(
        [p.lat, p.lng],
        p.category === "city" ? 6 : p.category === "nature" ? 8 : 14,
      );
    $("import-message").textContent = saved
      ? "Place saved in this browser."
      : "Place added for this session. Browser storage is unavailable; export to keep it.";
  };
  $("export-places").onclick = () => {
    const blob = new Blob([JSON.stringify([...base, ...local], null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "elif-places.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $("import-places").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2000000) throw Error("Use a JSON file smaller than 2 MB.");
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data) || data.length > 1000 || !data.every(valid))
        throw Error(
          "Use an exported atlas JSON file with valid place records (maximum 1,000).",
        );
      const combined = [...base, ...local];
      const unique = data.filter(
        (p) =>
          !combined.some((x) => x.name === p.name && x.lat === p.lat && x.lng === p.lng),
      );
      local.push(
        ...unique.map((p, i) => clean({ ...p, id: "import-" + Date.now() + "-" + i }, i)),
      );
      const saved = persist();
      render();
      $("import-message").textContent =
        `${unique.length} places imported. ${saved ? "Saved in this browser." : "Export to keep a copy; browser storage is unavailable."}`;
    } catch (err) {
      $("import-message").textContent = err.message || "Could not import this file.";
    }
    e.target.value = "";
  };
  render();
  if (!storageAvailable)
    $("import-message").textContent =
      "Browser storage is unavailable. Export your places to keep them.";
})();
