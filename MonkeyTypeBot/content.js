(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;900&family=JetBrains+Mono:wght@400&display=swap');
        
        #wannacrawl-final {
            position: fixed; top: 30px; right: 30px; width: 340px;
            background: rgba(5, 5, 5, 0.95); backdrop-filter: blur(15px);
            border-radius: 24px; border: 2px solid rgba(0, 255, 65, 0.3);
            padding: 30px; z-index: 100000; font-family: 'Orbitron', sans-serif;
            box-shadow: 0 10px 40px rgba(0,0,0,0.9); transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            display: flex; flex-direction: column; align-items: center; user-select: none;
        }

        #wannacrawl-final.god-active { border-color: #ff003c; box-shadow: 0 0 35px rgba(255, 0, 60, 0.3); }

        #title-box { text-align: center; margin-bottom: 15px; }
        #main-label { 
            font-size: 28px; font-weight: 900; letter-spacing: 4px; 
            color: #00ff41; transition: 0.5s; cursor: grab;
            text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
        }
        .god-active #main-label { color: #ff003c; text-shadow: 0 0 20px #ff003c; }

        #god-status { 
            font-size: 10px; color: #ff003c; letter-spacing: 6px; font-weight: 900;
            margin-top: 5px; opacity: 0; transform: translateY(5px); transition: 0.5s;
        }
        .god-active #god-status { opacity: 1; transform: translateY(0); }

        #wpm-display { color: #fff; font-size: 18px; font-weight: bold; margin-bottom: 5px; }

        #wpm-range { width: 100%; -webkit-appearance: none; background: transparent; margin: 15px 0; cursor: pointer; }
        #wpm-range::-webkit-slider-runnable-track { width: 100%; height: 2px; background: #333; }
        #wpm-range::-webkit-slider-thumb { 
            -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; 
            background: #fff; margin-top: -7px; box-shadow: 0 0 10px #00ff41; 
        }
        .god-active #wpm-range::-webkit-slider-thumb { background: #ff003c; box-shadow: 0 0 15px #ff003c; }

        .btn-ui {
            width: 100%; padding: 14px; margin-top: 15px; border-radius: 12px;
            background: transparent; border: 1px solid #00ff41; color: #00ff41;
            font-family: 'Orbitron'; font-size: 12px; font-weight: 900; cursor: pointer;
            transition: 0.3s; letter-spacing: 2px;
        }
        .btn-ui:hover { background: rgba(0, 255, 65, 0.1); box-shadow: 0 0 20px rgba(0, 255, 65, 0.2); }
        .god-active .btn-ui { border-color: #ff003c; color: #ff003c; }

        .warning-box { 
            margin-top: 20px; font-family: 'JetBrains Mono', monospace; font-size: 9px; 
            color: #666; text-align: center; text-transform: uppercase; letter-spacing: 1px;
        }
        
        #tg-link { 
            margin-top: 20px; font-size: 11px; color: #00d4ff; 
            text-decoration: none; font-weight: 900; opacity: 0.7; transition: 0.3s;
        }
        #tg-link:hover { opacity: 1; text-shadow: 0 0 10px #00d4ff; }
    `;
    document.head.appendChild(style);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playKeySound(isSpace) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.frequency.setValueAtTime(isSpace ? 130 : 1500, t);
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(); osc.stop(t + 0.04);
    }

    const ui = document.createElement('div');
    ui.id = 'wannacrawl-final';
    ui.innerHTML = `
        <div id="title-box">
            <div id="main-label">WANNACRAWL</div>
            <div id="god-status">GOD MODE ACTIVE</div>
        </div>
        <span id="wpm-display">120 WPM</span>
        <input type="range" id="wpm-range" min="30" max="500" value="120">
        <button id="reboot-btn" class="btn-ui">SYSTEM REBOOT</button>
        <div class="warning-box">
            <span>[ HIGH RISK OF BAN ABOVE 200 WPM ]</span>
        </div>
        <a href="https://t.me/wannacrawl" id="tg-link" target="_blank">T.ME/WANNACRAWL</a>
    `;
    document.body.appendChild(ui);

    let isDragging = false, offX, offY;
    const dragBox = document.getElementById('main-label');
    dragBox.onmousedown = (e) => { isDragging = true; offX = e.clientX - ui.offsetLeft; offY = e.clientY - ui.offsetTop; };
    document.onmousemove = (e) => { if (isDragging) { ui.style.left = (e.clientX - offX) + 'px'; ui.style.top = (e.clientY - offY) + 'px'; ui.style.right = 'auto'; } };
    document.onmouseup = () => isDragging = false;

    let targetWPM = 120, isRunning = false;
    const slider = document.getElementById('wpm-range');
    const display = document.getElementById('wpm-display');

    slider.oninput = function() {
        targetWPM = this.value;
        display.innerText = targetWPM + " WPM";
        if (targetWPM > 150) ui.classList.add('god-active');
        else ui.classList.remove('god-active');
    };

    document.getElementById('reboot-btn').onclick = () => location.reload();

    async function pressKey(char) {
        const input = document.querySelector('#wordsInput');
        const keyCode = char.charCodeAt(0);
        
        input.dispatchEvent(new KeyboardEvent('keydown', { key: char, keyCode: keyCode, bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keypress', { key: char, keyCode: keyCode, bubbles: true }));
        
        input.value += char;
        input.dispatchEvent(new InputEvent('input', { data: char, inputType: 'insertText', bubbles: true }));
        
        input.dispatchEvent(new KeyboardEvent('keyup', { key: char, keyCode: keyCode, bubbles: true }));
        playKeySound(char === ' ');
    }

    async function startBot() {
        if (isRunning) return;
        isRunning = true;

        while (isRunning) {
            const activeWord = document.querySelector('.word.active');
            if (!activeWord) { isRunning = false; break; }
            const letters = Array.from(activeWord.querySelectorAll('letter')).map(l => l.textContent).join('') + ' ';
            
            for (let char of letters) {
                if (!isRunning || !document.querySelector('.word.active')) break;

                await pressKey(char);

                const baseDelay = (60000 / (targetWPM * 5));
                const humanVariance = (Math.random() * 0.4) + 0.8; 
                const microPause = char === ' ' ? baseDelay * 1.6 : baseDelay; 

                await new Promise(r => setTimeout(r, microPause * humanVariance));
            }
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isRunning && document.querySelector('.word.active')) {
            e.preventDefault(); startBot();
        }
        if (e.code === 'Tab') isRunning = false;
    });
})();