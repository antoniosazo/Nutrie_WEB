(() => {
  const CITIES = [
    { id: 'la-serena', name: 'La Serena', region: 'Región de Coquimbo', kind: 'Planta Fertilizantes Líquidos', address: 'Los Talleres 2000, Barrio Industrial, Coquimbo', pin: [1328, 5417, 64, 80], label: [1551, 5418, 337, 79], side: 'r' },
    // Not in the map artwork: pin, line and pill are drawn by the script.
    { id: 'santiago', name: 'Santiago', region: 'Región Metropolitana', kind: 'Oficina', address: 'Av. Apoquindo 4700, Las Condes', pin: [1365, 5674, 64, 80], label: [880, 5674, 337, 79], side: 'l', extra: true },
    { id: 'malloco', name: 'Malloco', region: 'Región Metropolitana', kind: 'Planta Fertilizantes Líquidos', address: 'Camino Melipilla T57S, Ruta G-78 N° 7100, Talagante', pin: [1361, 5757, 64, 80], label: [1538, 5761, 337, 79], side: 'r' },
    { id: 'rancagua', name: 'Rancagua', region: 'Región de O’Higgins', kind: 'Centro de Distribución', address: 'Longitudinal Sur km 92, lote 3-B2, Gultro, Olivar', pin: [1290, 5822, 64, 80], label: [1538, 5862, 337, 79], side: 'r', extra: true },
    { id: 'san-fernando', name: 'San Fernando', region: 'Región de O’Higgins', kind: 'Planta Fertilizantes Líquidos', address: 'Ruta 5 Sur km 133, San Fernando', pin: [1224, 5838, 63, 80], label: [755, 5842, 338, 79], side: 'l' },
    { id: 'linares', name: 'Linares', region: 'Región del Maule', kind: 'Oficina', address: 'Av. León Bustos 1607, Carretera 5 Sur, Linares', pin: [1308, 6015, 64, 80], label: [1680, 6022, 337, 79], side: 'r' },
    { id: 'chillan', name: 'Chillán', region: 'Región de Ñuble', kind: 'Planta Fertilizantes Líquidos', address: 'Longitudinal Sur km 400, N° 3400, Chillán', pin: [1166, 6056, 64, 80], label: [596, 6054, 338, 79], side: 'l' },
    { id: 'lautaro', name: 'Lautaro', region: 'Región de La Araucanía', kind: 'Planta Fertilizantes Líquidos', address: 'Parcela N° 11 El Cardal, km 654, Ruta 5 Sur, Lautaro', pin: [1238, 6326, 64, 80], label: [1456, 6322, 337, 79], side: 'r' },
  ];
  const CARD_W = 640, DEFAULT_ID = 'linares';
  const mapsUrl = (c) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.address + ', Chile');
  const details = (c) => c.address
    ? `<span>${c.kind}</span><span class="mp-addr">${c.address}</span><a class="mp-maps" href="${mapsUrl(c)}" target="_blank" rel="noopener">Cómo llegar en Google Maps</a>`
    : `<span>${c.kind} · ${c.region}</span>`;
  const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  const PIN ='<svg class="mp-mark" viewBox="0 0 64 80" aria-hidden="true"><path d="M32 2C15.4 2 2 15.4 2 32c0 20.5 30 46 30 46s30-25.5 30-46C62 15.4 48.6 2 32 2z" fill="#33a86b"/><circle cx="32" cy="30" r="11" fill="#e4e5e6"/></svg>';
  const status = document.getElementById('map-status');

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  function setup(layer) {
    const W = +layer.dataset.w, H = +layer.dataset.h, ox = +layer.dataset.ox, oy = +layer.dataset.oy;
    const mode = layer.dataset.mode;
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
      if (c.extra) {
        const [px, , pw] = c.pin, [lx, ly, lw, lh] = c.label;
        const x1 = c.side === 'r' ? px + pw / 2 : lx + lw, x2 = c.side === 'r' ? lx : px + pw / 2;
        const line = el('div', 'mp-joint');
        place(line, [x1, ly + lh / 2 - 2, x2 - x1, 4]);
        layer.appendChild(line);
      }
      const pill = el('button', 'mp-pill', c.name);
      pill.type = 'button';
      pill.dataset.id = c.id;
      place(pill, c.label);
      const pin = el('button', 'mp-pin', (c.extra ? PIN : '') + '<i class="mp-ring"></i>');
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
    function mark(g) {
      groups.forEach((o) => {
        const on = o === g;
        o.pill.setAttribute('aria-pressed', on);
        o.pill.classList.toggle('is-active', on);
        o.pin.classList.toggle('is-active', on);
        o.pill.classList.toggle('is-idle-drawn', (o.c.id === 'linares' || o.c.extra) && !on);
        o.pill.hidden = mode === 'card' && on;
      });
    }
    function close(e) {
      const g = groups.find((x) => x.c.id === current);
      current = null;
      mark(null);
      card.hidden = true;
      // Keyboard activation (detail 0): keep focus near the map instead of losing it.
      if (g && e.detail === 0) g.pill.focus();
    }
    function select(id, announce) {
      const g = groups.find((x) => x.c.id === id);
      if (!g || current === id) return;
      current = id;
      mark(g);
      if (card) {
        card.hidden = false;
        const [lx, ly, lw, lh] = g.c.label;
        const left = g.c.side === 'r' ? lx : lx + lw - CARD_W;
        place(card, [left, ly - 30, CARD_W, 0]);
        card.style.height = 'auto';
        card.innerHTML = `<strong>${g.c.name}</strong>${details(g.c)}<button class="mp-close" type="button" aria-label="Cerrar">${CLOSE}</button>`;
        card.querySelector('.mp-close').addEventListener('click', close);
        card.classList.remove('is-pop'); void card.offsetWidth; card.classList.add('is-pop');
      }
      if (panel) {
        panel.innerHTML = `<div><strong>${g.c.name}</strong>${details(g.c)}</div>`;
      }
      if (announce && status) status.textContent = `Sede seleccionada: ${g.c.name}, ${g.c.address || g.c.region}`;
    }
    select(DEFAULT_ID, false);
  }

  document.querySelectorAll('.map-layer').forEach(setup);

  // Mail picker: the link keeps its mailto: href as fallback, JS swaps it for a menu.
  const MAIL_TO = 'contacto@nutristream.cl';
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  // On phones try the native app first; the web link is the fallback.
  const MAIL_APPS = [
    {
      name: 'Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${MAIL_TO}`, color: '#ea4335', web: true,
      app: isIOS ? `googlegmail:///co?to=${MAIL_TO}` : isAndroid ? `intent:#Intent;action=android.intent.action.SENDTO;data=mailto:${MAIL_TO};package=com.google.android.gm;end` : '',
    },
    {
      name: 'Outlook', href: `https://outlook.office.com/mail/deeplink/compose?to=${MAIL_TO}`, color: '#0a64c8', web: true,
      app: isIOS || isAndroid ? `ms-outlook://compose?to=${MAIL_TO}` : '',
    },
    { name: 'App de correo', href: `mailto:${MAIL_TO}`, color: '#33a86b', web: false, app: '' },
  ];
  function openApp(appUrl, webUrl) {
    let launched = false;
    const mark = () => { launched = true; };
    ['visibilitychange', 'pagehide', 'blur'].forEach((ev) => addEventListener(ev, mark, { once: true }));
    location.href = appUrl;
    setTimeout(() => {
      if (launched || document.hidden) return;
      if (!window.open(webUrl, '_blank')) location.href = webUrl;
    }, 2200);
  }
  const menus = [];
  const closeMenus = (except) => menus.forEach((m) => {
    if (m.menu === except) return;
    m.menu.hidden = true;
    m.link.setAttribute('aria-expanded', 'false');
  });

  document.querySelectorAll('.cc-mail').forEach((link) => {
    const menu = el('div', 'cc-menu');
    menu.hidden = true;
    menu.setAttribute('role', 'menu');
    menu.innerHTML = MAIL_APPS.map((a) => `<a role="menuitem" href="${a.href}"${a.web ? ' target="_blank" rel="noopener"' : ''}${a.app ? ` data-app="${a.app}"` : ''}><i style="background:${a.color}"></i>${a.name}</a>`).join('');
    link.closest('.cc').appendChild(menu);
    link.setAttribute('aria-haspopup', 'menu');
    link.setAttribute('aria-expanded', 'false');
    menus.push({ menu, link });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const open = menu.hidden;
      closeMenus(menu);
      menu.hidden = !open;
      link.setAttribute('aria-expanded', String(open));
      if (open && e.detail === 0) menu.querySelector('a').focus();
    });
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      if (a.dataset.app) {
        e.preventDefault();
        openApp(a.dataset.app, a.href);
      }
      closeMenus();
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.cc')) closeMenus(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = menus.find((m) => !m.menu.hidden);
    closeMenus();
    if (open) open.link.focus();
  });

  document.querySelectorAll('.cc-copy').forEach((btn) => {
    let timer;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const t = el('textarea');
        t.value = text;
        t.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); } catch (err) { /* nothing else to try */ }
        t.remove();
      }
      btn.classList.add('is-copied');
      if (status) status.textContent = 'Correo copiado';
      clearTimeout(timer);
      timer = setTimeout(() => btn.classList.remove('is-copied'), 1800);
    });
  });
})();
