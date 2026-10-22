const { escapeHtml, list } = require('../htmlUtils');

function dots(level = 0, max = 5) {
  let out = '';
  for (let i = 0; i < max; i += 1) {
    out += `<span class="${i < level ? 'filled' : ''}"></span>`;
  }
  return `<span class="dots">${out}</span>`;
}

function render(data, photoUrl, palette) {
  const languages = list(data.languages)
    .map((l) => `<div class="rating"><span>${escapeHtml(l.name)}</span>${dots(l.level)}</div>`)
    .join('');
  const skills = list(data.skills)
    .map((s) => `<div class="rating"><span>${escapeHtml(s.name)}</span>${dots(s.level)}</div>`)
    .join('');
  const hobbies = list(data.hobbies)
    .map((h) => `<span>${escapeHtml(h)}</span>`)
    .join('');

  const education = list(data.education)
    .map(
      (item) => `
      <div class="item">
        <span class="dot"></span>
        <div><span class="period">${escapeHtml(item.period)}</span><strong>${escapeHtml(item.title)}</strong><span class="place">${escapeHtml(item.place)}</span></div>
      </div>`
    )
    .join('');

  const experience = list(data.experience)
    .map(
      (item) => `
      <div class="item">
        <span class="dot"></span>
        <div><span class="period">${escapeHtml(item.period)}</span><strong>${escapeHtml(item.title)}</strong><span class="place">${escapeHtml(item.place)}</span></div>
      </div>`
    )
    .join('');

  const projects = list(data.projects)
    .map(
      (p) => `<div class="project"><strong>${escapeHtml(p.title)}</strong><p>${escapeHtml(p.description)}</p></div>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; }
  .page { width: 794px; min-height: 1123px; background: #fff; display: flex; flex-direction: column; }
  .header { background: ${palette.primary}; color: #fff; padding: 36px 40px; display: flex; align-items: center; gap: 24px; }
  .photo { width: 110px; height: 110px; border-radius: 50%; border: 4px solid ${palette.accent}; background: ${palette.primaryLight}; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .eyebrow { display: inline-block; background: ${palette.accent}; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; padding: 4px 12px; border-radius: 999px; margin-bottom: 8px; }
  .header h1 { margin: 0; font-size: 28px; }
  .header p { margin: 4px 0 0; font-size: 14px; color: #cfd8ea; }
  .body { flex: 1; display: flex; }
  .sidebar { width: 32%; background: #f5f7fa; padding: 32px 24px; display: flex; flex-direction: column; gap: 22px; }
  .block h3 { font-size: 13.5px; text-transform: uppercase; letter-spacing: .06em; margin: 0 0 10px; color: ${palette.primary}; border-bottom: 2px solid ${palette.accent}; padding-bottom: 6px; }
  .block ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; color: #3a3f4a; }
  .rating { margin-bottom: 8px; font-size: 12px; }
  .rating span { display: block; margin-bottom: 3px; color: #3a3f4a; }
  .dots span { width: 9px; height: 9px; border-radius: 50%; background: #d9dee8; display: inline-block; margin-right: 4px; }
  .dots span.filled { background: ${palette.accent}; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tags span { font-size: 11px; background: #fff; border: 1px solid ${palette.accent}; color: ${palette.primary}; padding: 4px 10px; border-radius: 999px; }
  .main { flex: 1; padding: 32px 36px; display: flex; flex-direction: column; gap: 22px; }
  .section h2 { font-size: 16px; color: ${palette.primary}; margin: 0 0 14px; padding-bottom: 6px; border-bottom: 2px solid #e4e8f0; }
  .profile { font-size: 13px; line-height: 1.7; color: #3a3f4a; margin: 0; }
  .list { display: flex; flex-direction: column; gap: 14px; border-left: 2px solid #e4e8f0; margin-left: 6px; padding-left: 20px; }
  .item { position: relative; }
  .dot { position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: ${palette.accent}; border: 2px solid #fff; box-shadow: 0 0 0 2px ${palette.accent}; }
  .period { display: block; font-size: 11px; color: ${palette.accent}; font-weight: 700; text-transform: uppercase; }
  .item strong { display: block; font-size: 13.5px; margin-top: 2px; }
  .place { display: block; font-size: 12px; color: #6a7382; }
  .projects { display: flex; flex-direction: column; gap: 10px; }
  .project strong { display: block; font-size: 13px; }
  .project p { margin: 2px 0 0; font-size: 12px; color: #3a3f4a; line-height: 1.6; }
</style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="photo">${photoUrl ? `<img src="${photoUrl}" />` : ''}</div>
      <div>
        <span class="eyebrow">CV Etudiant</span>
        <h1>${escapeHtml(data.fullName)}</h1>
        <p>${escapeHtml(data.jobTitle)}</p>
      </div>
    </header>
    <div class="body">
      <aside class="sidebar">
        <div class="block">
          <h3>Contact</h3>
          <ul><li>${escapeHtml(data.phone)}</li><li>${escapeHtml(data.email)}</li><li>${escapeHtml(data.address)}</li></ul>
        </div>
        ${languages ? `<div class="block"><h3>Langues</h3>${languages}</div>` : ''}
        ${skills ? `<div class="block"><h3>Competences</h3>${skills}</div>` : ''}
        ${hobbies ? `<div class="block"><h3>Qualites</h3><div class="tags">${hobbies}</div></div>` : ''}
      </aside>
      <main class="main">
        <section class="section"><h2>Profil</h2><p class="profile">${escapeHtml(data.profile)}</p></section>
        ${education ? `<section class="section"><h2>Formation</h2><div class="list">${education}</div></section>` : ''}
        ${experience ? `<section class="section"><h2>Stages / Experiences</h2><div class="list">${experience}</div></section>` : ''}
        ${projects ? `<section class="section"><h2>Projets academiques</h2><div class="projects">${projects}</div></section>` : ''}
      </main>
    </div>
  </div>
</body>
</html>`;
}

module.exports = render;
