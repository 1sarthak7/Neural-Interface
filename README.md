<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050510,50:0a0a2a,100:0f0f3f&height=250&section=header&text=NEURAL%20INTERFACE&fontSize=60&fontAlignY=40&animation=fadeIn&fontColor=00e5ff&desc=Cinematic%203D%20Particle%20Universe&descAlignY=65&descSize=20" width="100%" />

# 🌌 Neural Interface: WebGL Particle Universe

A high-performance, cinematic WebGL experience that renders a universe of **100,000 GPU-computed particles** reacting in real-time to your audio frequencies, webcam video input, and cursor movements. 

This project is built from the ground up without heavy frameworks, utilizing pure **Three.js**, **Custom GLSL Shaders**, and browser APIs to create a premium, Apple-keynote x Interstellar aesthetic.

---

## 🚀 Features

- **🎤 Advanced Audio Reactivity**: Uses `AudioContext` and an `AnalyserNode` to perform FFT analysis. Particles dynamically react to separate frequency bands:
  - **Bass**: Triggers massive outward shockwaves.
  - **Mids**: Shifts galaxy colors smoothly between deep purple and electric neon blue.
  - **Highs**: Introduces electric jitter and boosts glow intensity.
- **🎥 Vision-Based Gravitation**: Captures webcam feeds via `getUserMedia()` into a `VideoTexture`. Bright areas in your physical environment act as a gravitational pull, attracting particles and modifying their emission. 
- **🖱 Magnetic Cursor Physics**: The normalized cursor position acts as an interactive magnetic field, bending the surrounding space and sending depth ripples across the particle clusters.
- **⚡ BufferGeometry & Shaders**: Engineered for 60fps performance using efficient `Float32Array` buffers and heavily parallelized calculations within custom Vertex and Fragment shaders. No basic `PointsMaterial` here.
- **💎 Cinematic Rendering**: Employs deep additive blending, procedural noise (Ashima 3D Simplex), smooth depth fading, and resolution-independent procedural point glowing.

## 🛠 Tech Stack

- **HTML5 & Vanilla CSS3**
- **JavaScript (ES6+)**
- **Three.js** (WebGL Abstraction Layer)
- **GLSL** (Custom Vertex & Fragment Shaders)
- **Web Audio API**
- **WebRTC** (Webcam API)

## 🏃‍♂️ How to Run

Because this project dynamically fetches separated shader files (`shaders/vertex.glsl`, `shaders/fragment.glsl`) without a bundler, strict browser CORS policies prevent running it directly via the `file:///` protocol. **You must serve it via a local web server.**

1. Clone or download this repository.
2. Open your terminal and navigate to the project directory.
3. Start a local server. You can use any of the following commands:

**Using Python:**
```bash
python3 -m http.server 8000
```
**Using Node.js (npx):**
```bash
npx serve .
```
**Using PHP:**
```bash
php -S localhost:8000
```

4. Open your browser and navigate to `http://localhost:8000`.
5. Click **"Initialize Systems"**, grant Microphone and Camera permissions, and enjoy the experience.

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:050510,50:0a0a2a,100:0f0f3f&height=150&section=footer&text=&animation=fadeIn&fontColor=ffffff&desc=&descAlignY=50" width="100%" />
  <p><strong>Designed and Developed by <a href="https://github.com/1sarthak7" target="_blank">Sarthak Bhopale</a></strong></p>
</div>
