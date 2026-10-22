const sidebarTimeline = require('./layouts/sidebarTimeline');
const sidebarIconsSkills = require('./layouts/sidebarIconsSkills');
const studentCv = require('./layouts/studentCv');

// Doit rester synchronise avec frontend/src/cvTemplates/registry.js
const layoutRegistry = {
  sidebar_timeline: sidebarTimeline,
  sidebar_icons_skills: sidebarIconsSkills,
  student_cv: studentCv,
};

function getLayoutRenderer(layoutKey) {
  return layoutRegistry[layoutKey] || sidebarTimeline;
}

module.exports = { getLayoutRenderer };
