// ==================== 日期时间 ====================
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', { 
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
    });
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
    document.getElementById('date').textContent = dateStr;
    document.getElementById('time').textContent = timeStr;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// ==================== 鼠标彩虹拖尾 ====================
const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3', '#ff1493', '#00ffff'];
let colorIdx = 0;

document.addEventListener('mousemove', (e) => {
    const dot = document.createElement('div');
    dot.className = 'rainbow-dot';
    dot.style.left = e.clientX - 6 + 'px';
    dot.style.top = e.clientY - 6 + 'px';
    dot.style.backgroundColor = rainbowColors[colorIdx];
    dot.style.boxShadow = `0 0 10px ${rainbowColors[colorIdx]}, 0 0 20px ${rainbowColors[colorIdx]}`;
    document.body.appendChild(dot);
    colorIdx = (colorIdx + 1) % rainbowColors.length;
    setTimeout(() => dot.remove(), 1000);
});

// ==================== IP定位 ====================
async function fetchLocation() {
    const ipEl = document.getElementById('ipLocation');
    
    // 尝试多个API（优先支持HTTPS的）
    try {
        // 方案1: ipapi.co (支持HTTPS，免费)
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.ip) {
            const loc = data.city || data.region || '';
            ipEl.textContent = `📍 ${data.ip} | ${loc}, ${data.country_name}`;
            return;
        }
    } catch (e) { console.log('ipapi.co failed'); }
    
    try {
        // 方案2: geolocation-db.com (支持HTTPS)
        const res = await fetch('https://geolocation-db.com/json/');
        const data = await res.json();
        if (data.IPv4) {
            const loc = data.city || data.state || '';
            ipEl.textContent = `📍 ${data.IPv4} | ${loc}, ${data.country_name}`;
            return;
        }
    } catch (e) { console.log('geolocation-db failed'); }
    
    try {
        // 方案3: ip.sb (支持HTTPS，返回简单信息)
        const res = await fetch('https://api.ip.sb/geoip');
        const data = await res.json();
        if (data.ip) {
            const loc = data.city || '';
            ipEl.textContent = `📍 ${data.ip} | ${loc}, ${data.country}`;
            return;
        }
    } catch (e) { console.log('ip.sb failed'); }
    
    // 所有API都失败，只显示IP
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ipEl.textContent = `📍 ${data.ip}`;
    } catch (e) {
        ipEl.textContent = '📍 位置获取失败';
    }
}
fetchLocation();

// ==================== 游戏管理 ====================
const container = document.getElementById('gameContainer');
let currentGame = null;
let timers = {};

function clearGame() {
    Object.entries(timers).forEach(([key, t]) => {
        if (key.includes('Loop')) {
            cancelAnimationFrame(t);
        } else {
            clearInterval(t);
            clearTimeout(t);
        }
    });
    timers = {};
    container.innerHTML = '';
    container.classList.remove('active');
    currentGame = null;
}

function addCloseBtn() {
    const btn = document.createElement('button');
    btn.className = 'close-btn';
    btn.textContent = '×';
    btn.onclick = clearGame;
    container.appendChild(btn);
}

// ==================== 烟花游戏 ====================
let lastFireworkTime = 0;
const FIREWORK_INTERVAL = 1200; // 烟花间隔(ms)

function startFireworks() {
    clearGame();
    currentGame = 'fireworks';
    container.classList.add('active');
    addCloseBtn();
    
    container.onclick = (e) => {
        if (!e.target.classList.contains('close-btn')) {
            createFirework(e.clientX, e.clientY);
        }
    };
    
    // 初始烟花
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createFirework(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight * 0.4
        ), i * 200);
    }
    
    lastFireworkTime = performance.now();
    timers.fireworkLoop = requestAnimationFrame(fireworkLoop);
}

// 使用 requestAnimationFrame + 页面可见性检测
function fireworkLoop(timestamp) {
    if (currentGame !== 'fireworks') return;
    
    // 只有页面可见时才生成烟花
    if (!document.hidden) {
        if (timestamp - lastFireworkTime >= FIREWORK_INTERVAL) {
            createFirework(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight * 0.6
            );
            lastFireworkTime = timestamp;
        }
    } else {
        // 页面不可见时，重置时间基准，避免积攒
        lastFireworkTime = timestamp;
    }
    
    timers.fireworkLoop = requestAnimationFrame(fireworkLoop);
}

function createFirework(x, y) {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#5f27cd', '#fff'];
    const count = 35 + Math.floor(Math.random() * 25);
    
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'firework-particle';
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.backgroundColor = color;
        p.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;
        
        const angle = (Math.PI * 2 / count) * i;
        const speed = 50 + Math.random() * 70;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        container.appendChild(p);
        
        let px = x, py = y, opacity = 1, frame = 0;
        function animate() {
            frame++;
            px += vx / 25;
            py += vy / 25 + frame * 0.12;
            opacity -= 0.02;
            p.style.left = px + 'px';
            p.style.top = py + 'px';
            p.style.opacity = opacity;
            p.style.transform = `scale(${opacity})`;
            if (opacity > 0) requestAnimationFrame(animate);
            else p.remove();
        }
        requestAnimationFrame(animate);
    }
}

