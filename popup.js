document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const formats = document.getElementById('formats');
    const colorHistory = document.getElementById('colorHistory');
    const copiedNotification = document.getElementById('copied');
    
    // Load color history from storage
    let history = JSON.parse(localStorage.getItem('colorHistory') || '[]');
    updateHistoryDisplay();

    // Color conversion functions
    const colorConversions = {
        hex: (r, g, b) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
        rgb: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
        hsl: (r, g, b) => {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
        },
        cmyk: (r, g, b) => {
            let c = 1 - (r / 255);
            let m = 1 - (g / 255);
            let y = 1 - (b / 255);
            let k = Math.min(c, m, y);
            
            c = Math.round(((c - k) / (1 - k)) * 100) || 0;
            m = Math.round(((m - k) / (1 - k)) * 100) || 0;
            y = Math.round(((y - k) / (1 - k)) * 100) || 0;
            k = Math.round(k * 100);
            
            return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
        }
    };

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function updateFormats(color) {
        const rgb = hexToRgb(color);
        if (!rgb) return;

        const formatElements = formats.querySelectorAll('.format-item');
        formatElements.forEach(elem => {
            const format = elem.dataset.format;
            const valueElement = elem.querySelector('.format-value');
            valueElement.textContent = colorConversions[format](rgb.r, rgb.g, rgb.b);
        });
    }

    function addToHistory(color) {
        if (!history.includes(color)) {
            history.unshift(color);
            if (history.length > 10) history.pop();
            localStorage.setItem('colorHistory', JSON.stringify(history));
            updateHistoryDisplay();
        }
    }

    function updateHistoryDisplay() {
        colorHistory.innerHTML = '';
        history.forEach(color => {
            const div = document.createElement('div');
            div.className = 'history-color';
            div.style.backgroundColor = color;
            div.addEventListener('click', () => {
                colorPicker.value = color;
                updateFormats(color);
            });
            colorHistory.appendChild(div);
        });
    }

    function showCopiedNotification() {
        copiedNotification.style.display = 'block';
        setTimeout(() => {
            copiedNotification.style.display = 'none';
        }, 1500);
    }

    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        updateFormats(color);
        addToHistory(color);
    });

    formats.addEventListener('click', (e) => {
        const formatItem = e.target.closest('.format-item');
        if (formatItem) {
            const valueElement = formatItem.querySelector('.format-value');
            navigator.clipboard.writeText(valueElement.textContent).then(() => {
                showCopiedNotification();
            });
        }
    });
});