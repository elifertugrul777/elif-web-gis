(() => {
  const $ = (id) => document.getElementById(id);
  const entries = window.ELIF_WORDS || [];
  let selected = entries[0],
    map,
    view,
    ideasSource,
    clustered,
    ideasLayer;
  const fields = ["theme", "language", "kind"];
  for (const field of fields) {
    for (const value of [...new Set(entries.map((x) => x[field]))].sort()) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      $("words-" + field).append(option);
    }
  }
  function node(tag, text, cls) {
    const el = document.createElement(tag);
    el.textContent = text;
    el.setAttribute("dir", "auto");
    if (cls) el.className = cls;
    return el;
  }
  function detail(entry) {
    selected = entry;
    const box = $("word-detail");
    box.replaceChildren();
    const head = node("div", "", "word-detail-head");
    head.append(
      node("p", `${entry.language} / ${entry.kind} / ${entry.theme}`, "eyebrow"),
      node("h2", entry.text),
    );
    box.append(head);
    const meanings = node("div", "", "word-meanings");
    for (const [label, text] of [
      ["TÜRKÇE", entry.meaningTR],
      ["ENGLISH", entry.meaningEN],
    ]) {
      const part = node("div", "");
      part.append(node("small", label), node("p", text));
      meanings.append(part);
    }
    box.append(meanings);
    const grid = node("div", "", "word-facts");
    for (const [label, text] of [
      ["MEANING & CONTEXT", entry.context],
      ["PURPOSE / REFLECTION", entry.purpose],
      ["LOCATION CONNECTION", entry.city + " — " + entry.connection],
      ["DATE & EVIDENCE", entry.date],
    ]) {
      const part = node("section", "");
      part.append(node("h3", label), node("p", text));
      grid.append(part);
    }
    box.append(grid);
    const source = node("a", "Read the source ↗", "text-link");
    source.href = entry.source;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    box.append(source);
    box.append(
      node(
        "p",
        "Translations and explanations are editorial. The location and date labels state the limits of the evidence.",
        "small-note",
      ),
    );
    document
      .querySelectorAll("[data-word-id]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.wordId === entry.id)),
      );
    if (ideasLayer) ideasLayer.changed();
  }
  function focus(entry) {
    detail(entry);
    if (view)
      view.animate({
        center: ol.proj.fromLonLat(entry.coordinates),
        zoom: 6,
        duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450,
      });
    $("world-coordinates").textContent = entry.city;
  }
  function filtered() {
    const q = $("words-search").value.trim().toLocaleLowerCase();
    return entries.filter(
      (e) =>
        fields.every(
          (f) => $("words-" + f).value === "all" || $("words-" + f).value === e[f],
        ) &&
        `${e.text} ${e.language} ${e.theme} ${e.city} ${e.meaningTR} ${e.meaningEN}`
          .toLocaleLowerCase()
          .includes(q),
    );
  }
  function updateZoom() {
    if (view)
      $("words-zoom").textContent =
        view.getZoom() > 4
          ? "Click a numbered point to explore its ideas."
          : "Zoom in above level 4, or choose an idea from the list.";
  }
  function render() {
    const list = $("words-list"),
      visible = filtered();
    list.replaceChildren();
    $("words-count").textContent = `${visible.length} of ${entries.length} ideas`;
    if (!visible.length)
      list.append(
        node("p", "No matching ideas. Try another search or filter.", "small-note"),
      );
    for (const e of visible) {
      const b = node("button", "", "place-item word-list-item");
      b.type = "button";
      b.dataset.wordId = e.id;
      b.setAttribute("aria-pressed", String(selected?.id === e.id));
      b.append(
        node("span", e.language + " / " + e.theme, "place-type"),
        node("strong", e.text),
        node("span", e.city, "place-region"),
      );
      b.onclick = () => focus(e);
      list.append(b);
    }
    if (ideasSource) {
      ideasSource.clear();
      ideasSource.addFeatures(
        visible.map(
          (e) =>
            new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.fromLonLat(e.coordinates)),
              entry: e,
            }),
        ),
      );
    }
    if (visible.length && !visible.some((e) => e.id === selected?.id)) detail(visible[0]);
    if (!visible.length) {
      selected = null;
      $("word-detail").replaceChildren(
        node("h2", "No matching ideas."),
        node("p", "Clear the search or choose another filter."),
      );
    }
  }
  $("words-search").oninput = render;
  for (const f of fields) $("words-" + f).onchange = render;
  if (window.ol) {
    view = new ol.View({
      center: ol.proj.fromLonLat([5, 30]),
      zoom: 2,
      minZoom: 1,
      maxZoom: 19,
      extent: ol.proj.get("EPSG:3857").getExtent(),
      multiWorld: false,
      showFullExtent: true,
    });
    const countries = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(window.WORLD_COUNTRIES, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }),
        wrapX: false,
        attributions: '<a href="https://www.naturalearthdata.com/">Natural Earth</a>',
      }),
      style: new ol.style.Style({
        fill: new ol.style.Fill({ color: "#f2efe9" }),
        stroke: new ol.style.Stroke({ color: "#b8b4a1", width: 0.7 }),
      }),
    });
    const layers = [countries];
    if (["http:", "https:"].includes(location.protocol)) {
      const osm = new ol.source.OSM({ wrapX: false });
      layers.push(new ol.layer.Tile({ source: osm }));
      $("basemap-note").textContent = "OpenStreetMap · original colours.";
      osm.on("tileloaderror", () => {
        $("basemap-note").textContent =
          "Some tiles could not load. Loaded map tiles stay visible; pan or zoom to load more.";
      });
    } else
      $("basemap-note").textContent =
        "Offline world overview. Use Go Live for OpenStreetMap street detail.";
    ideasSource = new ol.source.Vector({ wrapX: false });
    clustered = new ol.source.Cluster({ distance: 38, source: ideasSource });
    ideasLayer = new ol.layer.Vector({
      source: clustered,
      style: (feature) => {
        if (view.getZoom() <= 4) return null;
        const members = feature.get("features");
        const active = members.some((f) => f.get("entry").id === selected?.id);
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: members.length > 1 ? 17 : 12,
            fill: new ol.style.Fill({ color: active ? "#263b29" : "#526c42" }),
            stroke: new ol.style.Stroke({ color: "#fffdf5", width: 2 }),
          }),
          text: new ol.style.Text({
            text: members.length > 1 ? String(members.length) : "•",
            font: "600 13px Arial",
            fill: new ol.style.Fill({ color: "#fffdf5" }),
          }),
        });
      },
    });
    layers.push(ideasLayer);
    map = new ol.Map({
      target: "world-map",
      layers,
      view,
      controls: ol.control.defaults.defaults({
        attributionOptions: { collapsible: false },
      }),
    });
    view.on("change:resolution", () => {
      updateZoom();
      ideasLayer.changed();
    });
    map.on("singleclick", (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f, {
        layerFilter: (l) => l === ideasLayer,
        hitTolerance: 6,
      });
      if (!feature) return;
      const members = feature.get("features").map((f) => f.get("entry"));
      detail(members[0]);
      $("world-coordinates").textContent = members[0].city;
      if (members.length > 1) {
        const group = node("div", "", "word-neighbours");
        group.append(node("p", "Other ideas at this location:", "small-note"));
        for (const e of members) {
          const b = node("button", e.text, "filter");
          b.type = "button";
          b.onclick = () => {
            detail(e);
            $("world-coordinates").textContent = e.city;
          };
          group.append(b);
        }
        $("word-detail").prepend(group);
      }
      $("word-detail").scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
      });
    });
    map.on("pointermove", (e) => {
      map.getTargetElement().style.cursor = map.hasFeatureAtPixel(e.pixel, {
        layerFilter: (l) => l === ideasLayer,
      })
        ? "pointer"
        : "";
    });
  } else $("world-error").hidden = false;
  $("world-reset").onclick = () => {
    if (view)
      view.animate({ center: ol.proj.fromLonLat([5, 30]), zoom: 2, duration: 350 });
    $("world-coordinates").textContent = "Choose an idea from the list or map.";
  };
  render();
  if (selected) detail(selected);
  updateZoom();
})();
