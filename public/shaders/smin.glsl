#version 300 es

precision highp float;

uniform float time;
uniform float deltaTime;
uniform vec2 mouse;
uniform float width;
uniform float height;

out vec4 fragColor;

float squareSDF(vec2 p, vec2 size) {
    vec2 d = abs(p) - size * 0.5f;
    return length(max(d, 0.0f));
}

float circleSDF(vec2 p, float radius) {
    return length(p) - radius;
}

float smin(float d1, float d2, float k) {
    float h = clamp(0.5f + 0.5f * (d2 - d1) / k, 0.0f, 1.0f);
    return mix(d2, d1, h) - k * h * (1.0f - h);
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

void main(void) {
    vec2 uv = (gl_FragCoord.xy / vec2(width, height));

    vec2 p = uv * 2.f - 1.f;
    p.x *= width / height;
    vec2 m = mouse * 2.f - 1.f;
    m.x *= width / height;

    vec3 bgColor = vec3(0.05f, 0.06f, 0.18f);
    vec3 fgColor = vec3(0.93f, 1.0f, 1.0f);

    float squareDist = squareSDF(rotate(p, m.y * 2.f), vec2(0.5f, 0.5f));

    float circleDist = circleSDF(p + m, 0.3f);

    float result = smin(squareDist, circleDist, 0.4f);

    result = smoothstep((abs(dFdx(p)) + abs(dFdy(p))).y, 0.0f, result);

    vec3 finalColor = mix(bgColor, fgColor, result);

    fragColor = vec4(finalColor, 1.0f);
}
