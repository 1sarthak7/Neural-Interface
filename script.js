// Global Variables
let scene, camera, renderer, particleSystem;
let uniforms;
let audioContext, analyser, dataArray;
let videoTexture;
let isReactive = false;

// Audio data smoothing factors
let audioLow = 0, audioMid = 0, audioHigh = 0, audioLevel = 0;

// Mouse tracking
let mouse = new THREE.Vector2(0, 0);
let targetMouse = new THREE.Vector2(0, 0);
let lastMouse = new THREE.Vector2(0, 0);
let mouseVelocity = new THREE.Vector2(0, 0);
let targetMouseVelocity = new THREE.Vector2(0, 0);

// Clock for time-based animation
const clock = new THREE.Clock();

// Boot sequence
initThree();
setupEvents();

async function initContent() {
    const startBtn = document.getElementById('startButton');
    const overlay = document.getElementById('overlay');
    
    startBtn.innerText = "CONNECTING...";
    startBtn.style.pointerEvents = "none";
    startBtn.style.borderColor = "rgba(255,255,255,0.2)";
    startBtn.style.color = "rgba(255,255,255,0.5)";
    
    // Initialize Web Audio and Webcam
    try {
        await initWebcam();
        await Promise.resolve(); // Allow UI to update
    } catch (e) {
        console.warn("Webcam not available:", e);
    }
    
    try {
        await initAudio();
    } catch (e) {
        console.warn("Microphone not available:", e);
    }
    
    startBtn.innerText = "ACCESS GRANTED";
    startBtn.style.borderColor = "#00e5ff";
    startBtn.style.color = "#00e5ff";
    startBtn.style.textShadow = "0 0 10px rgba(0, 229, 255, 0.5)";
    
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.style.display = 'none';
            isReactive = true;
        }, 1500);
    }, 500);
}

function setupEvents() {
    document.getElementById('startButton').addEventListener('click', initContent);

    window.addEventListener('mousemove', (e) => {
        targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', onWindowResize, false);
}

async function initThree() {
    const container = document.getElementById('canvas-container');

    // 1. Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.025);

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
    container.appendChild(renderer.domElement);

    // 4. Load Custom Shaders
    const { vertexShader, fragmentShader } = await loadShaders();

    // 5. Create Particle System
    createParticles(vertexShader, fragmentShader);

    // 6. Start Render Loop
    animate();
}

async function loadShaders() {
    const [vRes, fRes] = await Promise.all([
        fetch('shaders/vertex.glsl'),
        fetch('shaders/fragment.glsl')
    ]);
    const vertexShader = await vRes.text();
    const fragmentShader = await fRes.text();
    return { vertexShader, fragmentShader };
}

function createParticles(vertexShader, fragmentShader) {
    // Blank fallback texture if webcam is denied
    const blankData = new Uint8Array([0, 0, 0, 255]);
    const blankTexture = new THREE.DataTexture(blankData, 1, 1, THREE.RGBAFormat);
    blankTexture.needsUpdate = true;

    uniforms = {
        uTime: { value: 0 },
        uVideoTexture: { value: blankTexture },
        uAudioLow: { value: 0 },
        uAudioMid: { value: 0 },
        uAudioHigh: { value: 0 },
        uAudioLevel: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseVelocity: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    // 100k particles for dense, cinematic feel without crashing FPS
    const particleCount = 100000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Generating a dense spherical/galactic volume
        const radius = Math.random() * 14 + Math.pow(Math.random(), 3) * 10; 
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        // Squash Z to create a disc-like structure initially, adding depth
        const z = (Math.random() - 0.5) * 12.0; 
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        randoms[i] = Math.random();
        sizes[i] = Math.random() * 0.7 + 0.3; // Base scale variety
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending, // Key to neon cinematic bloom
        depthWrite: false, // Fix transparency rendering
        depthTest: true
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

async function initWebcam() {
    const video = document.createElement('video');
    video.width = 512;
    video.height = 512;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 512, height: 512, facingMode: "user" } 
    });
    video.srcObject = stream;
    await video.play();

    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    uniforms.uVideoTexture.value = videoTexture;
}

async function initAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048; // High resolution for precise frequency bands
    analyser.smoothingTimeConstant = 0.85;
    
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    if(audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

function updateAudio() {
    if (!analyser || !isReactive) return;
    
    analyser.getByteFrequencyData(dataArray);
    
    let sumLow = 0, sumMid = 0, sumHigh = 0, sumTotal = 0;
    const len = dataArray.length; // 1024 bins
    
    // Divide frequencies appropriately matching Web Audio defaults 
    const lowEnd = Math.floor(len * 0.05); // Bass
    const midEnd = Math.floor(len * 0.4);  // Mids
    
    for (let i = 0; i < len; i++) {
        const val = dataArray[i] / 255.0;
        sumTotal += val;
        
        if (i < lowEnd) sumLow += val;
        else if (i < midEnd) sumMid += val;
        else sumHigh += val;
    }
    
    // Averages
    const currLow = sumLow / lowEnd;
    const currMid = sumMid / (midEnd - lowEnd);
    const currHigh = sumHigh / (len - midEnd);
    const currLevel = sumTotal / len;
    
    // Smooth interpolation to avoid jitter
    const lerpFactor = 0.15;
    audioLow += (currLow - audioLow) * lerpFactor;
    audioMid += (currMid - audioMid) * lerpFactor;
    audioHigh += (currHigh - audioHigh) * lerpFactor;
    audioLevel += (currLevel - audioLevel) * lerpFactor;
    
    // Inject into shaders
    uniforms.uAudioLow.value = audioLow;
    uniforms.uAudioMid.value = audioMid;
    uniforms.uAudioHigh.value = audioHigh;
    uniforms.uAudioLevel.value = audioLevel;
}

function updateMouse() {
    if (!isReactive) return;

    // Delta velocity
    targetMouseVelocity.x = targetMouse.x - lastMouse.x;
    targetMouseVelocity.y = targetMouse.y - lastMouse.y;
    
    lastMouse.copy(targetMouse);

    // Smooth lerp mouse and velocity vectors
    mouse.lerp(targetMouse, 0.08);
    mouseVelocity.lerp(targetMouseVelocity, 0.1);

    // Gradually kill velocity if holding still
    targetMouseVelocity.multiplyScalar(0.9);

    if (uniforms) {
        uniforms.uMouse.value.copy(mouse);
        uniforms.uMouseVelocity.value.copy(mouseVelocity);
    }
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (uniforms) {
            uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (uniforms) {
        uniforms.uTime.value = elapsedTime;
    }

    updateAudio();
    updateMouse();

    // Cinematic camera motion
    if (camera) {
        // Subtle Parallax targeting the mouse
        const parallaxX = mouse.x * 2.5;
        const parallaxY = mouse.y * 2.5;
        
        camera.position.x += (parallaxX - camera.position.x) * 0.03;
        camera.position.y += (parallaxY - camera.position.y) * 0.03;
        
        // Gentle organic bobbing
        camera.position.z = 15 + Math.sin(elapsedTime * 0.5) * 1.5;
        
        camera.lookAt(scene.position);
    }

    if (particleSystem) {
        // Majestic slow rotation of the universe
        particleSystem.rotation.y = elapsedTime * 0.03;
        particleSystem.rotation.x = Math.sin(elapsedTime * 0.01) * 0.1;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}
