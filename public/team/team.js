/* Builds /team/ (names list + portrait frames) and every /team/<id>/ profile from window.TEAM (see team-data.js). */
(() => {
  "use strict";
  const root = document.getElementById("tm");
  if (!root || !window.TEAM) return;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const first = n => n.trim().split(/\s+/)[0];
  const EMAIL = window.CLUB_EMAIL;

  const TEAM = window.TEAM;

  const hasPage = m => !!(m.id && m.bio);
  const current = document.documentElement.dataset.member || "";
  const person = TEAM.find(m => hasPage(m) && m.id === current);
  if (current && !person) { location.replace("/team/"); return; }

  const photo = m => m.photo
    ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}"${m.photoPos ? ` style="object-position:${esc(m.photoPos)}"` : ""}>`
    : `<img class="ph" src="/icon-192.png" alt="">`;

  /* ── left column: title, intro (grid page only) and the list of everyone, by name ── */
  const roll = TEAM.map(m => hasPage(m)
    ? `<li><a href="/team/${esc(m.id)}/"${m.id === current ? ' aria-current="page"' : ""}>${esc(m.name)}</a></li>`
    : `<li><span>${esc(m.name)}</span></li>`).join("");
  const head = `
    <div class="tm-side">
      ${person
        ? `<a class="tm-title" href="/team/">The band</a>`
        : `<h1 class="tm-title">The band</h1>
           <p class="tm-lead">Nasce a produtora Club Benares. Esta é a equipa: profissionais de áreas diferentes que trabalham juntos, em Portugal, para pôr histórias em imagem.</p>`}
    </div>`;
  const names = `
    <div class="tm-roll">
      <span class="tm-label">Equipa</span>
      <ul class="tm-names">${roll}</ul>
      <a class="tm-btn tm-collab" href="mailto:${esc(EMAIL)}?subject=${encodeURIComponent("Vamos produzir juntos")}">Vamos produzir juntos →</a>
      <p class="tm-collab-note">Projetos, colaborações e coproduções.</p>
    </div>`;

  /* ── the grid: everyone gets a frame; it stays empty until their photo is added ── */
  const tile = (m, i) => {
    const body = `<span class="tile-img">${photo(m)}</span><span class="tile-name">${esc(m.name)}</span>${m.tag ? `<span class="tile-tag">${esc(m.tag)}</span>` : ""}`;
    return `<li style="--i:${i}">${hasPage(m)
      ? `<a class="tile" href="/team/${esc(m.id)}/" aria-label="Conhecer ${esc(m.name)}">${body}</a>`
      : `<div class="tile">${body}</div>`}</li>`;
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
          ${m.role ? `<p class="mp-role">${esc(m.role)}</p>` : ""}
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

  /* left and right columns on desktop; on a phone the pieces simply stack in this order:
     title+intro → portraits → names */
  root.innerHTML = `<div class="tm-left">${head}${names}</div><div class="tm-right">${person ? profile(person) : grid()}</div>`;

  /* the left column stays in view while you scroll, but only if it fits on the screen */
  const left = root.querySelector(".tm-left");
  const fit = () => left.classList.toggle("is-sticky", left.scrollHeight < innerHeight - 190);
  fit(); addEventListener("resize", fit); addEventListener("load", fit);
})();
