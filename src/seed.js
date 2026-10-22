// Script de seed à exécuter une seule fois : "npm run seed"
// Crée le compte super admin et migre le contenu initial (services,
// réalisations, infos entreprise) en base de données.
const bcrypt = require('bcryptjs');
const pool = require('./config/db');
require('dotenv').config();

const services = [
  {
    icon_key: 'code',
    title: 'Programmation web et mobile',
    subtitle: 'Web & mobile programming',
    description:
      "Conception et développement de sites web, applications mobiles et logiciels sur mesure, adaptés aux besoins de votre activité.",
  },
  {
    icon_key: 'shield',
    title: 'Cybersécurité',
    subtitle: 'Cyber security',
    description:
      "Protection de vos données et systèmes contre les menaces informatiques : audit, sécurisation et bonnes pratiques.",
  },
  {
    icon_key: 'palette',
    title: 'Infographie',
    subtitle: 'Graphic design',
    description:
      'Création visuelle : logos, affiches, cartes de visite, supports de communication et identité graphique.',
  },
  {
    icon_key: 'office',
    title: 'Bureautique',
    subtitle: 'Office tools',
    description:
      'Formation et assistance sur les outils bureautiques (Word, Excel, PowerPoint) pour gagner en efficacité.',
  },
  {
    icon_key: 'download',
    title: "Installation de logiciels et systèmes d'exploitation",
    subtitle: 'Software & OS installation',
    description:
      "Installation, configuration et mise à jour de vos systèmes d'exploitation et logiciels professionnels.",
  },
  {
    icon_key: 'facebook',
    title: 'Création de page Facebook',
    subtitle: 'Facebook page creation',
    description:
      'Mise en place et optimisation de votre page Facebook professionnelle pour développer votre visibilité.',
  },
  {
    icon_key: 'chart',
    title: "Suivi d'entreprise",
    subtitle: 'Business follow-up',
    description:
      "Accompagnement et suivi informatique régulier de votre entreprise pour garantir la continuité de vos activités.",
  },
  {
    icon_key: 'camera',
    title: 'Installation de caméra surveillance',
    subtitle: 'Surveillance camera installation',
    description:
      'Étude, installation et configuration de systèmes de vidéosurveillance pour sécuriser vos locaux.',
  },
];

const portfolioItems = [
  {
    icon_key: 'globe',
    title: 'Site vitrine professionnel',
    category: 'Programmation web',
    description:
      "Exemple de site vitrine responsive pour présenter les activités et services d'une entreprise locale.",
  },
  {
    icon_key: 'mobile',
    title: 'Application mobile de gestion',
    category: 'Programmation mobile',
    description:
      "Exemple d'application mobile permettant à une entreprise de suivre ses commandes et son stock.",
  },
  {
    icon_key: 'camera',
    title: 'Système de vidéosurveillance',
    category: 'Caméra surveillance',
    description: 'Exemple de mise en place de caméras de surveillance connectées pour un commerce.',
  },
  {
    icon_key: 'facebook',
    title: 'Page Facebook professionnelle',
    category: 'Réseaux sociaux',
    description:
      "Exemple de création et d'optimisation d'une page Facebook pour développer la visibilité d'un client.",
  },
];

