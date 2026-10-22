const { escapeHtml, list } = require('../htmlUtils');

function render(data, photoUrl, palette) {
  const education = list(data.education)
    .map(
      (item) => `
      <div class="item">
        <span class="dot"></span>
        <div>
          <span class="period">${escapeHtml(item.period)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <span class="place">${escapeHtml(item.place)}</span>
        </div>
      </div>`
    )
    .join('');

  const experience = list(data.experience)
    .map(
      (item) => `
      <div class="item">
        <span class="dot"></span>
        <div>
          <span class="period">${escapeHtml(item.period)}</span>
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

  const skills = list(data.skills)
    .map((s) => `<li>${escapeHtml(s.name)}</li>`)
    .join('');
  const languages = list(data.languages)
    .map((l) => `<li>${escapeHtml(l.name)}</li>`)
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; }
  .page { width: 794px; min-height: 1123px; display: flex; background: #fff; }
  .sidebar { width: 34%; background: ${palette.sidebarBg}; color: ${palette.sidebarText}; padding: 40px 26px; display: flex; flex-direction: column; gap: 26px; }
  .photo { width: 150px; height: 150px; border-radius: 50%; border: 4px solid ${palette.primary}; background: #fff; margin: 0 auto; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .block h3 { font-size: 15px; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 2px solid ${palette.accent}; }
  .block ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; }
  .block ul li { position: relative; padding-left: 14px; }
  .block ul li::before { content: ''; position: absolute; left: 0; top: 6px; width: 6px; height: 6px; border-radius: 50%; background: ${palette.accent}; }
  .hobbies { font-size: 13.5px; margin: 0; line-height: 1.6; }
  .main { flex: 1; padding: 44px 40px; display: flex; flex-direction: column; gap: 24px; }
  .header h1 { margin: 0; font-size: 32px; color: ${palette.primary}; }
  .header p { margin: 4px 0 0; font-size: 16px; color: ${palette.accent}; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
  .section h2 { display: inline-flex; align-items: center; gap: 8px; background: ${palette.primary}; color: ${palette.onPrimary}; padding: 8px 20px; border-radius: 999px; font-size: 15px; margin: 0 0 16px; }
  .profile { font-size: 13.5px; line-height: 1.7; color: #3a3f4a; margin: 0; }
  .list { display: flex; flex-direction: column; gap: 16px; border-left: 2px solid #e4e8f0; margin-left: 6px; padding-left: 22px; }
  .item { position: relative; }
  .dot { position: absolute; left: -28px; top: 4px; width: 11px; height: 11px; border-radius: 50%; background: ${palette.accent}; border: 2px solid #fff; box-shadow: 0 0 0 2px ${palette.accent}; }
  .period { display: block; font-size: 11.5px; color: ${palette.accent}; font-weight: 700; text-transform: uppercase; }
  .item strong { display: block; font-size: 14.5px; margin-top: 2px; }
  .place { display: block; font-size: 12.5px; color: #6a7382; }
  .item ul { margin: 6px 0 0; padding-left: 16px; font-size: 12.5px; color: #3a3f4a; line-height: 1.6; }
</style>
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div class="photo">${photoUrl ? `<img src="${photoUrl}" />` : ''}</div>
      <div class="block">
        <h3>Contact</h3>
        <ul>
          <li>${escapeHtml(data.phone)}</li>
          <li>${escapeHtml(data.email)}</li>
          <li>${escapeHtml(data.address)}</li>
        </ul>
      </div>
      ${languages ? `<div class="block"><h3>Langues</h3><ul>${languages}</ul></div>` : ''}
      ${skills ? `<div class="block"><h3>Expertise</h3><ul>${skills}</ul></div>` : ''}
      ${
        list(data.hobbies).length
          ? `<div class="block"><h3>Centres d'interet</h3><p class="hobbies">${escapeHtml(
              list(data.hobbies).join(' / ')
            )}</p></div>`
          : ''
      }
    </aside>
    <main class="main">
      <header class="header">
        <h1>${escapeHtml(data.fullName)}</h1>
        <p>${escapeHtml(data.jobTitle)}</p>
      </header>
      <section class="section">
        <h2>Profil</h2>
        <p class="profile">${escapeHtml(data.profile)}</p>
      </section>
      ${education ? `<section class="section"><h2>Formation</h2><div class="list">${education}</div></section>` : ''}
      ${experience ? `<section class="section"><h2>Experience</h2><div class="list">${experience}</div></section>` : ''}
    </main>
  </div>
</body>
</html>`;
}

module.exports = render;
