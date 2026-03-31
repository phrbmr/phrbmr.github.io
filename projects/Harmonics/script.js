let activeScaleId = null;

// --- Overlay Logic ---
function openCredits(e) {
    if (e) e.preventDefault(); // Prevents the page from jumping to top
    document.getElementById('credits-modal').classList.add('show');
}

function closeCredits() {
    document.getElementById('credits-modal').classList.remove('show');
}
// --- 2. UI LOGIC ---
function generateStrudelCode(scaleId, noteCount) {
    // Generates "0 1 2 3..." up to the note count
    const pattern = Array.from({length: noteCount}, (_, i) => i).join(" ");
    if (scaleId == '12-ET') {
        return `n("${pattern}").scale("C4:chromatic")\n  .s("sine").color("deepPink")\n  .spectrum()`;
    } else {
        return `"${pattern}".tune("${scaleId}")\n  .mul("C4".fmap(getFreq)).freq()\n  .s("sine").color("deepPink")\n  .spectrum()`;
    }
}

function loadScale(scaleId) {
    const scale = scalesData.find(s => s.id === scaleId);
    if (!scale) return;

    activeScaleId = scaleId;

    // Update Info text
    document.getElementById('active-title').innerText = scale.name;
    document.getElementById('active-desc').innerText = scale.description;
    document.getElementById('active-badge').innerText = `${scale.notes} Notes`;

    // Generate Interval Matrix
    const matrixBody = document.getElementById('interval-matrix-body');
    matrixBody.innerHTML = ''; // Clear old data

    if (scale.intervals && scale.intervals.length > 0) {
        scale.intervals.forEach(interval => {
            const tr = document.createElement('tr');
            
            // Clean up the step text (e.g., "step_00" -> "00")
            const stepText = interval.step ? interval.step.replace('step_', '') : '-';
            
            tr.innerHTML = `
                <td>${stepText}</td>
                <td>${interval.cents || '-'}</td>
                <td>${interval.ratio || '-'}</td>
            `;
            matrixBody.appendChild(tr);
        });
    } else {
        matrixBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">No interval data available</td></tr>';
    }

    // Generate code and update Strudel REPL
    const newCode = generateStrudelCode(scale.id, scale.notes);
    const playerWrapper = document.getElementById('player-wrapper');
    playerWrapper.innerHTML = '';
    const newRepl = document.createElement('strudel-repl');
    newRepl.setAttribute('code', newCode);
    playerWrapper.appendChild(newRepl);

    
    // Update Visualizer parameter
    currentHarmonics = scale.notes;
    currentIntervalData = scale.intervals || []; 
    
    // Re-render list to show active state
    renderScaleList(document.getElementById('search-box').value);
}

function renderScaleList() {
    const listContainer = document.getElementById('scale-list');
    listContainer.innerHTML = ''; 

    // Read both filters directly from the DOM
    const filterText = document.getElementById('search-box').value.toLowerCase();
    const noteFilterValue = document.getElementById('note-filter').value;

    scalesData.forEach(scale => {
        // Check text search
        const matchesText = scale.name.toLowerCase().includes(filterText) || 
                            scale.description.toLowerCase().includes(filterText);
        
        // Check dropdown (if 'all', it always matches)
        const matchesNotes = noteFilterValue === 'all' || scale.notes.toString() === noteFilterValue;

        // Only render if BOTH conditions are met
        if (matchesText && matchesNotes) {
            const card = document.createElement('div');
            card.className = `scale-card ${scale.id === activeScaleId ? 'active' : ''}`;
            card.onclick = () => loadScale(scale.id);
            
            card.innerHTML = `
                <h3>${scale.name}</h3>
                <p>${scale.description.substring(0, 60)}${scale.description.length > 60 ? '...' : ''}</p>
                <span class="badge">${scale.notes} Notes</span>
            `;
            listContainer.appendChild(card);
        }
    });
}

function filterScales() {
    renderScaleList();
}

function populateNoteFilter() {
    const select = document.getElementById('note-filter');
    
    // Extract all note counts, remove duplicates using Set, and sort them numerically
    const uniqueNotes = [...new Set(scalesData.map(s => s.notes))].sort((a, b) => a - b);
    
    uniqueNotes.forEach(noteCount => {
        const option = document.createElement('option');
        option.value = noteCount;
        option.innerText = `${noteCount} Notes`;
        select.appendChild(option);
    });
}

// --- 3. CANVAS VISUALIZER LOGIC ---
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
const BASE_FREQ = 261.63; // C4 in Hz
const SPEED_OF_SOUND_MM = 343000; // mm/s

let time = 0;
let currentHarmonics = 1;
let isCombinedMode = false;
let isPaused = false;
let hoveredWaveIndex = -1; // -1 means no wave hovered
let mouseX = 0;
let mouseY = 0;



function toggleWaveMode() {
    isCombinedMode = document.getElementById('combine-waves').checked;
}

function togglePause() {
    isPaused = document.getElementById('pause-wave').checked;
    if (isPaused) {
        time = 0;
        drawWaves();
    }
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => {
    hoveredWaveIndex = -1;
    document.getElementById('spectral-panel').classList.remove('active');
});

// Handle canvas resizing properly
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);

