import domtoimage from 'https://esm.sh/dom-to-image';
import { elementToSVG } from 'https://esm.sh/dom-to-svg';
import Pickr from 'https://esm.sh/@simonwep/pickr';
import { parseMd } from './parse.js';

const render = (text, div) => {
    const lines = text.split("\n");
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


window.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('#input>textarea');
    const outputContainer = document.querySelector('#output');
    const outputImgContainer = document.querySelector('#output-image');
    const output = document.querySelector("#output-lines");
    const opFont = document.querySelector('#output-font');
    const dl = document.querySelector('#download-btn');
    const outputWrapper = document.querySelector('#output-container');
    const opSize = document.querySelector('#output-font-size');
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

    textarea.oninput = () => render(textarea.value, output);
    opFont.oninput = () => outputContainer.style.fontFamily = opFont.value;
    dl.onclick = async () => {
        const border = window.getComputedStyle(outputContainer).border;
        outputContainer.style.border = 'none';
        const svg = elementToSVG(outputContainer);
        const img = document.createElement('img');
        img.src = `data:image/svg+xml;base64,${window.btoa((new XMLSerializer().serializeToString(svg)))}`;
        img.width = 3000;
        img.height = 3000;
        img.onload = () => {
            domtoimage.toBlob(img)
                .then((data) => {
                    let filename = opFile.value.trim() || 'poem';
                    download(data, `${filename}.png`);
                    outputContainer.style.border = border;
                })
                .then(_ => img.remove())
                .catch(e => console.error(e));
        }
        outputImgContainer.appendChild(img);
    }

    opSize.oninput = () => {
        const outputSize = parseFloat(getComputedStyle(document.body).getPropertyValue('--output-font-size').replace(/[^0-9.]/g, ''));
        console.log(outputSize)
        outputContainer.style.fontSize = (outputSize * (opSize.value / 100)) + 'vw';
    }

    render(textarea.value, output);
})