<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050510,50:0a0a2a,100:0f0f3f&height=260&section=header&text=NEURAL%20INTERFACE&fontSize=58&fontAlignY=40&animation=fadeIn&fontColor=00e5ff&desc=Advanced%20Audio%20%7C%20Video%20%7C%20Cursor%20Reactive%20Particle%20Engine&descAlignY=65&descSize=18" width="100%" />

# NEURAL INTERFACE

### A Cinematic GPU Particle Engine Driven by Audio, Vision, and Interaction

Built with pure Three.js and custom GLSL shaders. Designed as a production‑grade interactive rendering system — not a demo.

</div>

---

## Overview

Neural Interface is a high‑performance WebGL particle engine rendering 100,000 GPU‑driven particles in real time. The system fuses microphone spectrum analysis, live webcam luminance mapping, and cursor‑based spatial distortion into a unified cinematic visual field.

The result is a responsive digital atmosphere that behaves like a living neural cosmos.

This project avoids heavy frameworks and bundlers. Every effect is architected through:

* BufferGeometry
* ShaderMaterial
* Parallel GPU computations
* Web Audio FFT analysis
* Real‑time VideoTexture sampling

---

## Core Rendering Architecture

### GPU Particle System

* 100,000 particles stored in Float32Array buffers
* Position, velocity, depth and random seed attributes
* Vertex shader–driven motion logic
* Zero CPU‑side per‑particle physics loops

### Custom Shader Pipeline

**Vertex Shader Responsibilities**

* Time‑based spatial drift using 3D simplex noise
* Audio amplitude displacement waves
* Cursor‑based magnetic distortion fields
* Webcam luminance gravitational influence
* Depth‑based fade and parallax computation

**Fragment Shader Responsibilities**

* Procedural radial glow
* Additive blending
* Frequency‑based color interpolation
* Dynamic glow amplification
* Edge softness and resolution independence

---

## Real‑Time Audio Processing

Microphone input is captured using getUserMedia and processed via the Web Audio API.

FFT Size: 2048

Extracted Bands:

* Low Frequency (Bass)
* Mid Frequency
* High Frequency
* Overall Amplitude

Audio Mapping:

* Bass → Radial shockwave expansion
* Mid → Color transition between deep violet and neon cyan
* High → Micro‑vibrational turbulence and glow intensification
* Global amplitude → Universal brightness scaling

All spectrum data is passed to shaders as uniforms for GPU execution.

---

## Vision‑Based Particle Gravitation

The webcam stream is converted into a Three.js VideoTexture.

In shader:

* Luminance is sampled per particle
* Bright zones attract particles
* Dark zones repel particles
* Global brightness modulates particle density perception

This produces a live gravitational feedback system between the physical environment and the digital field.

---

## Cursor Interaction Engine

The cursor operates as a dynamic spatial distortion source.

Uniform Inputs:

* Normalized pointer position
* Velocity magnitude

Effects:

* Magnetic bending of nearby particles
* Ripple propagation across depth layers
* Velocity‑amplified distortion bursts

The interaction is fluid and physically suggestive rather than abrupt.

---

## Advanced Visual Effects

Beyond base particle rendering, the system includes:

* Additive blending for volumetric glow
* Procedural 3D simplex noise (Ashima implementation)
* Depth fog blending
* Chromatic micro‑shift for spectral richness
* Subtle camera parallax drift
* High‑DPI rendering support
* Smooth resize responsiveness

Optional extensions (architecturally supported):

* UnrealBloomPass
* Chromatic aberration pass
* Film grain overlay
* Motion blur feedback buffer
* Post‑processing color grading LUT

---

## Technology Stack

* HTML5
* CSS3
* JavaScript (ES6+)
* Three.js
* GLSL
* Web Audio API
* WebRTC

No bundlers. No frameworks. No abstraction layers beyond Three.js.

---

## Project Structure

```
index.html
style.css
script.js
shaders/
  vertex.glsl
  fragment.glsl
```

The shaders are loaded dynamically, requiring a local development server due to browser CORS policies.

---

## Running the Project

Because shader files are fetched externally, the project cannot run via file:// protocol.

Use one of the following:

### Python

```
python3 -m http.server 8000
```

### Node

```
npx serve .
```

### PHP

```
php -S localhost:8000
```

Then open:

[http://localhost:8000](http://localhost:8000)

Grant microphone and camera permissions to activate the full system.

---

## Experience Flow

1. Initial dark atmospheric field
2. Particle emergence with ambient drift
3. Permission grant activates audio‑visual pipeline
4. Sound drives spatial shockwaves
5. Webcam light reshapes particle gravity
6. Cursor distorts the neural field in real time

The environment transitions from passive cosmos to reactive neural interface.

---

<div align="center">

### Designed and Engineered by

## Sarthak Bhopale

[GitHub Profile](https://github.com/1sarthak7)

</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050510,50:0a0a2a,100:0f0f3f&height=160&section=footer&animation=fadeIn" width="100%" />
