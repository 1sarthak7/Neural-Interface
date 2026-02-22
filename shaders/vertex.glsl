uniform float uTime;
uniform sampler2D uVideoTexture;
uniform float uAudioLow;
uniform float uAudioMid;
uniform float uAudioHigh;
uniform float uAudioLevel;
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;
uniform vec2 uResolution;

attribute float aRandom;
attribute float aSize;

varying float vLuminance;
varying float vDepth;
varying vec3 vColorBase;

// Ashima 3D Simplex Noise
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857; 
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
    vec3 pos = position;

    // 1. Time-based drift & floating motion
    float timeSlow = uTime * 0.15;
    
    // Smooth cinematic noise drift
    float n1 = snoise(vec3(pos.x * 0.2, pos.y * 0.2, timeSlow + aRandom));
    float n2 = snoise(vec3(pos.y * 0.2, pos.z * 0.2, timeSlow + aRandom * 2.0));
    float n3 = snoise(vec3(pos.z * 0.2, pos.x * 0.2, timeSlow + aRandom * 3.0));
    
    vec3 drift = vec3(n1, n2, n3);
    pos += drift * 2.5;

    // 2. Audio-based wave distortion (shockwaves on bass)
    float distOrigin = length(pos);
    float wavePhase = distOrigin * 1.5 - uTime * 5.0;
    // Bass creates massive outward shockwaves
    float shockwave = sin(wavePhase) * exp(-distOrigin * 0.08) * uAudioLow * 4.0;
    
    pos += normalize(pos) * shockwave;

    // High frequency electric jitter
    pos += normalize(drift) * uAudioHigh * 0.5;

    // 3. Mouse Interaction (Magnetic field & ripple)
    // Scale normalized mouse cursor to approximate world boundaries
    vec2 mouseWorld = uMouse * 12.0; 
    float distMouse = length(pos.xy - mouseWorld);
    
    // Attract towards cursor
    float mousePull = exp(-distMouse * 0.8) * 3.0;
    pos.xy += (mouseWorld - pos.xy) * mousePull;
    
    // Ripple effect based on fast mouse movements
    float velocityMag = length(uMouseVelocity);
    pos.z += sin(distMouse * 15.0 - uTime * 12.0) * mousePull * velocityMag * 20.0;

    // 4. Webcam video texture influence
    // Map particle XY into UV bounds [0, 1] roughly. Assume world bounds -15 to 15
    vec2 videoUV = (pos.xy / 30.0) + 0.5;
    videoUV.y = 1.0 - videoUV.y; // Flip Y coordinates for webcam
    
    float luminance = 0.0;
    if (videoUV.x >= 0.0 && videoUV.x <= 1.0 && videoUV.y >= 0.0 && videoUV.y <= 1.0) {
        vec4 vidColor = texture2D(uVideoTexture, videoUV);
        luminance = dot(vidColor.rgb, vec3(0.299, 0.587, 0.114));
    }
    
    // Bright areas attract (Z pulls towards positive), dark push away
    float targetZ = (luminance - 0.4) * 8.0; 
    pos.z = mix(pos.z, targetZ, luminance * 0.6);

    // Apply projection to camera perspective
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // 5. Dynamic Particle Size
    float dynamicSize = aSize * (1.0 + uAudioHigh * 2.5 + luminance * 4.0 + uAudioLevel * 2.0);
    
    // Perspective division scales size by Z depth
    float finalPointSize = dynamicSize * (350.0 / -mvPosition.z);
    gl_PointSize = clamp(finalPointSize, 0.0, 60.0);

    // Filter points that somehow slip behind the camera
    if (mvPosition.z > 0.0) {
        gl_PointSize = 0.0;
    }

    // 6. Pass data varying to Fragment Shader
    vLuminance = luminance;
    vDepth = -mvPosition.z;
    
    // Neural Neon Palette
    vec3 colorBlue = vec3(0.01, 0.3, 1.0);
    vec3 colorPurple = vec3(0.6, 0.0, 1.0);
    vec3 colorCyan = vec3(0.0, 1.0, 0.8);
    
    // Shift color significantly based on audio mapping and webcam light
    vec3 mixColor = mix(colorBlue, colorPurple, uAudioMid + luminance * 0.5);
    mixColor = mix(mixColor, colorCyan, uAudioHigh);
    
    vColorBase = mixColor;
}
