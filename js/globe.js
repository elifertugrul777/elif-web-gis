// Orthographic projection of a rotating 3D sphere. All geography is bundled.
(() => {
  const canvas = document.getElementById("globe-3d");
  if (!canvas || !window.WORLD_COUNTRIES) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const radians = Math.PI / 180;
  const tilt = 20 * radians;
  const rings = window.WORLD_COUNTRIES.features.flatMap((f) =>
    f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates,
  );
  function inside(point, ring) {
    let result = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x, y] = ring[i],
        [u, v] = ring[j];
      if (
        y > point[1] !== v > point[1] &&
        point[0] < ((u - x) * (point[1] - y)) / (v - y) + x
      )
        result = !result;
    }
    return result;
  }
  const land = [];
  const bounded = rings.map((p) => ({
    p,
    minX: Math.min(...p[0].map((x) => x[0])),
    maxX: Math.max(...p[0].map((x) => x[0])),
    minY: Math.min(...p[0].map((x) => x[1])),
    maxY: Math.max(...p[0].map((x) => x[1])),
  }));
  for (let lat = -84; lat <= 84; lat += 2)
    for (let lon = -180; lon < 180; lon += 2) {
      if (
        bounded.some(
          (b) =>
            lon >= b.minX &&
            lon <= b.maxX &&
            lat >= b.minY &&
            lat <= b.maxY &&
            inside([lon, lat], b.p[0]) &&
            !b.p.slice(1).some((h) => inside([lon, lat], h)),
        )
      )
        land.push([lon, lat]);
    }
  let angle = -12 * radians,
    width = 0,
    height = 0,
    radius = 0,
    last = 0;
  let dragging = false,
    previousX = 0,
    paused = false;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function project(lon, lat) {
    const a = lon * radians + angle,
      b = lat * radians;
    const x = Math.cos(b) * Math.sin(a),
      y = Math.sin(b),
      z = Math.cos(b) * Math.cos(a);
    return {
      x: width / 2 + radius * x,
      y: height / 2 - radius * (y * Math.cos(tilt) - z * Math.sin(tilt)),
      z: y * Math.sin(tilt) + z * Math.cos(tilt),
    };
  }
  function line(points, color, lineWidth) {
    ctx.beginPath();
    let pen = false;
    for (const [lon, lat] of points) {
      const p = project(lon, lat);
      if (p.z > 0) {
        if (pen) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
        pen = true;
      } else pen = false;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.shadowColor = "#88977b33";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 16;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    const ocean = ctx.createRadialGradient(
      width * 0.35,
      height * 0.3,
      0,
      width / 2,
      height / 2,
      radius * 1.1,
    );
    ocean.addColorStop(0, "#e1f2f8");
    ocean.addColorStop(0.65, "#a9cfdf");
    ocean.addColorStop(1, "#5b859f");
    ctx.fillStyle = ocean;
    ctx.fill();
    ctx.restore();
    for (const [lon, lat] of land) {
      const p = project(lon, lat);
      if (p.z <= 0) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, radius * 0.017 * Math.sqrt(p.z)), 0, Math.PI * 2);
      ctx.fillStyle = "#eee9dc";
      ctx.fill();
    }
    for (let lat = -60; lat <= 60; lat += 30)
      line(
        Array.from({ length: 181 }, (_, i) => [i * 2 - 180, lat]),
        "#ffffff40",
        0.6,
      );
    for (let lon = -180; lon < 180; lon += 30)
      line(
        Array.from({ length: 91 }, (_, i) => [lon, i * 2 - 90]),
        "#ffffff40",
        0.6,
      );
    for (const polygon of rings)
      for (const ring of polygon) line(ring, "#8b8d8490", 0.65);
    for (const place of window.ELIF_PLACES || []) {
      const p = project(place.lng, place.lat);
      if (p.z < 0.05) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#526c42";
      ctx.fill();
    }
    const shade = ctx.createRadialGradient(
      width * 0.37,
      height * 0.32,
      radius * 0.3,
      width / 2,
      height / 2,
      radius,
    );
    shade.addColorStop(0, "#ffffff00");
    shade.addColorStop(0.75, "#26364b08");
    shade.addColorStop(1, "#26364b65");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width;
    height = box.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = Math.min(width, height) * 0.4;
    draw();
  }
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    previousX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragging) {
      angle += (e.clientX - previousX) * 0.006;
      previousX = e.clientX;
      draw();
    }
  });
  canvas.addEventListener("pointerup", () => (dragging = false));
  canvas.addEventListener("pointercancel", () => (dragging = false));
  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
    last = 0;
  });
  new ResizeObserver(resize).observe(canvas);
  function frame(time) {
    if (last && !paused && !dragging && !reduced.matches)
      angle += Math.min(time - last, 50) * 0.00013;
    last = time;
    if (!paused) draw();
    requestAnimationFrame(frame);
  }
  resize();
  requestAnimationFrame(frame);
})();
