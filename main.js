import domtoimage from 'https://esm.sh/dom-to-image';
import { elementToSVG } from 'https://esm.sh/dom-to-svg';
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

window.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('#input>textarea');
    const outputContainer = document.querySelector('#output');
    const outputImgContainer = document.querySelector('#output-image');
    const output = document.querySelector("#output-lines");
    const fgColor = document.querySelector('#output-fg-color');
    const bgColor = document.querySelector('#output-bg-color');
    const opFont = document.querySelector('#output-font');
    const dl = document.querySelector('#download-btn');
    const opSize = document.querySelector('#output-font-size');

    const opFile = document.querySelector('#output-filename');

    textarea.oninput = () => render(textarea.value, output);
    fgColor.oninput = () => outputContainer.style.color = fgColor.value;
    bgColor.oninput = () => outputContainer.style.backgroundColor = bgColor.value;
    opFont.oninput = () => outputContainer.style.fontFamily = opFont.value;
    dl.onclick = async () => {
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
                })
                .then(_ => img.remove())
                .catch(e => console.error(e));
        }
        outputImgContainer.appendChild(img);
    }

    opSize.oninput = () => {
        const outputSize = parseFloat(getComputedStyle(document.body).getPropertyValue('--output-font-size').replace(/[^0-9.]/g, ''));
        outputContainer.style.fontSize = (outputSize * (opSize.value / 100)) + 'vw';
    }
})