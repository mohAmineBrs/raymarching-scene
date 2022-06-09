uniform float uTime;
uniform vec4 uResolution;
uniform sampler2D uMatcap;
uniform vec2 uMouse;
uniform float uMouseSphere;
uniform float uFirstProgress;
uniform float uSecondProgress;
uniform float uThirdProgress;
uniform float uCamZPos;

varying vec2 vUv;

float PI = 3.15159265;


// Rotation Function
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

// Matcap Function
vec2 getMatcap(vec3 eye, vec3 normal) {
  vec3 reflected = reflect(eye, normal);
  float m = 2.8284271247461903 * sqrt( reflected.z+1.0 );
  return reflected.xy / m + 0.5;
}

// Smin Inigo Quilez Function
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}
// sphere sdf 3D Inigo Quilez Function
float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}
// Rounded Cylinder sdf 3D Inigo Quilez Function
float sdRoundedCylinder( vec3 p, float ra, float rb, float h )
{
  vec2 d = vec2( length(p.xz)-2.0*ra+rb, abs(p.y) - h );
  return min(max(d.x,d.y),0.0) + length(max(d,0.0)) - rb;
}

// Round Box sdf 3D Inigo Quilez Function
float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}
// Torus sdf 3D Inigo Quilez Function
float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

// Link sdf 3D Inigo Quilez Function
float sdLink( vec3 p, float le, float r1, float r2 )
{
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}
// SDF 3D Inigo Quilez Function
float sdf(vec3 p) {
    vec3 p1 = rotate(p, vec3(1.), uTime/2.);
    // float box = smin(sdBox(p1, vec3(0.4)), sdSphere(p, 0.4), 0.4);
    float box = sdRoundBox(p1, vec3(0.4), 0.12);
    float torus = sdTorus(p1, vec2(0.6, 0.2));
    float cylinder = sdRoundedCylinder(p1, 0.2, 0.1, 0.55);
    float link = sdLink(p1, 0.4, 0.29, 0.14);

    float preFinalBox = mix(torus, box, uFirstProgress);
    float finalBox = mix(preFinalBox, cylinder, uSecondProgress);
    float afterFinalBox = mix(finalBox, link, uThirdProgress);

    float mouseSphere = sdSphere(p - vec3(uMouse * uResolution.wz * 2., 0.), uMouseSphere);

    return smin(afterFinalBox, mouseSphere, 0.4);
}

vec3 calcNormal( in vec3 p ) // for function f(p)
{
    const float eps = 0.0001; // or some other value
    const vec2 h = vec2(eps,0);
    return normalize( vec3(sdf(p+h.xyy) - sdf(p-h.xyy),
                           sdf(p+h.yxy) - sdf(p-h.yxy),
                           sdf(p+h.yyx) - sdf(p-h.yyx) ) );
}

void main() {
    float dist = length(vUv - vec2(.5));
    vec3 bg = mix(vec3(0.25, 0.0, 0.0), vec3(.05), dist);
    bg = vec3(0.035, 0.0035, 0.21);
    vec2 newUv = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);
    vec3 camPos = vec3(0., 0., uCamZPos);
    vec3 ray = normalize(vec3((vUv - vec2(0.5)) * uResolution.wz, -1));

    vec3 rayPos = camPos;
    float t = 0.;
    float tMax = 5.;
    for (int i=0 ; i<256 ; ++i) {
        vec3 pos = camPos + t * ray;
        float h = sdf(pos);
        if (h<0.0001 || t>tMax) break;
        t+=h;
    }

    vec3 color = bg;
    if (t<tMax) {
        vec3 pos = camPos + t * ray;
        color = vec3(1.);
        vec3 normal = calcNormal(pos);
        color = normal;
        float diff = dot(vec3(1.), normal);
        vec2 matcapUv = getMatcap(ray, normal);
        color = vec3(diff);
        color = texture2D(uMatcap, matcapUv).rgb;

        // float fresnel = pow(.1 + dot(ray, normal), .3);
        // color = mix(color, bg, fresnel);
        // color = mix(bg, color, fresnel);

    }
    gl_FragColor = vec4(color, 1.);

}

