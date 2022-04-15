#pragma glslify:snoise3=require(glsl-noise/simplex/3d)

uniform float uTime;

uniform float uFrequency;
uniform float uAmplitude;
uniform float uDensity;
uniform float uStrength;

varying float vDistortion;

mat3 rotation3dY(float angle){
  float s=sin(angle);
  float c=cos(angle);
  
  return mat3(
    c,0.,-s,
    0.,1.,0.,
    s,0.,c
  );
}

vec3 rotateY(vec3 v,float angle){
  return rotation3dY(angle)*v;
}

void main(){
  vDistortion=snoise3(normal*uDensity) * uStrength;
  vec3 pos=position+(normal*vDistortion);
  float angle=sin(uv.y*uFrequency)*uAmplitude + uTime/2.;
  pos=rotateY(pos,angle);
  
  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
}