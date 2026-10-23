(() => {
  const CITIES = [
    { id: 'la-serena', name: 'La Serena', region: 'Región de Coquimbo', pin: [1328, 5417, 64, 80], label: [1551, 5418, 337, 79], side: 'r' },
    { id: 'malloco', name: 'Malloco', region: 'Región Metropolitana', pin: [1361, 5757, 64, 80], label: [1538, 5761, 337, 79], side: 'r' },
    { id: 'san-fernando', name: 'San Fernando', region: 'Región de O’Higgins', pin: [1224, 5838, 63, 80], label: [755, 5842, 338, 79], side: 'l' },
    { id: 'linares', name: 'Linares', region: 'Región del Maule', pin: [1308, 6015, 64, 80], label: [1680, 6022, 337, 79], side: 'r' },
    { id: 'chillan', name: 'Chillán', region: 'Región de Ñuble', pin: [1166, 6056, 64, 80], label: [596, 6054, 338, 79], side: 'l' },
    { id: 'lautaro', name: 'Lautaro', region: 'Región de La Araucanía', pin: [1238, 6326, 64, 80], label: [1456, 6322, 337, 79], side: 'r' },
  ];
  const CARD_W = 486, CARD_H = 222, DEFAULT_ID = 'linares';
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const status = document.getElementById('map-status');

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  function setup(layer) {
    const W = +layer.dataset.w, H = +layer.dataset.h, ox = +layer.dataset.ox, oy = +layer.dataset.oy;
    const mode = layer.dataset.mode, contact = layer.dataset.contact;
    layer.style.setProperty('--w', W);
    const X = (x) => ((x - ox) / W * 100) + '%';
    const Y = (y) => ((y - oy) / H * 100) + '%';
    const SW = (w) => (w / W * 100) + '%';
    const SH = (h) => (h / H * 100) + '%';
    const place = (node, [x, y, w, h]) => Object.assign(node.style, { left: X(x), top: Y(y), width: SW(w), height: SH(h) });

    const cover = el('div', 'mp-cover');
    place(cover, [1650, 5967, 552, 278]);
    layer.appendChild(cover);
    const joint = el('div', 'mp-joint');
    place(joint, [1650, 6059, 32, 5]);
    layer.appendChild(joint);

    const card = mode === 'card' ? el('div', 'mp-card') : null;
    if (card) layer.appendChild(card);

    const panel = mode === 'panel' ? el('div', 'mp-panel') : null;
    if (panel) layer.parentElement.insertAdjacentElement('afterend', panel);

    const groups = CITIES.map((c) => {
      const pill = el('button', 'mp-pill', c.name);
      pill.type = 'button';
      pill.dataset.id = c.id;
      place(pill, c.label);
      const pin = el('button', 'mp-pin', '<i class="mp-ring"></i>');
      pin.type = 'button';
      pin.tabIndex = -1;
      pin.setAttribute('aria-label', c.name);
      place(pin, c.pin);
      layer.append(pill, pin);
      const hover = (on) => { pill.classList.toggle('is-hover', on); pin.classList.toggle('is-hover', on); };
      [pill, pin].forEach((n) => {
        n.addEventListener('mouseenter', () => hover(true));
        n.addEventListener('mouseleave', () => hover(false));
        n.addEventListener('click', () => select(c.id, true));
      });
      pill.addEventListener('focus', () => hover(true));
      pill.addEventListener('blur', () => hover(false));
      return { c, pill, pin };
    });

    let current = null;
    function select(id, announce) {
      const g = groups.find((x) => x.c.id === id);
      if (!g || current === id) return;
      current = id;
      groups.forEach((o) => {
        const on = o === g;
        o.pill.setAttribute('aria-pressed', on);
        o.pill.classList.toggle('is-active', on);
        o.pin.classList.toggle('is-active', on);
        o.pill.classList.toggle('is-idle-linares', o.c.id === 'linares' && !on);
        o.pill.hidden = mode === 'card' && on;
      });
      if (card) {
        const [lx, ly, lw, lh] = g.c.label;
        const left = g.c.side === 'r' ? lx : lx + lw - CARD_W;
        place(card, [left, ly + lh / 2 - 82, CARD_W, CARD_H]);
        card.innerHTML = `<strong>${g.c.name}</strong><span>${g.c.region}</span><a class="mp-go" href="${contact}" aria-label="Contactar la sede de ${g.c.name}">${ARROW}</a>`;
        card.classList.remove('is-pop'); void card.offsetWidth; card.classList.add('is-pop');
      }
      if (panel) {
        panel.innerHTML = `<div><strong>${g.c.name}</strong><span>${g.c.region}</span></div><a class="m-btn m-btn-green" href="${contact}">Contactar sede ${ARROW}</a>`;
      }
      if (announce && status) status.textContent = `Sede seleccionada: ${g.c.name}, ${g.c.region}`;
    }
    select(DEFAULT_ID, false);
  }

  document.querySelectorAll('.map-layer').forEach(setup);
})();
