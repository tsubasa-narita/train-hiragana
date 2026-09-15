// Geometry is in KanjiVG's 109 × 109 coordinate system, independent of screen size.
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function sampleStroke(path) {
  const length = path.getTotalLength();
  const count = Math.ceil(length / .6);
  return Array.from({ length: count + 1 }, (_, i) => {
    const p = path.getPointAtLength(length * i / count);
    return { x: p.x, y: p.y, s: length * i / count };
  });
}

export function createTracker(points, initial = 0) {
  let index = Math.max(0, Math.min(points.length - 1, initial));
  let previous = null;
  const current = () => points[index];
  return {
    get index() { return index; },
    get point() { return current(); },
    get done() { return index === points.length - 1; },
    begin(p) {
      previous = distance(p, current()) <= 8 ? p : null;
      return !!previous;
    },
    end() { previous = null; },
    move(p) {
      if (!previous) return false;
      const from = previous;
      const steps = Math.max(1, Math.ceil(distance(from, p) / 1.5));
      // Check every piece of a fast input event: a straight shortcut cannot skip a bend.
      for (let step = 1; step <= steps; step++) {
        const q = { x: from.x + (p.x - from.x) * step / steps, y: from.y + (p.y - from.y) * step / steps };
        let best = index, gap = distance(q, current());
        const limit = current().s + 4;
        for (let j = index + 1; j < points.length && points[j].s <= limit; j++) {
          const d = distance(q, points[j]);
          if (d < gap - .001) { gap = d; best = j; }
        }
        if (gap > 7) { previous = null; return false; }
        index = best;
      }
      previous = p;
      return true;
    },
  };
}
