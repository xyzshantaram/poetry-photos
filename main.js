import domtoimage from 'https://esm.sh/dom-to-image';

const render = (text, div) => {
    const lines = text.split("\n");
    div.innerHTML = '';
    for (const line of lines) {
        const node = document.createElement('span');
        node.textContent = line;
        div.appendChild(node);
    }
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
    dl.onclick = () => domtoimage.toBlob(outputContainer).then((data) => {
        let filename = opFile.value.trim() || 'poem';
        download(data, `${filename}.png`);
    })

    opSize.oninput = () => {
        const outputSize = parseFloat(getComputedStyle(document.body).getPropertyValue('--output-font-size').replace(/[^0-9.]/g, ''));
        outputContainer.style.fontSize = (outputSize * (opSize.value / 100)) + 'vw';
    }
})