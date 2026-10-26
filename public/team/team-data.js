/* ═══════════════════════════════════════════════════════════════════════
   THE TEAM: one entry per person. The grid at /team/ and every profile page are built from this list.

   Everyone listed here appears by name (no roles) in the list on the left of /team/ and gets a square frame
   in the grid, empty until there is a photo. A person grows in steps:
     · name only        { name: "Ana Silva" }                     → name + empty frame
     · + photo          add  photo: "/path.jpg"                   → the frame shows a black-and-white portrait
     · + profile page   add  id, bio (+ the optional fields)      → the portrait and the name link to /team/<id>/
   TO GIVE SOMEONE A PROFILE PAGE
     1. Fill in their block as the one for Charlie below. The order here is the order on the page.
     2. Copy the folder  public/team/charlie/  to  public/team/<id>/  and change three things in its
        index.html: data-member="<id>", the <title> and the description.
     3. Add each new sentence to /i18n-dict.js as [pt, en, es] so it also shows in English and Spanish.
     New names also go in the "keep" list of /i18n-dict.js (names are never translated).

   id         the folder / URL slug, lowercase, no spaces:  /team/<id>/
   name       full name
   tag        optional short line under the name in the grid (e.g. a role). Leave out to show only the name
   role       optional line above the name on the profile page
   photo      portrait photo. Square crops in the grid, 4:5 on the profile; any size ≥ 900px works
   photoPos   optional crop focus when the photo is wide, e.g. "20% center"
   bio        2–4 sentences
   stats      up to 3 pairs: [["5", "Filmes"], …]                        (optional)
   credits    films with the club: [["Title", "2024", "Realização"], …]  (optional)
   portfolio  link to their portfolio / website                         (optional)
   instagram  link to their Instagram                                   (optional)
   email      defaults to the club's address                            (optional)
   ═══════════════════════════════════════════════════════════════════════ */
window.CLUB_EMAIL = "charlie@thebenaresclub.com";

window.TEAM = [
  { name: "Valdir Neves" },
  {
    id: "charlie",
    name: "Charlie Chaves",
    role: "Escritor e Realizador · Produtor Audiovisual · Fundador",
    photo: "/Imagenes/Charlie%20Portfolio/Charlie%20Portrait%20%231.jpg",
    photoPos: "16% center",
    bio: "Cresceu na Guatemala e mudou-se para Lisboa aos 18 anos, onde começou a estudar Produção Audiovisual na ETIC. Em 2023 reuniu um grupo de amigos com a mesma vontade de filmar e fundou o Club Benares, um coletivo de cinema independente que se tornou, com o tempo, uma comunidade aberta a todos os que amam o cinema. Escrever e realizar é a sua maior paixão.",
    stats: [["5", "Filmes"], ["11+", "Eventos"], ["2023", "Desde"]],
    credits: [
      ["Inexistente", "2023", "Realização · Produção"],
      ["El Artista Comprendido", "2024", "Realização · Produção"],
      ["El Profesor", "2024", "Realização"],
      ["Jay Gupta", "2025", "Realização · Escrita · Montagem"],
      ["Firefly", "2026", "Produção"]
    ],
    portfolio: "/charlie/home/",
    instagram: "https://www.instagram.com/CharlieChaves14"
  },
  { name: "Giovanna Domiciano Neto" },
  { name: "Rita Primavera Lopes Família" },
  { name: "Sinou Gomez" },
  { name: "Nikolas Serra" },
  { name: "Rafaela Sousa" },
  { name: "Inês Garcias Lopes" },
  { name: "Sofia Aragão" },
  { name: "Sara Silva Veiga" },
  { name: "Jiani Shi" },
  { name: "Xihe Yu" },
  { name: "André de Brito" },
  { name: "Dylan Cabanis" },
  { name: "Marta Taborda" },
  { name: "Leonor Canas" },
  { name: "João Guilherme Gouveia" }
];