function drawWaves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const timeSpeed = 0.05;     

    let closestWave = -1;
    let minDistance = Infinity;

    if (isCombinedMode) {
        // ... (Keep your existing Additive Synthesis Mode code exactly as it is here) ...
        ctx.beginPath();
        ctx.strokeStyle = 'var(--accent)';
        ctx.lineWidth = 3;
        const maxAmplitude = (height / 2) * 0.8; 
        for (let x = 0; x <= width; x++) {
            let ySum = 0;
            for (let h = 1; h <= currentHarmonics; h++) {
                const amp = maxAmplitude / h; 
                const spatial = Math.sin((x / width) * Math.PI * h);
                const temporal = Math.cos(time * h);
                ySum += amp * spatial * temporal;
            }
            if (x === 0) ctx.moveTo(x, centerY - ySum);
            else ctx.lineTo(x, centerY - ySum);
        }
        ctx.stroke();
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
        ctx.fill();

    } else {
        // --- SEPARATE WAVES MODE (With Hover Logic) ---
        const maxAmplitude = (height / 2) * 0.9;
        
        for (let h = 1; h <= currentHarmonics; h++) {
            const amp = maxAmplitude / Math.pow(h, 0.6); 
            
            // Math for the specific point under the mouse for THIS wave
            const spatialMouse = Math.sin((mouseX / width) * Math.PI * h);
            const temporalMouse = Math.cos(time * h);
            const waveYAtMouse = centerY - (amp * spatialMouse * temporalMouse);

            // Check if mouse is near this wave
            const dist = Math.abs(mouseY - waveYAtMouse);
            if (dist < 15 && dist < minDistance) {
                minDistance = dist;
                closestWave = h - 1; // 0-indexed for array matching
            }

            // Styling based on hover state
            const isHovered = (closestWave === h - 1);
            const isFaded = (hoveredWaveIndex !== -1 && !isHovered);
            
            ctx.beginPath();
            const hue = (h * 360 / Math.max(currentHarmonics, 1)) % 360;
            ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${isFaded ? 0.2 : 0.8})`; 
            ctx.lineWidth = isHovered ? 4 : 2;

            for (let x = 0; x <= width; x++) {
                const spatial = Math.sin((x / width) * Math.PI * h);
                const temporal = Math.cos(time * h);
                const y = centerY - (amp * spatial * temporal);
                
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Draw glowing dot on hovered wave
            if (isHovered) {
                ctx.beginPath();
                ctx.arc(mouseX, waveYAtMouse, 6, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${hue}, 80%, 65%)`;
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.fillStyle;
                ctx.fill();
                ctx.shadowBlur = 0; // reset
            }
        }
    }

    // Update Spectral UI if hovered wave changed
    if (!isCombinedMode && closestWave !== hoveredWaveIndex) {
        hoveredWaveIndex = closestWave;
        const panel = document.getElementById('spectral-panel');
        
        if (hoveredWaveIndex !== -1 && currentIntervalData[hoveredWaveIndex]) {
            panel.classList.add('active');
            const interval = currentIntervalData[hoveredWaveIndex];
            
            // Clean up cents string and calculate freq/wave
            const centsStr = (interval.cents || "0").replace(/[^\d.-]/g, '');
            const centsVal = parseFloat(centsStr) || 0;
            
            const freq = BASE_FREQ * Math.pow(2, centsVal / 1200);
            const waveLength = SPEED_OF_SOUND_MM / freq;

            document.getElementById('spec-step').innerText = interval.step ? interval.step.replace('step_', '') : hoveredWaveIndex;
            document.getElementById('spec-cents').innerText = interval.cents || '0.0¢';
            document.getElementById('spec-freq').innerText = freq.toFixed(2);
            document.getElementById('spec-wave').innerText = Math.round(waveLength);
        } else {
            panel.classList.remove('active');
        }
    }

    if (!isPaused) {
        time += timeSpeed;
    }
    
    requestAnimationFrame(drawWaves);
}

// --- 4. INITIALIZATION ---
const standard12TET = {
    id: "12-ET",
    name: "12 Equal Temperament (12-ET)",
    notes: 12,
    description: "Twelve-tone equal temperament is the most widespread system in music today. Divides the octave into 12 parts, all  are equally spaced on a logarithmic scale, with a ratio equal to the 12th root of 2.",
    intervals: [
        { step: "step_00", cents: "0.00¢", ratio: "1/1" },
        { step: "step_01", cents: "100.00¢", ratio: "~" },
        { step: "step_02", cents: "200.00¢", ratio: "~" },
        { step: "step_03", cents: "300.00¢", ratio: "~" },
        { step: "step_04", cents: "400.00¢", ratio: "~" },
        { step: "step_05", cents: "500.00¢", ratio: "~" },
        { step: "step_06", cents: "600.00¢", ratio: "~" },
        { step: "step_07", cents: "700.00¢", ratio: "~" },
        { step: "step_08", cents: "800.00¢", ratio: "~" },
        { step: "step_09", cents: "900.00¢", ratio: "~" },
        { step: "step_10", cents: "1000.00¢", ratio: "~" },
        { step: "step_11", cents: "1100.00¢", ratio: "~" },
        { step: "step_12", cents: "1200.00¢", ratio: "2/1" }
    ]
};

window.onload = () => {
    // Inject 12-TET at the very beginning of the library
    if (typeof scalesData !== 'undefined') {
        // Prevent duplicates if loaded twice
        if (!scalesData.find(s => s.id === "12-tet")) {
            scalesData.unshift(standard12TET);
        }
    }

    populateNoteFilter();

    renderScaleList();
    resizeCanvas();
    drawWaves(); // Start animation loop
    
    // Auto-load 12-TET specifically
    loadScale("12-ET");
};