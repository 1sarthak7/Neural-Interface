uniform float uAudioLevel;

varying float vLuminance;
varying float vDepth;
varying vec3 vColorBase;

void main() {
    // Generate circular shape from point quad
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) discard;

    // Create cinematic soft procedural glow
    float glow = smoothstep(0.5, 0.0, dist);
    
    // Super bright dense core for the particle
    float core = smoothstep(0.12, 0.0, dist); 

    // Compute color intensity influenced by Web Audio API & video luminance
    vec3 finalColor = vColorBase * glow;
    finalColor += core * vec3(1.0); // Inner core is pure energy
    
    // Boost glow magnitude when audio is loud
    finalColor *= (1.0 + uAudioLevel * 2.5);
    
    // Highly modulate brightness by webcam pixel luminance
    finalColor *= (0.3 + vLuminance * 2.0);

    // Smooth alpha fade mapping based on Z Depth to avoid hard clipping
    float depthFadeOut = 1.0 - smoothstep(18.0, 25.0, vDepth); // far fade
    float nearClipFade = smoothstep(0.5, 2.0, vDepth); // near camera smooth clip

    float alpha = glow * depthFadeOut * nearClipFade * 0.85;

    gl_FragColor = vec4(finalColor, alpha);
}
