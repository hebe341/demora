import { test, expect } from '@playwright/test';

// Accessibility test using axe-core injected from CDN
test('accessibility scan - home page (axe)', async ({ page }) => {
  await page.goto('/');

  // inject axe
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.6.3/axe.min.js' });

  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });

  // Log violations if any
  if (results.violations && results.violations.length > 0) {
    console.log('Accessibility violations found:');
    for (const v of results.violations) {
      console.log(v.id, v.impact, v.help, v.nodes.map(n => n.target).slice(0,3));
    }
  }

  expect(results.violations.length).toBe(0);
});