// ==================== 泡泡游戏 ====================
let bubbleScore = 0;

function startBubble() {
    clearGame();
    currentGame = 'bubble';
    bubbleScore = 0;
    container.classList.add('active');
    addCloseBtn();
    
    const score = document.createElement('div');
    score.className = 'game-score';
    score.id = 'gameScore';
    score.textContent = '🫧 分数: 0 | ⏱️ 30秒';
    container.appendChild(score);
    
    timers.spawn = setInterval(spawnBubble, 600);
    
    let timeLeft = 30;
    timers.countdown = setInterval(() => {
        timeLeft--;
        document.getElementById('gameScore').textContent = `🫧 分数: ${bubbleScore} | ⏱️ ${timeLeft}秒`;
        if (timeLeft <= 0) {
            clearInterval(timers.spawn);
            clearInterval(timers.countdown);
            alert(`🎉 游戏结束！得分: ${bubbleScore}`);
            clearGame();
        }
    }, 1000);
}

function spawnBubble() {
    if (currentGame !== 'bubble') return;
    
    const size = 50 + Math.random() * 30;
    const x = 20 + Math.random() * (window.innerWidth - size - 40);
    const y = 140 + Math.random() * (window.innerHeight - size - 200);
    
    const bubble = document.createElement('div');
    bubble.className = 'game-bubble';
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = x + 'px';
    bubble.style.top = y + 'px';
    
    const colors = ['rgba(255,107,107,0.7)', 'rgba(254,202,87,0.7)', 'rgba(29,209,153,0.7)', 'rgba(72,219,251,0.7)'];
    bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
    bubble.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    
    const emojis = ['🫧', '🎈', '🔴', '🟡', '🟢', '🔵'];
    bubble.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    bubble.onclick = (e) => {
        e.stopPropagation();
        bubbleScore += 10;
        document.getElementById('gameScore').textContent = `🫧 分数: ${bubbleScore} | ⏱️ ${document.getElementById('gameScore').textContent.match(/\d+秒/)[0]}`;
        showScorePopup(x + size/2, y, '+10', '#1dd1a1');
        bubble.classList.add('bubble-pop');
        setTimeout(() => bubble.remove(), 300);
    };
    
    container.appendChild(bubble);
    setTimeout(() => { if (bubble.parentNode) bubble.remove(); }, 4000);
}

function showScorePopup(x, y, text, color) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.style.color = color;
    popup.textContent = text;
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

// ==================== 反应测试 ====================
let reactionStart = 0;

function startReaction() {
    clearGame();
    currentGame = 'reaction';
    container.classList.add('active');
    addCloseBtn();
    
    const box = document.createElement('div');
    box.className = 'reaction-box reaction-wait';
    box.id = 'reactionBox';
    box.innerHTML = '<div style="font-size:1.3rem">等待绿色...</div><div style="font-size:0.9rem;margin-top:10px;opacity:0.8">点击开始</div>';
    container.appendChild(box);
    
    box.onclick = reactionRound;
}

function reactionRound() {
    const box = document.getElementById('reactionBox');
    box.className = 'reaction-box reaction-wait';
    box.innerHTML = '<div style="font-size:1.5rem">等待...</div>';
    box.onclick = () => {
        clearTimeout(timers.wait);
        box.className = 'reaction-box reaction-result';
        box.innerHTML = '<div style="font-size:1.2rem">太早了! 😅</div><div style="font-size:0.9rem;margin-top:10px">点击重试</div>';
        box.onclick = reactionRound;
    };
    
    timers.wait = setTimeout(() => {
        box.className = 'reaction-box reaction-go';
        box.innerHTML = '<div style="font-size:2rem">点击!</div>';
        reactionStart = Date.now();
        box.onclick = reactionResult;
    }, 1000 + Math.random() * 2500);
}

function reactionResult() {
    const ms = Date.now() - reactionStart;
    const box = document.getElementById('reactionBox');
    box.className = 'reaction-box reaction-result';
    
    let msg = ms < 200 ? '⚡ 闪电般!' : ms < 300 ? '🔥 超快!' : ms < 400 ? '👍 很好!' : ms < 500 ? '😊 还不错' : '🐢 可以更快哦';
    box.innerHTML = `<div style="font-size:1.8rem">${ms}ms</div><div style="font-size:1rem;margin-top:10px">${msg}</div><div style="font-size:0.8rem;margin-top:12px;opacity:0.7">点击重试</div>`;
    box.onclick = reactionRound;
}