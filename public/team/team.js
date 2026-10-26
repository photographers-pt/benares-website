/* Builds /team/ (the grid) and every /team/<id>/ profile from window.TEAM (see team-data.js). */
(() => {
  "use strict";
  const root = document.getElementById("tm");
  if (!root || !window.TEAM) return;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const first = n => n.trim().split(/\s+/)[0];
  const EMAIL = window.CLUB_EMAIL;

  /* /team/?demo → adds sample profiles so you can see a fuller grid (they have no page of their own) */
  const DEMO = /[?&]demo(?:=|&|$)/.test(location.search);
  const sample = [["Ana", "Realização"], ["Rui", "Produção"], ["Eva", "Direção de Fotografia"], ["Leo", "Montagem"], ["Ivo", "Som"]]
    .map(([f, tag]) => ({ demo: true, name: f + " Exemplo", tag, photo: null }));
  const TEAM = DEMO ? window.TEAM.concat(sample) : window.TEAM.slice();

  const current = document.documentElement.dataset.member || "";
  const person = TEAM.find(m => m.id === current);
  if (current && !person) { location.replace("/team/"); return; }

  const photo = m => m.photo
    ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}"${m.photoPos ? ` style="object-position:${esc(m.photoPos)}"` : ""}>`
    : `<img class="ph" src="/icon-192.png" alt="">`;

  /* ── left column: title, intro (grid only) and the list of names ── */
  const names = TEAM.map(m => m.demo
    ? `<li><span>${esc(m.name)}</span></li>`
    : `<li><a href="/team/${esc(m.id)}/"${m.id === current ? ' aria-current="page"' : ""}>${esc(m.name)}</a></li>`).join("");
  const side = `
    <aside class="tm-side">
      ${person
        ? `<a class="tm-title" href="/team/">The team</a>`
        : `<h1 class="tm-title">The team</h1>
           <p class="tm-lead">O Club Benares nasceu em 2023 como coletivo de cinema independente e dá agora os primeiros passos como produtora. Esta é a equipa: profissionais de áreas diferentes que trabalham juntos, em Lisboa, para pôr histórias em imagem.</p>`}
      <div class="tm-names-wrap">
        <span class="tm-label">Equipa</span>
        <ul class="tm-names">${names}</ul>
      </div>
    </aside>`;

  const cta = `
    <section class="tm-cta">
      <h2>Vamos fazer um filme juntos?</h2>
      <p>Tens um projeto ou queres juntar-te à equipa? Fala connosco.</p>
      <a class="tm-btn" href="/contactos/">Entrar em contacto →</a>
    </section>`;

  /* ── the grid ── */
  const tile = (m, i) => {
    const body = `<span class="tile-img">${photo(m)}</span><span class="tile-name">${esc(m.name)}</span><span class="tile-tag">${esc(m.tag || "")}</span>`;
    return `<li style="--i:${i}">${m.demo
      ? `<div class="tile">${body}</div>`
      : `<a class="tile" href="/team/${esc(m.id)}/" aria-label="Conhecer ${esc(m.name)}">${body}</a>`}</li>`;
  };
  const invite = i => `
    <li style="--i:${i}">
      <a class="tile tile--invite" href="/contactos/" aria-label="Junta-te à equipa">
        <span class="tile-img"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg></span>
        <span class="tile-name">A tua vez</span><span class="tile-tag">Junta-te à equipa</span>
      </a>
    </li>`;
  const grid = () => `
    <div class="tm-main">
      <ul class="tm-grid">${TEAM.map(tile).join("")}${invite(TEAM.length)}</ul>
      ${cta}
    </div>`;

  /* ── a profile ── */
  const profile = m => {
    const stats = m.stats && m.stats.length
      ? `<dl class="mp-stats">${m.stats.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join("")}</dl>` : "";
    const credits = m.credits && m.credits.length
      ? `<section class="mp-credits"><span class="tm-label">Com o Club Benares</span><ul>${m.credits.map(([t, y, r]) =>
          `<li><a href="/cinemateca/"><span class="y">${esc(y)}</span><span class="t">${esc(t)}</span><span class="r">${esc(r)}</span></a></li>`).join("")}</ul></section>` : "";
    const mail = `mailto:${esc(m.email || EMAIL)}?subject=${encodeURIComponent("Club Benares · " + m.name)}`;
    return `
    <article class="tm-main mp">
      <a class="mp-back" href="/team/">← Voltar</a>
      <div class="mp-top">
        <figure class="mp-photo">${photo(m)}</figure>
        <div class="mp-info">
          <p class="mp-role">${esc(m.role)}</p>
          <h1 class="mp-name">${esc(m.name)}</h1>
          <p class="mp-bio">${esc(m.bio)}</p>
          ${stats}
          <div class="mp-actions">
            <a class="tm-btn" href="${mail}">Trabalhar com ${esc(first(m.name))} →</a>
            ${m.portfolio ? `<a class="tm-btn tm-btn--ghost" href="${esc(m.portfolio)}">Portfolio →</a>` : ""}
            ${m.instagram ? `<a class="tm-btn tm-btn--ghost" href="${esc(m.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>` : ""}
          </div>
        </div>
      </div>
      ${credits}
    </article>`;
  };

  root.innerHTML = side + (person ? profile(person) : grid());

  if (DEMO) {
    const b = document.createElement("div");
    b.className = "demo-badge";
    b.textContent = "Modo demo: pré-visualização com perfis de exemplo.";
    document.body.appendChild(b);
  }
})();