const companySettings = {
  intro_paragraph_1:
    "OliTech est une entreprise spécialisée dans les services informatiques : programmation web et mobile, cybersécurité, infographie, bureautique, installation de logiciels et systèmes d'exploitation, création de pages Facebook, suivi d'entreprise et installation de caméras de surveillance.",
  intro_paragraph_2:
    'Notre mission est d\'accompagner particuliers et entreprises avec des solutions informatiques fiables, accessibles et adaptées à leurs besoins.',
  mission_text: "Simplifier l'informatique pour nos clients, quel que soit leur besoin.",
  vision_text: 'Devenir une référence locale en solutions informatiques polyvalentes.',
  valeurs_text: 'Confiance, réactivité et rigueur dans chaque prestation.',
  ceo_name: "N'BIA KAMENAN OLIVIER",
  ceo_title: 'Ingénieur Full Stack et DevOps',
  ceo_bio:
    "À la tête d'OliTech, notre fondateur met son expertise technique et son sens du service au profit de chaque client, du premier contact jusqu'à la livraison du projet.",
  phone: '05 54 18 33 78',
  email: 'oliviernbia@gmail.com',
  website: 'olitechnologie.com',
};

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;

  if (!email || !password || !name) {
    throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD et ADMIN_NAME doivent être définis dans .env');
  }

  const [existing] = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log(`Admin déjà existant (${email}), aucune modification.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)', [
    email,
    passwordHash,
    name,
  ]);
  console.log(`Compte super admin créé : ${email}`);
}

async function seedServices() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM services');
  if (rows[0].count > 0) {
    console.log('Services déjà présents en base, seed ignoré.');
    return;
  }

  for (let i = 0; i < services.length; i += 1) {
    const s = services[i];
    await pool.query(
      'INSERT INTO services (icon_key, title, subtitle, description, sort_order) VALUES (?, ?, ?, ?, ?)',
      [s.icon_key, s.title, s.subtitle, s.description, i + 1]
    );
  }
  console.log(`${services.length} services insérés.`);
}

async function seedPortfolio() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM portfolio_items');
  if (rows[0].count > 0) {
    console.log('Réalisations déjà présentes en base, seed ignoré.');
    return;
  }

  for (let i = 0; i < portfolioItems.length; i += 1) {
    const p = portfolioItems[i];
    await pool.query(
      'INSERT INTO portfolio_items (icon_key, title, category, description, sort_order) VALUES (?, ?, ?, ?, ?)',
      [p.icon_key, p.title, p.category, p.description, i + 1]
    );
  }
  console.log(`${portfolioItems.length} réalisations insérées.`);
}

async function seedSettings() {
  const [rows] = await pool.query('SELECT id FROM company_settings WHERE id = 1');
  if (rows.length > 0) {
    console.log('Paramètres entreprise déjà présents en base, seed ignoré.');
    return;
  }

  const fields = Object.keys(companySettings);
  const values = Object.values(companySettings);
  await pool.query(
    `INSERT INTO company_settings (id, ${fields.join(', ')}) VALUES (1, ${fields.map(() => '?').join(', ')})`,
    values
  );
  console.log('Paramètres entreprise insérés.');
}

const cvTemplates = [
  {
    slug: 'classique-marine',
    layout_key: 'sidebar_timeline',
    palette_key: 'navy',
    name: 'Classique Marine',
    description: 'Mise en page sobre a deux colonnes, ideale pour un profil professionnel polyvalent.',
  },
  {
    slug: 'sobre-bleu',
    layout_key: 'sidebar_timeline',
    palette_key: 'navy_blue',
    name: 'Sobre Bleu',
    description: 'Design epure avec accents bleus, parfait pour un CV clair et facile a lire.',
  },
  {
    slug: 'corporate-orange',
    layout_key: 'sidebar_timeline',
    palette_key: 'navy_orange',
    name: 'Corporate Orange',
    description: 'Mise en page structuree avec touches orange, pour un profil dynamique en entreprise.',
  },
  {
    slug: 'executif-nuit',
    layout_key: 'sidebar_timeline',
    palette_key: 'dark_navy_orange',
    name: 'Executif Nuit',
    description: 'Design contraste fonce et orange, pour un profil senior ou executif.',
  },
  {
    slug: 'compact-competences',
    layout_key: 'sidebar_icons_skills',
    palette_key: 'navy',
    name: 'Compact Competences',
    description: 'Barres de competences et icones par section, pour mettre en avant vos savoir-faire.',
  },
  {
    slug: 'moderne-bleu',
    layout_key: 'sidebar_icons_skills',
    palette_key: 'navy_blue',
    name: 'Moderne Bleu',
    description: 'Sidebar coloree avec icones et barres de competences, pour un rendu moderne.',
  },
  {
    slug: 'creatif-orange',
    layout_key: 'sidebar_icons_skills',
    palette_key: 'navy_orange',
    name: 'Creatif Orange',
    description: 'Design vivant avec icones et competences visuelles, pour les profils creatifs.',
  },
  {
    slug: 'impact-nuit',
    layout_key: 'sidebar_icons_skills',
    palette_key: 'dark_navy_orange',
    name: 'Impact Nuit',
    description: 'Sidebar sombre a fort contraste, pour un CV qui ne passe pas inapercu.',
  },
  {
    slug: 'etudiant-moderne',
    layout_key: 'student_cv',
    palette_key: 'navy_blue',
    name: 'Etudiant Moderne',
    description: 'Mise en page pensee pour un premier CV : stage, alternance ou premier emploi.',
  },
  {
    slug: 'etudiant-classique',
    layout_key: 'student_cv',
    palette_key: 'navy',
    name: 'Etudiant Classique',
    description: 'Version sobre du CV etudiant, pour une candidature academique ou administrative.',
  },
];

async function seedCvTemplates() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM cv_templates');
  if (rows[0].count > 0) {
    console.log('Modeles de CV deja presents en base, seed ignore.');
    return;
  }

  for (let i = 0; i < cvTemplates.length; i += 1) {
    const t = cvTemplates[i];
    await pool.query(
      'INSERT INTO cv_templates (slug, layout_key, palette_key, name, description, price_fcfa, sort_order) VALUES (?, ?, ?, ?, ?, 300, ?)',
      [t.slug, t.layout_key, t.palette_key, t.name, t.description, i + 1]
    );
  }
  console.log(`${cvTemplates.length} modeles de CV inseres.`);
}

async function main() {
  await seedAdmin();
  await seedServices();
  await seedPortfolio();
  await seedSettings();
  await seedCvTemplates();
  await pool.end();
  console.log('Seed terminé.');
}

main().catch((err) => {
  console.error('Erreur pendant le seed:', err);
  process.exit(1);
});
