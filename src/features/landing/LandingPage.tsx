import { useState, type ReactElement } from "react";

/* ============================================================================
   iSmart Cup — Landing Page (single self-contained file)
   ----------------------------------------------------------------------------
   On-brand with the iSmart-Cup design system: light surface-subtle background,
   white cards, brand-blue primary actions, gold reserved for trophies/rewards,
   Poppins type, airy and restrained. All styling is inlined in <style> so the
   file is fully self-contained — drop it anywhere and it renders (no tokens.css
   or Tailwind config required). French UI copy.
   ============================================================================ */

/* ----------------------------- Content ----------------------------------- */
const STEPS = [
  {
    num: "01",
    tag: "Création du tournoi",
    title: "Créez votre tournoi en quelques minutes",
    desc: "Configurez le format, les équipes, les dates et les stades — tout est prêt pour accueillir la compétition.",
    features: [
      "Format et catégories personnalisables",
      "Inscription et gestion des équipes",
      "Stades, dates et règles du tournoi",
    ],
    bridge: "Votre tournoi est créé. Passez à la construction des phases et au tirage.",
    Icon: IconTrophy,
    mock: <MockTournament />,
  },
  {
    num: "02",
    tag: "Phases & Tirage",
    title: "Construisez les phases et lancez le tirage",
    desc: "Poules, élimination directe ou matchs libres — placez les équipes et lancez le tirage au sort automatique.",
    features: [
      "Phases en poules ou élimination directe",
      "Placement des équipes par glisser-déposer",
      "Tirage au sort automatique",
    ],
    bridge: "Le tirage est fait. Passez à la planification du calendrier.",
    Icon: IconShuffle,
    mock: <MockDraw />,
  },
  {
    num: "03",
    tag: "Programmation",
    title: "Planifiez le calendrier et les arbitres",
    desc: "Répartissez les rencontres sur les stades et les journées, et affectez les arbitres automatiquement.",
    features: [
      "Planning par stade et par journée",
      "Glisser-déposer des rencontres",
      "Affectation automatique des arbitres",
    ],
    bridge: "Le calendrier est prêt. Passez au suivi en direct.",
    Icon: IconCalendar,
    mock: <MockCalendar />,
  },
  {
    num: "04",
    tag: "Scores & Classements",
    title: "Suivez scores et classements en direct",
    desc: "Saisissez les résultats, laissez les classements se recalculer tout seuls, et affichez la compétition en public.",
    features: [
      "Saisie des scores et tirs au but",
      "Classements et tableaux en temps réel",
      "Affichage public et sponsors",
    ],
    bridge: null,
    Icon: IconChart,
    mock: <MockStandings />,
  },
];

const FEATURES = [
  { Icon: IconShuffle, title: "Tirage automatique", desc: "Poules ou élimination directe, tirés au sort en un clic." },
  { Icon: IconCalendar, title: "Calendrier glisser-déposer", desc: "Placez les rencontres sur les stades et les journées." },
  { Icon: IconChart, title: "Classements en direct", desc: "Les tableaux se recalculent à chaque résultat saisi." },
  { Icon: IconWhistle, title: "Stades & arbitres", desc: "Multi-stades, affectation automatique des arbitres." },
  { Icon: IconMegaphone, title: "Sponsors & affichage public", desc: "Vitrine et écrans publics pour vos partenaires." },
  { Icon: IconGlobe, title: "Clair / sombre & multilingue", desc: "Thème clair ou sombre, FR · AR · EN." },
];

const PLANS = [
  {
    name: "Individuel",
    price: "29",
    period: "/ mois",
    blurb: "Pour les organisateurs et clubs.",
    features: ["Jusqu'à 32 équipes", "Tournois illimités sur le mois", "Tirage, calendrier & scores", "Affichage public"],
    cta: "Commencer",
    featured: false,
  },
  {
    name: "Collectif",
    price: "79",
    period: "/ mois",
    blurb: "Pour les ligues et fédérations.",
    features: ["Équipes illimitées", "Plusieurs tournois en parallèle", "Sponsors & écrans publics", "Support prioritaire"],
    cta: "Choisir Collectif",
    featured: true,
  },
  {
    name: "Sur mesure",
    price: "—",
    period: "",
    blurb: "Pour les grands événements.",
    features: ["Volume illimité", "Intégrations dédiées", "Accompagnement événement", "SLA & formation"],
    cta: "Nous contacter",
    featured: false,
  },
];

