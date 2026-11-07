# Digital Wardrobe

Digital Wardrobe is a personal styling tool built with vanilla JavaScript, HTML5, and CSS3. It allows users to catalog their clothing items, combine pieces into custom outfits, and view recommendations based on current weather.

All data is stored directly in the browser using `localStorage`, requiring no database, account setup, or backend server.

---

## Features

- **Item Catalog**: Add clothing items with photo uploads, category tags (Tops, Bottoms, Outerwear, Shoes, Accessories, Dresses), color swatches, brand names, and personal notes.
- **Search & Filter**: Filter garments by category and search through your closet in real time.
- **Outfit Builder**: Mix and match pieces on an interactive canvas to compose coordinated looks.
- **Saved Outfits**: Save completed outfits to a personal lookbook for quick reference.
- **Weather Suggestions**: Suggests appropriate clothing layers based on current weather conditions (sunny, rainy, chilly, hot).
- **Offline & Private**: Runs entirely in the client's browser. Photos and item details stay on your device.

---

## How to Run

No installations, build steps, or package managers are required.

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/mundev1/digital-wadrobe.git
   cd digital-wadrobe
   ```

2. Open `index.html` in any web browser:
   - On macOS: `open index.html`
   - On Windows: double-click `index.html`
   - On Linux: `xdg-open index.html`

Alternatively, you can run a local server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## Project Structure

```text
digital-wadrobe/
├── index.html                   # Main application interface and views
├── script.js                    # Application logic, state management, and DOM handling
├── style.css                    # Styling and responsive layout rules
├── DigitalWardrobefinal.pptx    # Project presentation slides
├── Synopsis_DigitalWardrobe.docx# Project synopsis document
└── README.md                    # Project documentation
```
