import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(8, 6, 12);
camera.lookAt(0, 3, 0);

const deg = THREE.MathUtils.degToRad;
const clamp = THREE.MathUtils.clamp;

const armMaterial = new THREE.MeshStandardMaterial({color: 0x3399ff});
const jointMaterial = new THREE.MeshStandardMaterial({color: 0x555555});
const handMaterial = new THREE.MeshStandardMaterial({color: 0xffaa55});


// ===== BAZA DHE KRAHU =====
const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32), jointMaterial);
scene.add(base);

const shoulder = new THREE.Group();
shoulder.position.y = 0.5;
base.add(shoulder);
shoulder.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), jointMaterial));

const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3, 0.7), armMaterial);
upperArm.position.y = 1.5;
shoulder.add(upperArm);

const elbow = new THREE.Group();
elbow.position.y = 3;
shoulder.add(elbow);
elbow.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), jointMaterial));

const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.5, 0.6), armMaterial);
forearm.position.y = 1.25;
elbow.add(forearm);

const wrist = new THREE.Group();
wrist.position.y = 2.5;
elbow.add(wrist);
wrist.add(new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), jointMaterial));

const palm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 0.4), handMaterial);
palm.position.y = 0.9;
wrist.add(palm);


// ===== GISHTAT =====
// çdo gisht ka materialin e vet (që ta theksojmë kur zgjidhet)
const fingers = [];   // indeksi 0 = gishti i madh, 1-4 = tregues, i mesëm, unazor, i vogël

function makeFingerMaterial() {
    return new THREE.MeshStandardMaterial({color: 0xffcc88});
}

// --- gishti i madh ---
{
    const mat = makeFingerMaterial();

    const baseJoint = new THREE.Group();
    baseJoint.position.set(-0.85, -0.3, 0);
    palm.add(baseJoint);

    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.35), mat);
    lower.position.y = 0.4;
    baseJoint.add(lower);

    const tipJoint = new THREE.Group();
    tipJoint.position.y = 0.8;
    baseJoint.add(tipJoint);

    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), mat);
    tip.position.y = 0.3;
    tipJoint.add(tip);

    fingers.push({
        name: 'Gishti i madh',
        mat,
        curl: 0,
        apply(c) {
            baseJoint.rotation.z = deg(50 - c * 35);
            baseJoint.rotation.x = deg(c * 40);
            tipJoint.rotation.z  = deg(15);
            tipJoint.rotation.x  = deg(c * 60);
        }
    });
}

// --- 4 gishtat e tjerë ---
const fingerNames   = ['Treguesi', 'I mesmi', 'Unazori', 'I vogli'];
const fingerLengths = [1.0, 1.25, 1.05, 0.75];
const fingerWidths  = [0.3, 0.32, 0.3, 0.26];
const fingerXs      = [-0.63, -0.21, 0.21, 0.63];

for (let i = 0; i < 4; i++) {
    const len = fingerLengths[i];
    const w = fingerWidths[i];
    const lowerLen = len * 0.55;
    const upperLen = len * 0.45;
    const mat = makeFingerMaterial();

    const baseJoint = new THREE.Group();
    baseJoint.position.set(fingerXs[i], 0.75, 0);
    palm.add(baseJoint);

    const lower = new THREE.Mesh(new THREE.BoxGeometry(w, lowerLen, w), mat);
    lower.position.y = lowerLen / 2;
    baseJoint.add(lower);

    const tipJoint = new THREE.Group();
    tipJoint.position.y = lowerLen;
    baseJoint.add(tipJoint);

    const upper = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, upperLen, w * 0.92), mat);
    upper.position.y = upperLen / 2;
    tipJoint.add(upper);

    fingers.push({
        name: fingerNames[i],
        mat,
        curl: 0,
        apply(c) {
            baseJoint.rotation.x = c * deg(80);   // kufiri: max 80°
            tipJoint.rotation.x  = c * deg(90);   // kufiri: max 90°
        }
    });
}

