// Doit rester synchronisee avec frontend/src/cvTemplates/palettes.js
const palettes = {
  navy: {
    primary: '#12213e',
    primaryLight: '#1d3766',
    accent: '#12213e',
    sidebarBg: '#f5f7fa',
    sidebarText: '#12213e',
    onPrimary: '#ffffff',
  },
  navy_blue: {
    primary: '#0f1f3d',
    primaryLight: '#1f3f73',
    accent: '#2f86ff',
    sidebarBg: '#0f1f3d',
    sidebarText: '#ffffff',
    onPrimary: '#ffffff',
  },
  navy_orange: {
    primary: '#12213e',
    primaryLight: '#1d3766',
    accent: '#ff7a1a',
    sidebarBg: '#12213e',
    sidebarText: '#ffffff',
    onPrimary: '#ffffff',
  },
  dark_navy_orange: {
    primary: '#0a1626',
    primaryLight: '#13263f',
    accent: '#ff6a1a',
    sidebarBg: '#0a1626',
    sidebarText: '#ffffff',
    onPrimary: '#ffffff',
  },
};

function getPalette(paletteKey) {
  return palettes[paletteKey] || palettes.navy;
}

module.exports = { palettes, getPalette };
