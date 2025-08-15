import domtoimage from 'https://esm.sh/dom-to-image-more@3.6.3';
import Pickr from 'https://esm.sh/@simonwep/pickr';
import { parseMd } from './parse.js';

const render = (text, div) => {
    div.innerHTML = parseMd(text);
}

const download = (blob, filename) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const PICKR_CFG = {
    theme: 'monolith',
    swatches: [
        '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
    ],
    components: {
        hue: true,
        comparison: false,
        interaction: {
            hex: true,
            rgba: true,
            input: true,
        }
    }
}


self.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('#input>textarea');
    const outputContainer = document.querySelector('#output');
    const output = document.querySelector("#output-lines");
    const dl = document.querySelector('#download-btn');
    const opSize = document.querySelector('#output-font-size');
    const opSizeText = document.querySelector('#output-font-size-text');
    const opFile = document.querySelector('#output-filename');

    // Initialize Pickr for background color
    const bgColorPicker = Pickr.create({
        el: '#output-bg-color',
        default: '#ffffffff',
        ...PICKR_CFG
    });

    const fgColorPicker = Pickr.create({
        default: '#000000ff',
        el: '#output-fg-color',
        ...PICKR_CFG
    });

    const accentColorPicker = Pickr.create({
        default: '#aaaaaaff',
        el: '#accent-color',
        ...PICKR_CFG
    });

    // Set initial colors
    outputContainer.style.backgroundColor = '#ffffff';
    outputContainer.style.color = '#000000';

    // Handle color changes
    bgColorPicker.on('change', (color) => {
        bgColorPicker.applyColor();
        const hexColor = color.toHEXA().toString();
        outputContainer.style.backgroundColor = hexColor;
    });

    fgColorPicker.on('change', (color) => {
        fgColorPicker.applyColor();
        const hexColor = color.toHEXA().toString();
        outputContainer.style.color = hexColor;
    });

    accentColorPicker.on('change', (color) => {
        accentColorPicker.applyColor();
        const hexColor = color.toHEXA().toString();
        outputContainer.style.setProperty('--accent-color', hexColor);
    });

    textarea.oninput = () => render(textarea.value, output);
    dl.onclick = () => {
        const border = globalThis.getComputedStyle(outputContainer).border;
        outputContainer.style.border = 'none';
        domtoimage.toBlob(outputContainer)
            .then((data) => {
                const filename = opFile.value.trim() || 'poem';
                download(data, `${filename}.png`);
                outputContainer.style.border = border;
            })
            .catch(e => console.error(e));
    }

    opSize.oninput = () => {
        const outputSize = parseFloat(getComputedStyle(document.body).getPropertyValue('--output-font-size').replace(/[^0-9.]/g, ''));
        opSizeText.value = opSize.value;
        outputContainer.style.fontSize = (outputSize * (opSize.value / 100)) + 'vw';
    }

    opSizeText.oninput = () => {
        let value = parseInt(opSizeText.value) || 0;
        value = Math.max(0, Math.min(200, value));
        opSizeText.value = value;
        opSize.value = value;
        const outputSize = parseFloat(getComputedStyle(document.body).getPropertyValue('--output-font-size').replace(/[^0-9.]/g, ''));
        outputContainer.style.fontSize = (outputSize * (value / 100)) + 'vw';
    }

    render(textarea.value, output);
})