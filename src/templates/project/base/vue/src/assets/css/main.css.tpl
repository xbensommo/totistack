/**
 * @file main.css
 * @description Main stylesheet
 * @date {{currentDate}}
 */

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: {{primaryColor}};
  --color-secondary: {{secondaryColor}};
  --font-sans: 'Inter', sans-serif;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}