fingers.forEach(f => f.apply(0));


// ===== DRITAT, TOKA =====
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.25;
scene.add(ground);

scene.add(new THREE.GridHelper(20, 20));


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3, 0);
controls.enableDamping = true;
controls.update();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// ===== KUFIJTË E KRAHUT (në gradë) =====
const limits = {
    shoulder: { min: -90, max: 90 },
    elbow:    { min: 0,   max: 140 },
    wrist:    { min: -70, max: 70 }
};

shoulder.rotation.z = deg(-20);
elbow.rotation.z = deg(40);
wrist.rotation.z = deg(-20);

function rotateJoint(joint, limit, deltaRad) {
    joint.rotation.z = clamp(joint.rotation.z + deltaRad, deg(limit.min), deg(limit.max));
}


// ===== HUD (udhëzimet) =====
const hud = document.createElement('div');
hud.style.cssText = 'position:fixed;top:10px;left:10px;padding:10px 14px;background:rgba(0,0,0,0.65);' +
    'color:#fff;font:14px/1.5 monospace;border-radius:8px;pointer-events:none;white-space:pre';
document.body.appendChild(hud);

function updateHud() {
    const f = fingers[selected];
    hud.textContent =
        'Gishti i zgjedhur: ' + (selected + 1) + ' - ' + f.name + '  (' + Math.round(f.curl * 100) + '%)\n' +
        '1-5 zgjedh gishtin | R mbyll | F hap | Space grusht/hapur\n' +
        'Q/A shpatulla | W/S bërryli | E/D kyçi i dorës';
}


// ===== KONTROLLET =====
let selected = 1;   // fillimisht treguesi
const keys = {};

function highlightSelected() {
    fingers.forEach((f, i) => {
        f.mat.emissive.setHex(i === selected ? 0x663300 : 0x000000);
    });
}
highlightSelected();

window.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    keys[key] = true;

    if (key >= '1' && key <= '5') {
        selected = parseInt(key) - 1;
        highlightSelected();
    }

    if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        const allClosed = fingers.every(f => f.curl > 0.5);
        fingers.forEach(f => f.target = allClosed ? 0 : 1);
    }
});

window.addEventListener('keyup', function(event) {
    keys[event.key.toLowerCase()] = false;
});

fingers.forEach(f => f.target = null);


// ===== ANIMIMI =====
const armSpeed = deg(1.5);     // gradë për frame
const fingerSpeed = 0.02;      // pjesa e përkuljes për frame

function animate() {
    requestAnimationFrame(animate);

    // krahu (me kufij)
    if (keys['q']) rotateJoint(shoulder, limits.shoulder,  armSpeed);
    if (keys['a']) rotateJoint(shoulder, limits.shoulder, -armSpeed);
    if (keys['w']) rotateJoint(elbow,    limits.elbow,     armSpeed);
    if (keys['s']) rotateJoint(elbow,    limits.elbow,    -armSpeed);
    if (keys['e']) rotateJoint(wrist,    limits.wrist,     armSpeed);
    if (keys['d']) rotateJoint(wrist,    limits.wrist,    -armSpeed);

    // gishti i zgjedhur (kufiri 0..1)
    const sel = fingers[selected];
    if (keys['r']) { sel.curl = clamp(sel.curl + fingerSpeed, 0, 1); sel.target = null; }
    if (keys['f']) { sel.curl = clamp(sel.curl - fingerSpeed, 0, 1); sel.target = null; }

    // Space: të gjithë gishtat lëvizin butë drejt objektivit
    fingers.forEach(f => {
        if (f.target !== null) {
            f.curl += (f.target - f.curl) * 0.12;
            if (Math.abs(f.target - f.curl) < 0.005) { f.curl = f.target; f.target = null; }
        }
        f.apply(f.curl);
    });

    updateHud();
    controls.update();
    renderer.render(scene, camera);
}

animate();