/* ----------------------------- Page -------------------------------------- */
export default function IsmartCupLanding() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="ic-root">
      <Styles />

      {/* NAV */}
      <nav className="ic-nav">
        <a className="ic-logo" href="#hero" aria-label="iSmart Cup">
          <IconTrophy className="ic-logo-mark" />
          <span>iSMART<span className="ic-logo-cup">·CUP</span></span>
        </a>
        <ul className={`ic-nav-links ${menuOpen ? "is-open" : ""}`}>
          <li><a href="#etapes">Étapes</a></li>
          <li><a href="#features">Fonctionnalités</a></li>
          <li><a href="#tarifs">Tarifs</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="ic-nav-right">
          <button className="ic-btn ic-btn-ghost ic-hide-sm">Se connecter</button>
          <button className="ic-btn ic-btn-primary">Créer un tournoi</button>
          <button className="ic-burger" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header id="hero" className="ic-hero">
        <div className="ic-hero-bg" aria-hidden>
          <div className="ic-hero-grid" />
          <div className="ic-hero-glow" />
          <div className="ic-blob ic-blob-a" />
          <div className="ic-blob ic-blob-b" />
        </div>

        <div className="ic-hero-inner">
          <span className="ic-badge">
            <span className="ic-badge-dot" />
            Plateforme de gestion de tournois sportifs
          </span>

          <h1 className="ic-h1">
            Organisez vos tournois,<br />
            <span className="ic-h1-accent">du tirage au podium.</span>
          </h1>

          <p className="ic-lead">
            iSmart Cup réunit la création de tournoi, le tirage au sort, le calendrier et le suivi
            des scores en direct — dans une seule plateforme claire et puissante.
          </p>

          <div className="ic-hero-cta">
            <button className="ic-btn ic-btn-primary ic-btn-lg">Créer un tournoi</button>
            <button className="ic-btn ic-btn-outline ic-btn-lg">
              Voir une démo <IconArrow />
            </button>
          </div>

          <div className="ic-stores">
            <StoreBadge store="App Store" Icon={IconApple} sup="Télécharger sur l'" />
            <StoreBadge store="Google Play" Icon={IconGooglePlay} sup="Disponible sur" />
          </div>

          <div className="ic-trust">
            <span className="ic-trust-num">200+</span> tournois organisés ·
            <span className="ic-trust-num"> 8 000+</span> équipes
          </div>
        </div>

        {/* floating product preview */}
        <div className="ic-hero-preview" aria-hidden>
          <div className="ic-float ic-float-1"><MockStandings compact /></div>
          <div className="ic-float ic-float-2"><MockMatch /></div>
          <div className="ic-float ic-float-3"><MockBracketNode /></div>
        </div>
      </header>

      {/* STEPS */}
      <section id="etapes" className="ic-section">
        <div className="ic-section-head">
          <span className="ic-eyebrow"><span className="ic-eyebrow-line" />Comment ça marche</span>
          <h2 className="ic-h2">Quatre étapes, du coup d'envoi au classement final.</h2>
          <p className="ic-section-desc">
            iSmart Cup suit le cycle réel d'un tournoi — chaque étape vous mène naturellement à la suivante.
          </p>
        </div>

        <ol className="ic-steps">
          {STEPS.map((s, i) => (
            <li className={`ic-step ${i % 2 ? "is-rev" : ""}`} key={s.num}>
              <div className="ic-step-rail" aria-hidden>
                <span className="ic-step-node">{i + 1}</span>
                {i < STEPS.length - 1 && <span className="ic-step-line" />}
              </div>

              <div className="ic-step-body">
                <span className="ic-step-tag"><s.Icon className="ic-step-tagicon" />{s.tag}</span>
                <h3 className="ic-h3">{s.title}</h3>
                <p className="ic-step-desc">{s.desc}</p>
                <ul className="ic-step-feats">
                  {s.features.map((f) => (
                    <li key={f}><IconCheck className="ic-check" />{f}</li>
                  ))}
                </ul>
                {s.bridge && <p className="ic-step-bridge"><IconArrow className="ic-bridge-arrow" />{s.bridge}</p>}
              </div>

              <div className="ic-step-visual">{s.mock}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* FEATURES */}
      <section id="features" className="ic-section ic-section-muted">
        <div className="ic-section-head">
          <span className="ic-eyebrow"><span className="ic-eyebrow-line" />Tout-en-un</span>
          <h2 className="ic-h2">Tout ce qu'il faut pour gérer une compétition.</h2>
        </div>
        <div className="ic-feature-grid">
          {FEATURES.map((f) => (
            <article className="ic-feature" key={f.title}>
              <span className="ic-chip"><f.Icon className="ic-chip-icon" /></span>
              <h4 className="ic-feature-title">{f.title}</h4>
              <p className="ic-feature-desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="tarifs" className="ic-section">
        <div className="ic-section-head">
          <span className="ic-eyebrow"><span className="ic-eyebrow-line" />Tarifs</span>
          <h2 className="ic-h2">Un plan pour chaque organisateur.</h2>
          <p className="ic-section-desc">Sans engagement. Changez ou annulez à tout moment.</p>
        </div>
        <div className="ic-pricing">
          {PLANS.map((p) => (
            <article className={`ic-plan ${p.featured ? "is-featured" : ""}`} key={p.name}>
              {p.featured && <span className="ic-plan-badge">Le plus choisi</span>}
              <h4 className="ic-plan-name">{p.name}</h4>
              <p className="ic-plan-blurb">{p.blurb}</p>
              <div className="ic-plan-price">
                {p.price !== "—" && <span className="ic-plan-cur">€</span>}
                <span className="ic-plan-amt">{p.price}</span>
                <span className="ic-plan-per">{p.period}</span>
              </div>
              <ul className="ic-plan-feats">
                {p.features.map((f) => (
                  <li key={f}><IconCheck className="ic-check" />{f}</li>
                ))}
              </ul>
              <button className={`ic-btn ${p.featured ? "ic-btn-primary" : "ic-btn-outline"} ic-btn-block`}>
                {p.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section id="contact" className="ic-cta">
        <div className="ic-cta-inner">
          <IconTrophy className="ic-cta-trophy" />
          <h2 className="ic-cta-title">Prêt à lancer votre tournoi&nbsp;?</h2>
          <p className="ic-cta-sub">Créez votre première compétition gratuitement, en moins de cinq minutes.</p>
          <div className="ic-hero-cta">
            <button className="ic-btn ic-btn-primary ic-btn-lg">Créer un tournoi</button>
            <button className="ic-btn ic-btn-outline ic-btn-lg ic-btn-on-band">Parler à l'équipe</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ic-footer">
        <div className="ic-footer-inner">
          <div className="ic-footer-top">
            <div className="ic-footer-brand">
              <a className="ic-logo" href="#hero"><IconTrophy className="ic-logo-mark" /><span>iSMART<span className="ic-logo-cup">·CUP</span></span></a>
              <p className="ic-footer-tagline">La plateforme tout-en-un pour organiser, animer et suivre vos tournois sportifs.</p>
              <div className="ic-stores ic-stores-sm">
                <StoreBadge store="App Store" Icon={IconApple} sup="Sur l'" small />
                <StoreBadge store="Google Play" Icon={IconGooglePlay} sup="Sur" small />
              </div>
            </div>
            <div className="ic-footer-cols">
              <FooterCol title="Produit" links={["Fonctionnalités", "Tarifs", "Tirage", "Calendrier"]} />
              <FooterCol title="Ressources" links={["Guide", "FAQ", "Support", "Blog"]} />
              <FooterCol title="Légal" links={["Confidentialité", "Conditions", "Cookies"]} />
            </div>
          </div>
          <div className="ic-footer-bottom">
            <span className="ic-footer-copy">© {new Date().getFullYear()} iSmart Cup. Tous droits réservés.</span>
            <div className="ic-socials">
              <a className="ic-social" href="#" aria-label="Instagram"><IconInstagram /></a>
              <a className="ic-social" href="#" aria-label="YouTube"><IconYoutube /></a>
              <a className="ic-social" href="#" aria-label="LinkedIn"><IconLinkedin /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --------------------------- Small components ----------------------------- */
function StoreBadge({ store, Icon, sup, small }: { store: string; Icon: IconComponent; sup: string; small?: boolean }) {
  return (
    <a href="#" className={`ic-store ${small ? "is-sm" : ""}`}>
      <Icon className="ic-store-icon" />
      <span className="ic-store-txt"><small>{sup}</small><strong>{store}</strong></span>
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="ic-footer-col">
      <h5 className="ic-footer-col-title">{title}</h5>
      <ul>{links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
    </div>
  );
}

/* --------------------------- Product mocks -------------------------------- */
function Avatar({ label, tone = "blue" }: { label: string; tone?: string }) {
  return <span className={`ic-av ic-av-${tone}`}>{label}</span>;
}

function MockStandings({ compact }: { compact?: boolean }) {
  const rows = [
    ["1", "RMA", "3", "+5", true],
    ["2", "PSG", "3", "0", false],
    ["3", "FCB", "1", "-2", false],
    ...(compact ? [] : [["4", "INT", "0", "-3", false]]),
  ] as [string, string, string, string, boolean][];
  return (
    <div className="ic-mock ic-mock-table">
      <div className="ic-mock-head"><IconChart className="ic-mock-headicon" /> Poule A · Classement</div>
      <div className="ic-tbl">
        <div className="ic-tbl-h"><span>#</span><span>Équipe</span><span>Pts</span><span>DB</span></div>
        {rows.map(([pos, team, pts, db, lead]) => (
          <div className={`ic-tbl-r ${lead ? "is-lead" : ""}`} key={team}>
            <span className="ic-tbl-pos">{pos}</span>
            <span className="ic-tbl-team"><Avatar label={team.slice(0, 2)} tone={lead ? "gold" : "blue"} />{team}</span>
            <span className="ic-tbl-pts">{pts}</span>
            <span className={`ic-tbl-db ${db.startsWith("+") ? "pos" : db.startsWith("-") ? "neg" : ""}`}>{db}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockMatch() {
  return (
    <div className="ic-mock ic-mock-match">
      <div className="ic-mm-status">Terminé</div>
      <div className="ic-mm-row"><Avatar label="PS" />PSG<span className="ic-mm-score">1</span></div>
      <div className="ic-mm-row"><Avatar label="MU" tone="slate" />Man Utd<span className="ic-mm-score">1</span></div>
      <div className="ic-mm-pen">t.a.b. 4 — 3</div>
    </div>
  );
}

function MockBracketNode() {
  return (
    <div className="ic-mock ic-mock-bracket">
      <div className="ic-bn-title">Demi-finale</div>
      <div className="ic-bn-side"><Avatar label="1A" tone="gold" /> 1er Poule A</div>
      <div className="ic-bn-vs">contre</div>
      <div className="ic-bn-side is-tbd"><span className="ic-bn-dash" /> Meilleur 2e</div>
    </div>
  );
}

function MockTournament() {
  return (
    <div className="ic-mock ic-mock-card">
      <div className="ic-mc-head"><span className="ic-chip ic-chip-sm"><IconTrophy className="ic-chip-icon" /></span><div><strong>Tournoi d'Avril</strong><small>12 équipes · 3 stades</small></div></div>
      <div className="ic-mc-bars">
        <Bar label="Inscriptions" val="12 / 12" pct={100} />
        <Bar label="Phases" val="3" pct={100} />
        <Bar label="Stades" val="3 actifs" pct={60} />
      </div>
    </div>
  );
}

function MockDraw() {
  const groups = [["RMA", "PSG", "FCB", "INT"], ["MIL", "BAY", "EST", "CA"], ["BVB", "MCI", "ESS", "MUN"]];
  return (
    <div className="ic-mock ic-mock-card">
      <div className="ic-mc-head"><span className="ic-chip ic-chip-sm"><IconShuffle className="ic-chip-icon" /></span><div><strong>Tirage au sort</strong><small>3 poules × 4</small></div></div>
      <div className="ic-draw">
        {groups.map((g, i) => (
          <div className="ic-draw-g" key={i}>
            <span className="ic-draw-gt">Poule {String.fromCharCode(65 + i)}</span>
            {g.map((t) => <span className="ic-draw-slot" key={t}><Avatar label={t.slice(0, 2)} />{t}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCalendar() {
  return (
    <div className="ic-mock ic-mock-card">
      <div className="ic-mc-head"><span className="ic-chip ic-chip-sm"><IconCalendar className="ic-chip-icon" /></span><div><strong>Calendrier</strong><small>mer. 1 avril</small></div></div>
      <div className="ic-cal">
        {["Stade 1", "Stade 2", "Stade 3"].map((s, i) => (
          <div className="ic-cal-col" key={s}>
            <span className="ic-cal-h">{s}</span>
            <span className={`ic-cal-slot ${i === 1 ? "is-empty" : ""}`}>{i === 1 ? "Déposer ici" : "PSG vs FCB"}</span>
            <span className={`ic-cal-slot ${i === 2 ? "is-empty" : ""}`}>{i === 2 ? "Déposer ici" : "RMA vs INT"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ label, val, pct }: { label: string; val: string; pct: number }) {
  return (
    <div className="ic-bar">
      <div className="ic-bar-top"><span>{label}</span><strong>{val}</strong></div>
      <div className="ic-bar-track"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

/* ------------------------------- Icons ------------------------------------ */
type IconComponent = (props: { className?: string }) => ReactElement;

function IconTrophy({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></svg>);
}
function IconShuffle({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>);
}
function IconCalendar({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
}
function IconChart({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-6" /></svg>);
}
function IconWhistle({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="13" r="6" /><path d="M14 11h7a2 2 0 0 1 0 4M9 7V4h4" /></svg>);
}
function IconMegaphone({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 14-6v14L3 13zM3 11v3a2 2 0 0 0 2 2h1M7 16v4" /></svg>);
}
function IconGlobe({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></svg>);
}
function IconCheck({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>);
}
function IconArrow({ className = "" }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
}
function IconInstagram() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>);
}
function IconYoutube() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" /></svg>);
}
function IconLinkedin() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>);
}
function IconApple({ className = "" }) {
  return (<svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>);
}
function IconGooglePlay({ className = "" }) {
  return (<svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.97.07l12.54-7.25-2.88-2.88-10.63 10.06zM.75 1.5C.28 1.97 0 2.7 0 3.67v16.67c0 .97.28 1.7.76 2.17l.11.1 9.34-9.34v-.22L.86 1.4l-.11.1zM19.84 10.5l-2.64-1.53-3.22 3.22 3.22 3.22 2.65-1.53c.76-.44.76-1.14-.01-1.38zM4.15.24L16.69 7.5l-2.88 2.88L3.18.32C3.5.2 3.85.22 4.15.24z" /></svg>);
}

/* ------------------------------- Styles ----------------------------------- */
function Styles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.ic-root{
  /* iSmart-Cup tokens (light) */
  --brand-50:#eff6ff;--brand-100:#dbeafe;--brand-200:#bfdbfe;--brand-500:#3b82f6;--brand-600:#2563eb;--brand-700:#1d4ed8;--brand-900:#1e3a8a;
  --gold-50:#fffbeb;--gold-100:#fef3c7;--gold-500:#f59e0b;--gold-600:#d97706;
  --ink:#0f172a;--ink-subtle:#334155;--ink-muted:#64748b;
  --surface:#ffffff;--surface-subtle:#f8fafc;--surface-muted:#f1f5f9;
  --border:#e2e8f0;--border-strong:#cbd5e1;--success:#10b981;
  --r-md:.625rem;--r-lg:.75rem;--r-xl:1rem;--r-2xl:1.25rem;
  --sh-sm:0 1px 3px 0 rgb(15 23 42/.06),0 1px 2px -1px rgb(15 23 42/.04);
  --sh-md:0 4px 6px -1px rgb(15 23 42/.08),0 2px 4px -2px rgb(15 23 42/.05);
  --sh-lg:0 10px 25px -5px rgb(15 23 42/.12),0 8px 10px -6px rgb(15 23 42/.06);
  font-family:'Poppins',system-ui,sans-serif;color:var(--ink);background:var(--surface-subtle);
  -webkit-font-smoothing:antialiased;line-height:1.5;
}
.ic-root *{box-sizing:border-box;margin:0;padding:0}
.ic-root a{color:inherit;text-decoration:none}
.ic-root ul{list-style:none}
.ic-root h1,.ic-root h2,.ic-root h3,.ic-root h4{letter-spacing:-.02em;font-weight:700}

/* buttons */
.ic-btn{display:inline-flex;align-items:center;gap:.5rem;font-family:inherit;font-weight:600;font-size:.92rem;
  padding:.62rem 1.1rem;border-radius:var(--r-lg);border:1px solid transparent;cursor:pointer;transition:.18s ease;white-space:nowrap}
.ic-btn-lg{padding:.85rem 1.5rem;font-size:1rem}
.ic-btn-block{width:100%;justify-content:center}
.ic-btn-primary{background:var(--brand-600);color:#fff;box-shadow:var(--sh-sm)}
.ic-btn-primary:hover{background:var(--brand-700);transform:translateY(-1px);box-shadow:var(--sh-md)}
.ic-btn-outline{background:var(--surface);color:var(--ink);border-color:var(--border-strong)}
.ic-btn-outline:hover{border-color:var(--brand-500);color:var(--brand-700);background:var(--brand-50)}
.ic-btn-ghost{background:transparent;color:var(--ink-subtle)}
.ic-btn-ghost:hover{background:var(--surface-muted)}
.ic-btn svg{width:1.05em;height:1.05em}

/* nav */
.ic-nav{position:fixed;inset:0 0 auto 0;z-index:50;display:flex;align-items:center;justify-content:space-between;
  padding:.85rem clamp(1rem,5vw,3rem);background:rgba(255,255,255,.78);backdrop-filter:blur(14px);
  border-bottom:1px solid var(--border)}
.ic-logo{display:inline-flex;align-items:center;gap:.5rem;font-weight:800;font-size:1.08rem;letter-spacing:-.02em;color:var(--ink)}
.ic-logo-mark{width:1.4rem;height:1.4rem;color:var(--brand-600)}
.ic-logo-cup{color:var(--gold-500)}
.ic-nav-links{display:flex;gap:1.9rem}
.ic-nav-links a{font-size:.92rem;color:var(--ink-muted);font-weight:500;transition:color .18s}
.ic-nav-links a:hover{color:var(--ink)}
.ic-nav-right{display:flex;align-items:center;gap:.6rem}
.ic-burger{display:none;flex-direction:column;gap:4px;background:none;border:none;cursor:pointer;padding:.4rem}
.ic-burger span{width:20px;height:2px;background:var(--ink);border-radius:2px}

/* hero */
.ic-hero{position:relative;min-height:100vh;padding:9rem clamp(1rem,5vw,3rem) 4rem;display:flex;flex-direction:column;
  align-items:center;text-align:center;overflow:hidden}
.ic-hero-bg{position:absolute;inset:0;pointer-events:none}
.ic-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(37,99,235,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.05) 1px,transparent 1px);background-size:48px 48px;
  mask-image:radial-gradient(ellipse 70% 55% at 50% 0%,#000 0%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 70% 55% at 50% 0%,#000 0%,transparent 75%)}
.ic-hero-glow{position:absolute;top:-10%;left:50%;transform:translateX(-50%);width:900px;height:600px;
  background:radial-gradient(ellipse at center,rgba(59,130,246,.16),transparent 65%)}
.ic-blob{position:absolute;border-radius:50%;filter:blur(90px)}
.ic-blob-a{width:380px;height:380px;background:rgba(59,130,246,.14);top:4rem;left:-6rem}
.ic-blob-b{width:320px;height:320px;background:rgba(245,158,11,.10);bottom:-4rem;right:-4rem}
.ic-hero-inner{position:relative;max-width:780px}
.ic-badge{display:inline-flex;align-items:center;gap:.5rem;background:var(--brand-50);color:var(--brand-700);
  border:1px solid var(--brand-100);border-radius:100px;padding:.4rem .9rem;font-size:.8rem;font-weight:600;margin-bottom:1.6rem}
.ic-badge-dot{width:7px;height:7px;border-radius:50%;background:var(--success);box-shadow:0 0 0 3px rgba(16,185,129,.18)}
.ic-h1{font-size:clamp(2.4rem,6vw,4rem);line-height:1.05;font-weight:800;letter-spacing:-.03em}
.ic-h1-accent{color:var(--brand-600)}
.ic-lead{margin:1.4rem auto 0;max-width:600px;color:var(--ink-muted);font-size:clamp(1rem,1.6vw,1.15rem);line-height:1.7}
.ic-hero-cta{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-top:2rem}
.ic-stores{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap;margin-top:1.6rem}
.ic-store{display:inline-flex;align-items:center;gap:.6rem;padding:.55rem 1rem;border:1px solid var(--border-strong);
  border-radius:var(--r-lg);background:var(--surface);color:var(--ink);transition:.18s}
.ic-store:hover{border-color:var(--brand-500);box-shadow:var(--sh-sm)}
.ic-store-txt{display:flex;flex-direction:column;line-height:1.1;text-align:left}
.ic-store-txt small{font-size:.6rem;color:var(--ink-muted)}
.ic-store-txt strong{font-size:.9rem;font-weight:700}
.ic-store.is-sm{padding:.45rem .8rem}
.ic-trust{margin-top:2rem;color:var(--ink-muted);font-size:.85rem}
.ic-trust-num{color:var(--ink);font-weight:700}

/* hero floating preview */
.ic-hero-preview{position:relative;width:100%;max-width:1000px;height:300px;margin-top:1rem}
.ic-float{position:absolute;animation:icfloat 6s ease-in-out infinite}
.ic-float-1{left:6%;top:30px;animation-delay:0s}
.ic-float-2{left:50%;transform:translateX(-50%);top:0;animation-delay:.8s;z-index:2}
.ic-float-3{right:6%;top:60px;animation-delay:1.6s}
@keyframes icfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.ic-float-2{animation-name:icfloat2}
@keyframes icfloat2{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-12px)}}

/* sections */
.ic-section{padding:clamp(4rem,8vw,7rem) clamp(1rem,5vw,3rem);max-width:1180px;margin:0 auto}
.ic-section-muted{max-width:none;background:var(--surface-muted)}
.ic-section-muted>*{max-width:1180px;margin-inline:auto}
.ic-section-head{max-width:680px;margin:0 auto 3rem;text-align:center}
.ic-eyebrow{display:inline-flex;align-items:center;gap:.55rem;color:var(--brand-600);font-weight:700;
  font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.9rem}
.ic-eyebrow-line{width:22px;height:2px;background:var(--brand-500);border-radius:2px}
.ic-h2{font-size:clamp(1.7rem,3.5vw,2.6rem);line-height:1.12;font-weight:800;letter-spacing:-.025em}
.ic-h3{font-size:clamp(1.3rem,2.4vw,1.7rem);font-weight:700;letter-spacing:-.02em}
.ic-section-desc{margin-top:1rem;color:var(--ink-muted);font-size:1.05rem;line-height:1.7}

/* steps */
.ic-steps{display:flex;flex-direction:column;gap:0}
.ic-step{display:grid;grid-template-columns:48px 1fr 1fr;gap:1.5rem 2.2rem;align-items:start;padding:1.5rem 0}
.ic-step.is-rev .ic-step-body{order:2}
.ic-step.is-rev .ic-step-visual{order:1}
.ic-step-rail{position:relative;display:flex;flex-direction:column;align-items:center;grid-row:1;grid-column:1;height:100%}
.ic-step-node{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:var(--brand-600);color:#fff;
  font-weight:800;font-size:1.15rem;box-shadow:0 0 0 6px var(--brand-50)}
.ic-step-line{flex:1;width:2px;background:linear-gradient(var(--brand-200),transparent);margin-top:.4rem;min-height:60px}
.ic-step-tag{display:inline-flex;align-items:center;gap:.45rem;background:var(--brand-50);color:var(--brand-700);
  font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:.35rem .75rem;border-radius:100px;margin-bottom:.9rem}
.ic-step-tagicon{width:.95rem;height:.95rem}
.ic-step-desc{margin-top:.7rem;color:var(--ink-muted);line-height:1.7}
.ic-step-feats{margin-top:1.1rem;display:flex;flex-direction:column;gap:.55rem}
.ic-step-feats li{display:flex;align-items:center;gap:.6rem;color:var(--ink-subtle);font-size:.95rem;font-weight:500}
.ic-check{width:1rem;height:1rem;color:var(--success);flex-shrink:0}
.ic-step-bridge{display:flex;align-items:center;gap:.5rem;margin-top:1.4rem;padding-top:1.1rem;border-top:1px dashed var(--border-strong);
  color:var(--ink-muted);font-size:.88rem;font-style:italic}
.ic-bridge-arrow{width:1rem;height:1rem;color:var(--brand-500)}
.ic-step-visual{align-self:center}

/* features */
.ic-feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}
.ic-feature{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:1.5rem;box-shadow:var(--sh-sm);transition:.2s}
.ic-feature:hover{transform:translateY(-3px);box-shadow:var(--sh-md);border-color:var(--brand-200)}
.ic-chip{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:var(--r-md);background:var(--brand-50);color:var(--brand-600)}
.ic-chip-sm{width:2rem;height:2rem}
.ic-chip-icon{width:1.25rem;height:1.25rem}
.ic-feature-title{margin:1rem 0 .4rem;font-size:1.08rem;font-weight:700}
.ic-feature-desc{color:var(--ink-muted);font-size:.92rem;line-height:1.6}

/* pricing */
.ic-pricing{display:grid;grid-template-columns:repeat(3,1fr);gap:1.3rem;align-items:stretch}
.ic-plan{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-2xl);padding:1.8rem;
  box-shadow:var(--sh-sm);display:flex;flex-direction:column}
.ic-plan.is-featured{border-color:var(--brand-500);box-shadow:0 0 0 1px var(--brand-500),var(--sh-lg);transform:translateY(-6px)}
.ic-plan-badge{position:absolute;top:-.8rem;left:50%;transform:translateX(-50%);background:var(--brand-600);color:#fff;
  font-size:.72rem;font-weight:700;padding:.3rem .8rem;border-radius:100px;letter-spacing:.03em}
.ic-plan-name{font-size:1.2rem;font-weight:700}
.ic-plan-blurb{color:var(--ink-muted);font-size:.88rem;margin-top:.3rem}
.ic-plan-price{display:flex;align-items:flex-end;gap:.15rem;margin:1.2rem 0}
.ic-plan-cur{font-size:1.3rem;font-weight:700;color:var(--ink-subtle);margin-bottom:.45rem}
.ic-plan-amt{font-size:2.8rem;font-weight:800;line-height:1;letter-spacing:-.03em}
.ic-plan-per{color:var(--ink-muted);font-size:.9rem;margin-bottom:.5rem}
.ic-plan-feats{display:flex;flex-direction:column;gap:.65rem;margin-bottom:1.5rem;flex:1}
.ic-plan-feats li{display:flex;align-items:center;gap:.6rem;font-size:.92rem;color:var(--ink-subtle)}

/* cta band */
.ic-cta{padding:clamp(3rem,6vw,5rem) clamp(1rem,5vw,3rem)}
.ic-cta-inner{max-width:760px;margin:0 auto;text-align:center;background:linear-gradient(135deg,var(--brand-700),var(--brand-600));
  border-radius:var(--r-2xl);padding:clamp(2.5rem,5vw,3.5rem);color:#fff;box-shadow:var(--sh-lg);position:relative;overflow:hidden}
.ic-cta-trophy{width:2.4rem;height:2.4rem;color:var(--gold-500);margin-bottom:1rem}
.ic-cta-title{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800}
.ic-cta-sub{margin:.8rem auto 0;max-width:460px;color:rgba(255,255,255,.85);line-height:1.6}
.ic-cta .ic-hero-cta{margin-top:1.8rem}
.ic-cta .ic-btn-primary{background:#fff;color:var(--brand-700)}
.ic-cta .ic-btn-primary:hover{background:var(--gold-50)}
.ic-btn-on-band{background:transparent;color:#fff;border-color:rgba(255,255,255,.4)}
.ic-btn-on-band:hover{background:rgba(255,255,255,.12);border-color:#fff;color:#fff}

/* footer */
.ic-footer{background:var(--ink);color:#cbd5e1}
.ic-footer-inner{max-width:1180px;margin:0 auto;padding:3.5rem clamp(1rem,5vw,3rem) 2rem}
.ic-footer-top{display:flex;justify-content:space-between;gap:3rem;flex-wrap:wrap;padding-bottom:2.5rem;border-bottom:1px solid rgba(255,255,255,.08)}
.ic-footer .ic-logo{color:#fff}
.ic-footer-brand{max-width:280px;display:flex;flex-direction:column;gap:1rem}
.ic-footer-tagline{color:#94a3b8;font-size:.88rem;line-height:1.6}
.ic-stores-sm .ic-store{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#fff}
.ic-stores-sm .ic-store-txt small{color:#94a3b8}
.ic-footer-cols{display:flex;gap:3.5rem;flex-wrap:wrap}
.ic-footer-col-title{font-size:.74rem;text-transform:uppercase;letter-spacing:.1em;color:#fff;font-weight:700;margin-bottom:.9rem}
.ic-footer-col ul{display:flex;flex-direction:column;gap:.55rem}
.ic-footer-col a{color:#94a3b8;font-size:.88rem;transition:color .18s}
.ic-footer-col a:hover{color:#fff}
.ic-footer-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-top:1.6rem}
.ic-footer-copy{color:#94a3b8;font-size:.82rem}
.ic-socials{display:flex;gap:.5rem}
.ic-social{display:grid;place-items:center;width:36px;height:36px;border-radius:var(--r-md);background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);color:#94a3b8;transition:.18s}
.ic-social:hover{color:#fff;background:rgba(255,255,255,.1)}

/* mocks */
.ic-mock{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);box-shadow:var(--sh-lg);padding:1rem;width:100%;font-size:.85rem}
.ic-step-visual .ic-mock{max-width:420px;margin-inline:auto}
.ic-mock-head{display:flex;align-items:center;gap:.5rem;font-weight:600;color:var(--ink-subtle);font-size:.8rem;margin-bottom:.7rem}
.ic-mock-headicon{width:1rem;height:1rem;color:var(--brand-600)}
.ic-mc-head{display:flex;align-items:center;gap:.7rem;margin-bottom:1rem}
.ic-mc-head strong{display:block;font-size:.95rem}
.ic-mc-head small{color:var(--ink-muted);font-size:.78rem}
.ic-av{display:inline-grid;place-items:center;width:1.5rem;height:1.5rem;border-radius:50%;font-size:.62rem;font-weight:700;color:#fff;flex-shrink:0}
.ic-av-blue{background:var(--brand-500)}.ic-av-slate{background:var(--ink-subtle)}.ic-av-gold{background:var(--gold-500)}
.ic-tbl{display:flex;flex-direction:column}
.ic-tbl-h,.ic-tbl-r{display:grid;grid-template-columns:1.4rem 1fr 1.8rem 1.8rem;align-items:center;gap:.5rem;padding:.4rem .5rem}
.ic-tbl-h{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-muted);background:var(--surface-muted);border-radius:var(--r-md)}
.ic-tbl-r{border-bottom:1px solid var(--border)}
.ic-tbl-r.is-lead{background:var(--brand-50);border-radius:var(--r-md)}
.ic-tbl-pos{font-weight:700;color:var(--ink-muted);text-align:center}
.ic-tbl-team{display:flex;align-items:center;gap:.45rem;font-weight:600}
.ic-tbl-pts{font-weight:700;text-align:center}
.ic-tbl-db{text-align:center;font-size:.78rem;color:var(--ink-muted)}
.ic-tbl-db.pos{color:var(--success)}.ic-tbl-db.neg{color:#ef4444}
.ic-mock-match{width:230px}
.ic-mm-status{display:inline-block;font-size:.66rem;font-weight:700;color:var(--ink-muted);background:var(--surface-muted);padding:.2rem .55rem;border-radius:100px;margin-bottom:.6rem}
.ic-mm-row{display:flex;align-items:center;gap:.5rem;font-weight:600;padding:.3rem 0}
.ic-mm-score{margin-left:auto;font-weight:800;font-size:1.05rem}
.ic-mm-pen{margin-top:.4rem;font-size:.72rem;color:var(--gold-600);font-weight:600}
.ic-mock-bracket{width:215px}
.ic-bn-title{font-size:.72rem;font-weight:700;color:var(--ink-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.6rem}
.ic-bn-side{display:flex;align-items:center;gap:.5rem;font-weight:600;padding:.45rem .55rem;border:1px solid var(--border);border-radius:var(--r-md)}
.ic-bn-side.is-tbd{border-style:dashed;color:var(--ink-muted);font-weight:500}
.ic-bn-dash{width:1.5rem;height:1.5rem;border:1.5px dashed var(--border-strong);border-radius:50%}
.ic-bn-vs{text-align:center;font-size:.68rem;color:var(--ink-muted);padding:.25rem 0}
.ic-mc-bars{display:flex;flex-direction:column;gap:.8rem}
.ic-bar-top{display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:.3rem}
.ic-bar-top span{color:var(--ink-muted)}.ic-bar-top strong{font-weight:700}
.ic-bar-track{height:7px;background:var(--surface-muted);border-radius:100px;overflow:hidden}
.ic-bar-track span{display:block;height:100%;background:var(--success);border-radius:100px}
.ic-draw{display:flex;gap:.6rem}
.ic-draw-g{flex:1;display:flex;flex-direction:column;gap:.35rem}
.ic-draw-gt{font-size:.68rem;font-weight:700;color:var(--brand-700);background:var(--brand-50);padding:.2rem;border-radius:var(--r-md);text-align:center}
.ic-draw-slot{display:flex;align-items:center;gap:.35rem;font-size:.72rem;font-weight:600;padding:.3rem;border:1px solid var(--border);border-radius:var(--r-md)}
.ic-draw-slot .ic-av{width:1.1rem;height:1.1rem;font-size:.5rem}
.ic-cal{display:flex;gap:.6rem}
.ic-cal-col{flex:1;display:flex;flex-direction:column;gap:.4rem}
.ic-cal-h{font-size:.7rem;font-weight:700;text-align:center;color:var(--ink-subtle)}
.ic-cal-slot{font-size:.72rem;font-weight:600;text-align:center;padding:.5rem .3rem;border-radius:var(--r-md);background:var(--brand-50);color:var(--brand-700)}
.ic-cal-slot.is-empty{background:transparent;border:1.5px dashed var(--border-strong);color:var(--ink-muted);font-weight:500}

.ic-hide-sm{}
/* responsive */
@media(max-width:900px){
  .ic-feature-grid,.ic-pricing{grid-template-columns:1fr}
  .ic-plan.is-featured{transform:none}
  .ic-step{grid-template-columns:40px 1fr;gap:1rem 1.3rem}
  .ic-step .ic-step-visual{grid-column:1/-1;order:3 !important;margin-top:1rem}
  .ic-step.is-rev .ic-step-body{order:2 !important}
  .ic-step-node{width:40px;height:40px;font-size:1rem}
  .ic-hero-preview{display:none}
}
@media(max-width:720px){
  .ic-nav-links{position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;background:var(--surface);
    border-bottom:1px solid var(--border);padding:.5rem 0;display:none}
  .ic-nav-links.is-open{display:flex}
  .ic-nav-links a{padding:.8rem clamp(1rem,5vw,3rem);width:100%}
  .ic-burger{display:flex}
  .ic-hide-sm{display:none}
  .ic-footer-top{flex-direction:column;gap:2rem}
}
@media(prefers-reduced-motion:reduce){.ic-float{animation:none}}
`}</style>
  );
}
