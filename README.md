# rnw-bookkeping
Website for RNW Bookkeeping Solutions.

RNW offers bookkeeping, payroll and Financial Consulting services.
Services offered in ENG/PTB/ESP.
Based in Springfield, Missouri.

## Running Locally

```bash
# Start a local development server
python3 -m http.server 5500
# Then open http://localhost:5500 in your browser
```

## Project Structure

```
rnw-bookkeping/
├── index.html              # Main HTML page
├── script.js               # JavaScript (carousel, animations, smooth scroll, etc.)
├── styles/
│   ├── style.css           # Entry point — imports all modules below
│   ├── base.css            # CSS variables, reset, typography, utilities
│   ├── hero.css            # Hero section + navigation bar
│   ├── cards.css           # Grid layout, cards, stat numbers
│   ├── testimonials.css    # Swipeable carousel, dots, arrows
│   ├── form.css            # Contact form inputs & button
│   └── footer.css          # Footer layout, social icons, attributions
├── assets/
│   └── img/                # PNG icons, SVG icons, favicon
└── README.md
```

## Shortcuts for Debug (for the developer)

### For debugging CSS

Open DevTools (F12) and use these in the Console:

```js
// Inspect CSS custom properties
getComputedStyle(document.documentElement).getPropertyValue('--primary-color')

// List all defined CSS variables on :root
Array.from(document.styleSheets).flatMap(s => Array.from(s.cssRules))
  .filter(r => r.selectorText === ':root')
  .flatMap(r => Array.from(r.style))
  .filter(p => p.startsWith('--'))

// Toggle all reveal animations off (for layout debugging)
document.querySelectorAll('.reveal').forEach(el => {
  el.classList.remove('reveal', 'revealed');
  el.style.opacity = '1';
  el.style.transform = 'none';
})
```

### For debugging JavaScript

```js
// Check if all init functions ran
// (look for "RNW Bookkeeping Solutions — Main Script" in Sources > script.js)

// Force re-run the count-up animation on stats
initCountUp()

// Scroll testimonials to a specific card index (0-based)
document.querySelectorAll('.testimonial-card')[1].scrollIntoView({ inline: 'center', behavior: 'smooth' })

// Debug testimonial IntersectionObserver state
const wrapper = document.querySelector('.testimonials-wrapper');
const cards = document.querySelectorAll('.testimonial-card');
Array.from(cards).map(c => ({
  text: c.querySelector('strong')?.textContent?.slice(0, 30),
  visible: wrapper ? isElementInView(c, wrapper) : false
}))
```

### For HTML validation

```bash
# Using the W3C Nu HTML Checker (requires curl + network)
curl -H "Content-Type: text/html; charset=utf-8" \
     --data-binary @index.html \
     https://validator.w3.org/nu/?out=json | json_pp
```

### For checking HTTP server (if running)

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5500/
# Returns 200 if the server is running