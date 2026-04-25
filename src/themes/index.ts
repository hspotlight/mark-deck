// Custom Marp theme CSS strings.
// Each starts with `/* @theme <name> */` as required by Marp for theme registration.

export const professionalCss = `/* @theme mark-deck-professional */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

section {
  background: #FFFFFF;
  color: #1E293B;
  font-family: Inter, system-ui, sans-serif;
  font-size: 28px;
  padding: 60px 80px;
}

h1 {
  color: #6366F1;
  font-size: 2em;
  font-weight: 700;
  border-bottom: 3px solid #6366F1;
  padding-bottom: 0.2em;
  margin-bottom: 0.5em;
}

h2 {
  color: #1E293B;
  font-size: 1.5em;
  font-weight: 600;
}

a { color: #6366F1; }

code {
  background: #F1F5F9;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  font-size: 0.85em;
}

pre code { background: none; padding: 0; }

pre {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 1em;
}
`;

export const academicCss = `/* @theme mark-deck-academic */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

section {
  background: #F8F7F4;
  color: #1A1A2E;
  font-family: Inter, Georgia, serif;
  font-size: 26px;
  padding: 60px 80px;
}

h1 {
  color: #3B5BDB;
  font-size: 1.9em;
  font-weight: 700;
  margin-bottom: 0.5em;
}

h2 {
  color: #1A1A2E;
  font-size: 1.4em;
  font-weight: 600;
  border-left: 4px solid #3B5BDB;
  padding-left: 0.5em;
}

a { color: #3B5BDB; }

code {
  background: #EEF2FF;
  padding: 0.1em 0.4em;
  border-radius: 3px;
  font-size: 0.85em;
}

pre {
  background: #EEF2FF;
  border-radius: 6px;
  padding: 1em;
}
`;

export const darkCss = `/* @theme mark-deck-dark */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

section {
  background: #0F172A;
  color: #F1F5F9;
  font-family: Inter, system-ui, sans-serif;
  font-size: 28px;
  padding: 60px 80px;
}

h1 {
  color: #818CF8;
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 0.5em;
}

h2 {
  color: #E2E8F0;
  font-size: 1.5em;
  font-weight: 600;
}

a { color: #818CF8; }

code {
  background: #1E293B;
  color: #818CF8;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  font-size: 0.85em;
}

pre {
  background: #1E293B;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 1em;
}
`;

export const vibrantCss = `/* @theme mark-deck-vibrant */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

section {
  background: #FAFAFA;
  color: #18181B;
  font-family: Inter, system-ui, sans-serif;
  font-size: 28px;
  padding: 60px 80px;
}

h1 {
  color: #7C3AED;
  font-size: 2em;
  font-weight: 800;
  margin-bottom: 0.5em;
}

h2 {
  color: #18181B;
  font-size: 1.5em;
  font-weight: 700;
  background: linear-gradient(135deg, #7C3AED 0%, #6366F1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

a { color: #7C3AED; }

code {
  background: #F3E8FF;
  color: #7C3AED;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  font-size: 0.85em;
}

pre {
  background: #F3E8FF;
  border-radius: 8px;
  padding: 1em;
}
`;

export const minimalCss = `/* @theme mark-deck-minimal */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

section {
  background: #FFFFFF;
  color: #374151;
  font-family: Inter, system-ui, sans-serif;
  font-size: 26px;
  padding: 80px 100px;
}

h1 {
  color: #374151;
  font-size: 1.8em;
  font-weight: 600;
  margin-bottom: 0.8em;
}

h2 {
  color: #6B7280;
  font-size: 1.3em;
  font-weight: 500;
}

a { color: #9CA3AF; }

hr {
  border: none;
  border-top: 1px solid #E5E7EB;
  margin: 1em 0;
}

code {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 0.1em 0.4em;
  border-radius: 3px;
  font-size: 0.85em;
}

pre {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  padding: 1em;
}
`;

export const THEME_NAMES: Record<string, string> = {
  default: "Default",
  gaia: "Gaia",
  uncover: "Uncover",
  "mark-deck-professional": "Professional",
  "mark-deck-academic": "Academic",
  "mark-deck-dark": "Dark",
  "mark-deck-vibrant": "Vibrant",
  "mark-deck-minimal": "Minimal",
};

export const CUSTOM_THEMES = [
  professionalCss,
  academicCss,
  darkCss,
  vibrantCss,
  minimalCss,
];
