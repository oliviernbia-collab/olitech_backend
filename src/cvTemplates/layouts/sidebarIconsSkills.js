const { escapeHtml, list } = require('../htmlUtils');

function bar(level = 0, max = 5) {
  return `<div class="bar"><div class="bar-fill" style="width:${(level / max) * 100}%"></div></div>`;
}

function render(data, photoUrl, palette) {
  const skills = list(data.skills)
    .map((s) => `<div class="skill"><span>${escapeHtml(s.name)}</span>${bar(s.level)}</div>`)
    .join('');
  const languages = list(data.languages)
    .map((l) => `<div class="skill"><span>${escapeHtml(l.name)}</span>${bar(l.level)}</div>`)
    .join('');

  const education = list(data.education)
    .map(
      (item) => `
      <div class="entry">
        <span class="period">${escapeHtml(item.period)}</span>
        <div><strong>${escapeHtml(item.title)}</strong><span class="place">${escapeHtml(item.place)}</span></div>
      </div>`
    )
    .join('');

  const experience = list(data.experience)
    .map(
      (item) => `
      <div class="entry">
        <span class="period">${escapeHtml(item.period)}</span>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <span class="place">${escapeHtml(item.place)}</span>
          ${
            list(item.bullets).length
              ? `<ul>${list(item.bullets).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
              : ''
          }
        </div>
      </div>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; }
  .page { width: 794px; min-height: 1123px; display: flex; background: #fff; }
  .sidebar { width: 34%; background: ${palette.primary}; color: #fff; padding: 40px 24px; display: flex; flex-direction: column; gap: 22px; text-align: center; }
  .photo { width: 130px; height: 130px; border-radius: 50%; border: 4px solid ${palette.accent}; background: ${palette.primaryLight}; margin: 0 auto; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .sidebar h1 { margin: 0; font-size: 22px; }
  .title { margin: 0; font-size: 12.5px; text-transform: uppercase; letter-spacing: .06em; color: ${palette.accent}; font-weight: 700; }
  .block { text-align: left; }
  .block h3 { font-size: 14px; text-transform: uppercase; letter-spacing: .06em; margin: 0 0 12px; }
  .block ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #d7deed; }
  .skill { margin-bottom: 10px; font-size: 12.5px; }
  .skill span { display: block; margin-bottom: 4px; color: #d7deed; }
  .bar { width: 100%; height: 6px; border-radius: 999px; background: rgba(255,255,255,.18); overflow: hidden; }
  .bar-fill { height: 100%; background: ${palette.accent}; border-radius: 999px; }
  .hobbies { font-size: 12.5px; color: #d7deed; margin: 0; line-height: 1.6; }
  .main { flex: 1; padding: 44px 40px; display: flex; flex-direction: column; gap: 26px; }
  .section h2 { display: flex; align-items: center; gap: 12px; font-size: 17px; color: ${palette.primary}; margin: 0 0 16px; }
  .profile { font-size: 13.5px; line-height: 1.7; color: #3a3f4a; margin: 0; }
  .entry { display: flex; gap: 18px; margin-bottom: 14px; }
  .period { flex-shrink: 0; width: 100px; font-size: 11.5px; font-weight: 700; color: ${palette.accent}; text-transform: uppercase; padding-top: 2px; }
  .entry strong { display: block; font-size: 14.5px; }
  .place { display: block; font-size: 12.5px; color: #6a7382; }
  .entry ul { margin: 6px 0 0; padding-left: 16px; font-size: 12.5px; color: #3a3f4a; line-height: 1.6; }
</style>
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div class="photo">${photoUrl ? `<img src="${photoUrl}" />` : ''}</div>
      <h1>${escapeHtml(data.fullName)}</h1>
      <p class="title">${escapeHtml(data.jobTitle)}</p>
      <div class="block">
        <h3>Contact</h3>
        <ul><li>${escapeHtml(data.phone)}</li><li>${escapeHtml(data.email)}</li><li>${escapeHtml(data.address)}</li></ul>
      </div>
      ${skills ? `<div class="block"><h3>Competences</h3>${skills}</div>` : ''}
      ${languages ? `<div class="block"><h3>Langues</h3>${languages}</div>` : ''}
      ${
        list(data.hobbies).length
          ? `<div class="block"><h3>Loisirs</h3><p class="hobbies">${escapeHtml(list(data.hobbies).join(' / '))}</p></div>`
          : ''
      }
    </aside>
    <main class="main">
      <section class="section"><h2>Profil</h2><p class="profile">${escapeHtml(data.profile)}</p></section>
      ${education ? `<section class="section"><h2>Formation</h2>${education}</section>` : ''}
      ${experience ? `<section class="section"><h2>Experience</h2>${experience}</section>` : ''}
    </main>
  </div>
</body>
</html>`;
}

module.exports = render;
