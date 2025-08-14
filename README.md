# Poetry Photos

A web application that converts text poetry into styled images.

## Features

- Markdown support
- Choose from Google Fonts for typography
- Export styled poetry as PNG images
- Real-time preview of styled text

## Usage

1. Open the web application
2. Paste or type your text into the input area
3. Adjust styling options:
   - Background color
   - Text color
   - Font size
   - Font family
4. Set the output filename
5. Click the download button to save as PNG

## Technical details

This project is written in HTML/vanilla JS/CSS, and uses the following libs:

- [dom-to-image](https://github.com/tsayen/dom-to-image) for image generation
- [Pickr](https://github.com/Simonwep/pickr) for color picker functionality
- [Marked](https://github.com/markedjs/marked) for Markdown parsing
- [sanitize-html](https://github.com/apostrophecms/sanitize-html) for HTML
  sanitization

## Installation

To run locally:

1. Clone the repository
2. Serve the files using any static web server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

## Contributing

Feel free to make a pull request or open an issue!

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Hosted Version

A live version is available at: https://shantaram.xyz/poetry-photos
