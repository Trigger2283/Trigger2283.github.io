const TILE = 2;
const COLS = 17;
const HALF = Math.floor(COLS / 2);
const ROWS_AHEAD = 42;
const ROWS_BEHIND = 18;
const PLAYER_Y = 0.78;
const MOVE_TIME = 0.14;

const COLORS = {
  sky: 0x8ed3c7,
  grass: [0x80c95b, 0x76bf53, 0x8bd164],
  road: 0x4b5260,
  shoulder: 0x626a77,
  stripe: 0xe8dda9,
  water: 0x4aa8cf,
  waterLight: 0x74c6df,
  railBed: 0x776f68,
  rail: 0x45484c,
  sleeper: 0x76513c,
  log: 0x9a6039,
  logEnd: 0xc18451,
  trunk: 0x8e5e3f,
  leaves: [0x397c47, 0x438b4d, 0x529b58],
  cars: [0xef5f57, 0xf1b44c, 0x4e91d8, 0xd66bb1, 0x7458a6, 0xeeeeea],
};

const gameRoot = document.querySelector('#game');
const scoreEl = document.querySelector('#score');
const bestEl = document.querySelector('#best');
const finalScoreEl = document.querySelector('#final-score');
const gameOverReasonEl = document.querySelector('#game-over-reason');
const powerStatusEl = document.querySelector('#power-status');
const toastEl = document.querySelector('#toast');
const skillButton = document.querySelector('#skill-button');
const skillUsesEl = document.querySelector('#skill-uses');
const skillIconEl = document.querySelector('#skill-icon');
const skillNameEl = document.querySelector('#skill-name');
const skillDescriptionEl = document.querySelector('#skill-description');
const skillKeyEl = document.querySelector('#skill-key');
const characterSkillHintEl = document.querySelector('#character-skill-hint');
const mascotEl = document.querySelector('.mascot');
const startTitleEl = document.querySelector('#start-title');
const moveHintEl = document.querySelector('#move-hint');
const itemHintEl = document.querySelector('#item-hint');
const mobileHintEl = document.querySelector('#mobile-hint');
const roundScoreLabelEl = document.querySelector('#round-score-label');
const startButton = document.querySelector('#start-button');
const restartButton = document.querySelector('#restart-button');
const scoreLabelEl = document.querySelector('#score-label');
const bestLabelEl = document.querySelector('#best-label');
const controlGuideTitleEl = document.querySelector('#control-guide-title');
const guideSkillKeyEl = document.querySelector('#guide-skill-key');
const guideTouchKeyEl = document.querySelector('#guide-touch-key');

const TRANSLATIONS = {
  en: {
    startTitle: 'Ready to cross?', chooseCharacter: 'Choose a character', language: 'Language', score: 'SCORE', best: 'BEST', auto: 'AUTO',
    howToPlay: 'HOW TO PLAY', moveHint: 'Move one tile', touchKey: 'SWIPE', touchHint: 'Move on touchscreens',
    itemHint: 'Wings grant flight, crystals grant shields, and green cells recharge skills',
    mobileHint: 'Move on touchscreens', start: 'Start Game', restart: 'Try Again', roundScore: 'ROUND SCORE',
    chicken: 'Chicken', penguin: 'Penguin', cow: 'Cow',
    chickenSkill: 'Wing Hop', chickenDesc: 'Leap over one row', chickenHint: 'Use Wing Hop',
    penguinSkill: 'Wave Rider', penguinDesc: 'Auto-slide after missing a log', penguinHint: 'Triggers automatically after missing a log',
    cowSkill: 'Bull Rush', cowDesc: 'Smash obstacles in the next row', cowHint: 'Charge forward and smash obstacles (not logs)',
    skillAria: '{character} — {skill}, {count} uses remaining',
    chickenToast: 'Wing Hop! {count} uses left', penguinToast: 'Rode across {rows} water row(s)! {count} uses left',
    cowToast: 'Bull Rush! {count} uses left', flightToast: 'Take flight! Cleared 5 rows',
    shieldStatus: '◆ SHIELD × 1', shieldEquipped: 'Shield equipped: blocks one danger',
    shieldBlocked: 'The shield blocked the danger!', shieldRescue: 'The shield pulled you back to shore!',
    rechargeToast: 'Skill recharged! {count} uses available', rechargeFull: 'Skill charges are already full',
    trainDeath: 'Trains do not stop!', carDeath: 'Ouch! You got flattened!', waterDeath: 'Splash! You fell in!',
    gameArea: 'Blocky Crossing game area', touchControls: 'Touch direction controls',
    forward: 'Forward', left: 'Left', backward: 'Back', right: 'Right',
  },
  zh: {
    startTitle: '准备过马路了吗？', chooseCharacter: '选择角色', language: '语言', score: '得分', best: '最高', auto: '自动',
    howToPlay: '操控指南', moveHint: '移动一格', touchKey: '滑动', touchHint: '在触屏设备上移动',
    itemHint: '金色翅膀可飞跃，蓝色晶体可获得护盾，绿色能量块可充能技能',
    mobileHint: '在触屏设备上移动', start: '开始游戏', restart: '再来一次', roundScore: '本轮得分',
    chicken: '小鸡', penguin: '企鹅', cow: '奶牛',
    chickenSkill: '扑翼跳跃', chickenDesc: '跨过一行地形', chickenHint: '使用扑翼跳跃',
    penguinSkill: '踏浪滑行', penguinDesc: '失足时滑过连续水路', penguinHint: '水面失足时自动触发',
    cowSkill: '蛮牛冲撞', cowDesc: '撞飞前方一行障碍', cowHint: '向前冲撞障碍物（木板除外）',
    skillAria: '{character}的{skill}技能，剩余 {count} 次',
    chickenToast: '扑翼跳跃！剩余 {count} 次', penguinToast: '踏浪滑过 {rows} 行水路！剩余 {count} 次',
    cowToast: '蛮牛冲撞！剩余 {count} 次', flightToast: '起飞！越过 5 行地图',
    shieldStatus: '◆ 护盾 × 1', shieldEquipped: '护盾已装备：可抵挡一次危险',
    shieldBlocked: '护盾抵挡了危险！', shieldRescue: '护盾把你救回岸边！',
    rechargeToast: '技能充能完成！当前可使用 {count} 次', rechargeFull: '技能次数已经充满',
    trainDeath: '火车可不会刹车！', carDeath: '哎呀，被撞扁了！', waterDeath: '扑通！掉进水里了！',
    gameArea: 'Blocky Crossing 游戏区域', touchControls: '触屏方向键',
    forward: '向前', left: '向左', backward: '向后', right: '向右',
  },
};

let language = 'en';
function t(key, values = {}) {
  let result = TRANSLATIONS[language][key] || key;
  for (const [name, value] of Object.entries(values)) result = result.replaceAll(`{${name}}`, value);
  return result;
}

const CHARACTERS = {
  chicken: {
    id: 'chicken', nameKey: 'chicken', emoji: '🐔', skillKey: 'chickenSkill', icon: '🪽',
    descriptionKey: 'chickenDesc', hintKey: 'chickenHint', maxSkillUses: 3, automatic: false,
  },
  penguin: {
    id: 'penguin', nameKey: 'penguin', emoji: '🐧', skillKey: 'penguinSkill', icon: '🌊',
    descriptionKey: 'penguinDesc', hintKey: 'penguinHint', maxSkillUses: 3, automatic: true,
  },
  cow: {
    id: 'cow', nameKey: 'cow', emoji: '🦬', skillKey: 'cowSkill', icon: '💥',
    descriptionKey: 'cowDesc', hintKey: 'cowHint', maxSkillUses: 3, automatic: false,
  },
};
let currentCharacter = CHARACTERS.chicken;
const startPanel = document.querySelector('#start-panel');
const gameOverPanel = document.querySelector('#game-over-panel');

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 35, 76);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
gameRoot.appendChild(renderer.domElement);

const camera = new THREE.OrthographicCamera();
camera.rotation.order = 'YXZ';
camera.rotation.y = Math.PI / 4;
camera.rotation.x = -Math.atan(1 / Math.sqrt(2));
scene.add(camera);

scene.add(new THREE.HemisphereLight(0xcdf8ef, 0x53643a, 2.25));
const sun = new THREE.DirectionalLight(0xfff3d1, 3.1);
sun.position.set(-18, 28, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -25;
sun.shadow.camera.right = sun.shadow.camera.top = 25;
sun.shadow.camera.far = 70;
sun.shadow.bias = -0.0004;
scene.add(sun);
scene.add(sun.target);

const world = new THREE.Group();
scene.add(world);
const rows = new Map();
const cars = [];
const logs = [];
const pickups = [];
const safeLandingCols = new Map();
const knockedTrees = [];
const pickupSchedule = new Map();

const PICKUP_SPAWN_RULES = {
  flight: { firstRow: 10, minGap: 23, baseChance: .28, chanceStep: .12 },
  shield: { firstRow: 18, minGap: 31, baseChance: .24, chanceStep: .11 },
  recharge: { firstRow: 27, minGap: 37, baseChance: .18, chanceStep: .1 },
};
let pickupSpawnState = {};

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const mat = (color, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });
const materials = {
  road: mat(COLORS.road), shoulder: mat(COLORS.shoulder), stripe: mat(COLORS.stripe),
  water: mat(COLORS.water, .42), waterLight: mat(COLORS.waterLight, .38),
  railBed: mat(COLORS.railBed), rail: mat(COLORS.rail, .5), sleeper: mat(COLORS.sleeper),
  log: mat(COLORS.log), logEnd: mat(COLORS.logEnd),
  flight: mat(0xffd64f, .45), shield: mat(0x4de2ff, .3), recharge: mat(0x7ee35b, .38),
  timerBack: new THREE.MeshBasicMaterial({ color: 0x27343a }),
  timerGood: new THREE.MeshBasicMaterial({ color: 0x65e568 }),
  timerLow: new THREE.MeshBasicMaterial({ color: 0xff665c }),
  trunk: mat(COLORS.trunk), white: mat(0xf8f5e8), black: mat(0x252a33),
  red: mat(0xe7524a), yellow: mat(0xf4c148),
  cowBrown: mat(0x8b5a3c), cowDark: mat(0x44342d), cowSnout: mat(0xe7a99a), horn: mat(0xf0dfb2),
};
const grassMaterials = COLORS.grass.map(c => mat(c));
const leafMaterials = COLORS.leaves.map(c => mat(c));
const carMaterials = COLORS.cars.map(c => mat(c, .65));

let player;
let playing = false;
let dead = false;
let rowIndex = 0;
let colIndex = 0;
let score = 0;
let best = Number(localStorage.getItem('blocky-crossing-best') || 0);
let lastTime = performance.now();
let cameraTargetZ = 0;
let move = null;
let touchStart = null;
let shieldActive = false;
let shieldGrace = 0;
let toastTimer = 0;
let skillUses = currentCharacter.maxSkillUses;
let lastDeathKey = 'carDeath';
bestEl.textContent = best;

function cube(parent, material, scale, position, cast = false) {
  const mesh = new THREE.Mesh(boxGeometry, material);
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function seeded(index) {
  const x = Math.sin(index * 91.917 + 13.37) * 43758.5453;
  return x - Math.floor(x);
}

function createChicken() {
  const chicken = new THREE.Group();
  cube(chicken, materials.white, [1.08, 1.05, .94], [0, .58, 0], true);
  const leftWing = cube(chicken, materials.white, [.34, .18, .68], [-.67, .76, .04], true);
  const rightWing = cube(chicken, materials.white, [.34, .18, .68], [.67, .76, .04], true);
  leftWing.rotation.z = .14;
  rightWing.rotation.z = -.14;
  cube(chicken, materials.white, [.74, .72, .74], [0, 1.28, -.08], true);
  cube(chicken, materials.yellow, [.36, .22, .35], [0, 1.28, -.5], true);
  cube(chicken, materials.red, [.22, .28, .24], [0, 1.73, -.05], true);
  cube(chicken, materials.black, [.1, .12, .08], [-.23, 1.43, -.43]);
  cube(chicken, materials.black, [.1, .12, .08], [.23, 1.43, -.43]);
  cube(chicken, materials.yellow, [.18, .38, .18], [-.27, .04, 0], true);
  cube(chicken, materials.yellow, [.18, .38, .18], [.27, .04, 0], true);
  const aura = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.25, 1),
    new THREE.MeshStandardMaterial({
      color: 0x65e8ff, emissive: 0x167fa0, emissiveIntensity: .75,
      transparent: true, opacity: .28, flatShading: true, depthWrite: false,
    }),
  );
  aura.position.y = .86;
  aura.scale.set(1, 1.18, 1);
  aura.visible = false;
  chicken.add(aura);
  chicken.userData.shieldAura = aura;
  chicken.userData.leftWing = leftWing;
  chicken.userData.rightWing = rightWing;
  return chicken;
}

function createPenguin() {
  const penguin = new THREE.Group();
  cube(penguin, materials.black, [1.08, 1.18, .92], [0, .62, 0], true);
  cube(penguin, materials.white, [.72, .82, .12], [0, .62, -.49], true);
  cube(penguin, materials.black, [.82, .75, .78], [0, 1.35, -.03], true);
  cube(penguin, materials.white, [.23, .25, .08], [-.2, 1.47, -.44]);
  cube(penguin, materials.white, [.23, .25, .08], [.2, 1.47, -.44]);
  cube(penguin, materials.black, [.09, .1, .05], [-.2, 1.48, -.49]);
  cube(penguin, materials.black, [.09, .1, .05], [.2, 1.48, -.49]);
  cube(penguin, materials.yellow, [.34, .17, .3], [0, 1.27, -.53], true);
  const leftFlipper = cube(penguin, materials.black, [.26, .82, .42], [-.67, .72, .02], true);
  const rightFlipper = cube(penguin, materials.black, [.26, .82, .42], [.67, .72, .02], true);
  leftFlipper.rotation.z = -.24;
  rightFlipper.rotation.z = .24;
  cube(penguin, materials.yellow, [.42, .16, .5], [-.28, .04, -.08], true);
  cube(penguin, materials.yellow, [.42, .16, .5], [.28, .04, -.08], true);

  const aura = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.25, 1),
    new THREE.MeshStandardMaterial({
      color: 0x65e8ff, emissive: 0x167fa0, emissiveIntensity: .75,
      transparent: true, opacity: .28, flatShading: true, depthWrite: false,
    }),
  );
  aura.position.y = .86;
  aura.scale.set(1, 1.18, 1);
  aura.visible = false;
  penguin.add(aura);
  penguin.userData.shieldAura = aura;
  penguin.userData.leftFlipper = leftFlipper;
  penguin.userData.rightFlipper = rightFlipper;
  return penguin;
}

function createCow() {
  const cow = new THREE.Group();
  cube(cow, materials.cowBrown, [1.28, 1.02, 1.08], [0, .67, .05], true);
  cube(cow, materials.white, [.5, .62, .08], [-.28, .75, -.53], true);
  cube(cow, materials.cowDark, [.34, .38, .08], [.34, .6, -.54], true);
  const head = cube(cow, materials.cowBrown, [1.02, .82, .82], [0, 1.38, -.22], true);
  cube(cow, materials.cowSnout, [.72, .36, .34], [0, 1.18, -.7], true);
  cube(cow, materials.black, [.1, .12, .07], [-.23, 1.5, -.65]);
  cube(cow, materials.black, [.1, .12, .07], [.23, 1.5, -.65]);
  cube(cow, materials.horn, [.18, .42, .18], [-.44, 1.84, -.18], true).rotation.z = -.35;
  cube(cow, materials.horn, [.18, .42, .18], [.44, 1.84, -.18], true).rotation.z = .35;
  for (const x of [-.43, .43]) {
    cube(cow, materials.cowDark, [.24, .55, .24], [x, .08, -.22], true);
    cube(cow, materials.cowDark, [.24, .55, .24], [x, .08, .32], true);
  }
  const tail = cube(cow, materials.cowDark, [.15, .72, .15], [0, .72, .65], true);
  tail.rotation.x = -.38;

  const aura = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.35, 1),
    new THREE.MeshStandardMaterial({
      color: 0x65e8ff, emissive: 0x167fa0, emissiveIntensity: .75,
      transparent: true, opacity: .28, flatShading: true, depthWrite: false,
    }),
  );
  aura.position.y = .9;
  aura.scale.set(1.08, 1.18, 1.08);
  aura.visible = false;
  cow.add(aura);
  cow.userData.shieldAura = aura;
  cow.userData.head = head;
  return cow;
}

function createCharacter() {
  if (currentCharacter.id === 'penguin') return createPenguin();
  if (currentCharacter.id === 'cow') return createCow();
  return createChicken();
}

function resetPickupSpawnState() {
  pickupSchedule.clear();
  pickupSpawnState = Object.fromEntries(Object.entries(PICKUP_SPAWN_RULES).map(([type, rule]) => [
    type, { nextEligibleRow: rule.firstRow, missedRows: 0 },
  ]));
}

function pickupTypeForRow(index) {
  if (pickupSchedule.has(index)) return pickupSchedule.get(index);

  const candidates = [];
  for (const [type, rule] of Object.entries(PICKUP_SPAWN_RULES)) {
    const state = pickupSpawnState[type];
    if (!state || index < state.nextEligibleRow) continue;
    const chanceLevel = Math.floor(state.missedRows / 3);
    const chance = Math.min(1, rule.baseChance + chanceLevel * rule.chanceStep);
    const roll = Math.random();
    if (roll < chance) candidates.push({ type, chance, missedRows: state.missedRows });
  }

  candidates.sort((a, b) => b.missedRows - a.missedRows || b.chance - a.chance);
  const selectedType = candidates[0]?.type || null;

  for (const [type, rule] of Object.entries(PICKUP_SPAWN_RULES)) {
    const state = pickupSpawnState[type];
    if (index < state.nextEligibleRow) continue;
    if (type === selectedType) {
      state.nextEligibleRow = index + rule.minGap;
      state.missedRows = 0;
    } else {
      state.missedRows++;
    }
  }

  pickupSchedule.set(index, selectedType);
  return selectedType;
}

function createPickup(row, col, type) {
  const pickup = new THREE.Group();
  if (type === 'flight') {
    cube(pickup, materials.flight, [.52, .52, .52], [0, .72, 0], true).rotation.y = Math.PI / 4;
    cube(pickup, materials.white, [.62, .16, .38], [-.48, .75, 0], true).rotation.z = -.35;
    cube(pickup, materials.white, [.62, .16, .38], [.48, .75, 0], true).rotation.z = .35;
  } else if (type === 'shield') {
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(.58, 0), materials.shield);
    crystal.position.y = .82;
    crystal.castShadow = true;
    pickup.add(crystal);
    cube(pickup, materials.white, [.14, .58, .14], [0, .82, .4], true);
  } else {
    cube(pickup, materials.recharge, [.68, .78, .5], [0, .78, 0], true);
    cube(pickup, materials.white, [.18, .5, .54], [0, .78, -.03], true);
    cube(pickup, materials.white, [.48, .18, .54], [0, .78, -.03], true);
    cube(pickup, materials.black, [.28, .12, .28], [0, 1.23, 0], true);
  }

  const timerBar = new THREE.Group();
  timerBar.position.set(0, 1.72, 0);
  timerBar.visible = false;
  cube(timerBar, materials.timerBack, [1.42, .18, .1], [0, 0, 0], false);
  const timerFill = cube(timerBar, materials.timerGood, [1.26, .1, .08], [0, 0, .1], false);
  pickup.add(timerBar);

  pickup.position.set(col * TILE, .15, -row.index * TILE);
  pickup.userData = {
    type, rowIndex: row.index, col, baseY: pickup.position.y,
    collected: false, timerStarted: false, visibleFor: 7,
    timerBar, timerFill,
  };
  row.group.add(pickup);
  pickups.push(pickup);
}

function createTree(parent, x, z, variant) {
  const tree = new THREE.Group();
  tree.position.set(x, .5, z);
  cube(tree, materials.trunk, [.48, 1.35, .48], [0, .55, 0], true);
  const crown = cube(tree, leafMaterials[variant % leafMaterials.length], [1.28, 1.45, 1.28], [0, 1.52, 0], true);
  crown.rotation.y = variant * .23;
  parent.add(tree);
  return tree;
}

function createCar(row, laneIndex, seed) {
  const vehicle = new THREE.Group();
  const isTruck = seed > .72;
  const length = isTruck ? 3.2 : 2.15;
  const bodyMat = carMaterials[Math.floor(seed * carMaterials.length)];
  cube(vehicle, bodyMat, [length, .62, 1.18], [0, .55, 0], true);
  cube(vehicle, isTruck ? bodyMat : materials.white, [length * .48, .48, .94], [isTruck ? -.35 : .08, 1.02, 0], true);
  cube(vehicle, materials.black, [.38, .42, 1.28], [-length * .31, .34, 0], true);
  cube(vehicle, materials.black, [.38, .42, 1.28], [length * .31, .34, 0], true);
  vehicle.position.set((laneIndex - HALF) * 4.8, .12, -row.index * TILE);
  if (row.direction < 0) vehicle.rotation.y = Math.PI;
  vehicle.userData = { row, length };
  world.add(vehicle);
  cars.push(vehicle);
}

function createTrain(row, seed) {
  const train = new THREE.Group();
  const length = 11.5;
  const bodyMat = carMaterials[Math.floor(seed * carMaterials.length)];
  cube(train, bodyMat, [length, 1.15, 1.38], [0, .72, 0], true);
  cube(train, materials.black, [length * .72, .42, 1.43], [0, 1.15, 0], true);
  for (let x = -4; x <= 4; x += 1.35) {
    cube(train, materials.waterLight, [.72, .32, .06], [x, 1.17, row.direction > 0 ? -.73 : .73]);
  }
  cube(train, materials.yellow, [.12, .28, .45], [length * .51 * row.direction, .72, -.42]);
  cube(train, materials.yellow, [.12, .28, .45], [length * .51 * row.direction, .72, .42]);
  train.position.set((seed - .5) * 32, .05, -row.index * TILE);
  if (row.direction < 0) train.rotation.y = Math.PI;
  train.userData = { row, length, kind: 'train' };
  world.add(train);
  cars.push(train);
}

function createLog(row, laneIndex, seed) {
  const raft = new THREE.Group();
  const length = seed > .5 ? 4.3 : 3.35;
  cube(raft, materials.log, [length, .42, 1.12], [0, .17, 0], true);
  cube(raft, materials.logEnd, [.12, .35, 1.02], [-length * .5, .17, 0], true);
  cube(raft, materials.logEnd, [.12, .35, 1.02], [length * .5, .17, 0], true);
  const rowOffset = (seeded(row.index + 333) - .5) * 3.2;
  raft.position.set((laneIndex - 1.5) * 10.5 + rowOffset, .02, -row.index * TILE);
  raft.userData = { row, length };
  world.add(raft);
  logs.push(raft);
}

function consecutiveRowsOfType(index, type) {
  let count = 0;
  for (let i = index - 1; rows.get(i)?.type === type; i--) count++;
  return count;
}

function chooseRowType(index) {
  if (index < 3) return 'grass';
  if (safeLandingCols.has(index) || pickupTypeForRow(index)) return 'grass';
  const previous = rows.get(index - 1)?.type || 'grass';
  const run = consecutiveRowsOfType(index, previous);
  const roll = seeded(index * 17 + 5);

  // Hazard sections stay short and are separated by safe grassy rows.
  if (previous === 'rail') return 'grass';
  if (previous === 'road') return run >= 2 || roll < .62 ? 'grass' : 'road';
  if (previous === 'water') return run >= 2 || roll < .52 ? 'grass' : 'water';
  if (index >= 8 && index % 10 === 0) return 'rail';

  if (roll < .42) return 'grass';
  if (roll < .69) return 'road';
  if (roll < .86) return 'water';
  return 'rail';
}

function makeRow(index, typeOverride) {
  const seed = seeded(index);
  const type = typeOverride || chooseRowType(index);
  const pickupType = type === 'grass' ? pickupTypeForRow(index) : null;
  const pickupCol = pickupType ? Math.floor(seeded(index + 701) * 7) - 3 : null;
  if (pickupType === 'flight') safeLandingCols.set(index + 5, pickupCol);

  const group = new THREE.Group();
  const z = -index * TILE;
  const obstacles = new Set();
  const row = { index, type, group, obstacles, trees: new Map(), direction: seed > .5 ? 1 : -1, speed: 0 };

  if (type === 'grass') {
    const grassIndex = ((index % grassMaterials.length) + grassMaterials.length) % grassMaterials.length;
    cube(group, grassMaterials[grassIndex], [COLS * TILE + 12, .55, TILE], [0, -.28, z]);
    if (index > 1) {
      for (let col = -HALF; col <= HALF; col++) {
        if (col !== pickupCol && col !== safeLandingCols.get(index) && seeded(index * 31 + col * 7) > .78) {
          obstacles.add(col);
          row.trees.set(col, createTree(group, col * TILE, z, Math.abs(index + col)));
        }
      }
      // Every grassy row always leaves several central routes open.
      obstacles.delete(0);
      obstacles.delete((index % 3) - 1);
    }
    if (pickupType) createPickup(row, pickupCol, pickupType);
  } else if (type === 'road') {
    cube(group, materials.road, [COLS * TILE + 12, .42, TILE], [0, -.21, z]);
    for (let x = -HALF * TILE - 4; x <= HALF * TILE + 4; x += 3.2) {
      cube(group, materials.stripe, [1.35, .025, .1], [x, .015, z + TILE * .45]);
    }
    row.speed = (4.4 + seeded(index + 88) * 4.2) * row.direction;
    const carCount = seeded(index + 20) > .48 ? 3 : 2;
    for (let i = 0; i < carCount; i++) createCar(row, i, seeded(index * 19 + i * 5));
  } else if (type === 'rail') {
    cube(group, materials.railBed, [COLS * TILE + 12, .44, TILE], [0, -.23, z]);
    for (let x = -HALF * TILE - 4; x <= HALF * TILE + 4; x += .72) {
      cube(group, materials.sleeper, [.42, .16, 1.55], [x, .01, z]);
    }
    cube(group, materials.rail, [COLS * TILE + 12, .12, .12], [0, .13, z - .48]);
    cube(group, materials.rail, [COLS * TILE + 12, .12, .12], [0, .13, z + .48]);
    row.speed = (12.5 + seeded(index + 88) * 3.5) * row.direction;
    createTrain(row, seed);
  } else if (type === 'water') {
    cube(group, materials.water, [COLS * TILE + 12, .38, TILE], [0, -.31, z]);
    for (let x = -HALF * TILE - 3; x <= HALF * TILE + 3; x += 4.2) {
      cube(group, materials.waterLight, [1.7, .025, .08], [x + seeded(index) * 1.3, -.08, z + .48]);
    }
    row.speed = (2.6 + seeded(index + 88) * 2.0) * row.direction;
    for (let i = 0; i < 4; i++) createLog(row, i, seeded(index * 23 + i * 11));
  }
  world.add(group);
  rows.set(index, row);
}

function buildWorld() {
  while (world.children.length) world.remove(world.children[0]);
  rows.clear();
  cars.length = 0;
  logs.length = 0;
  pickups.length = 0;
  knockedTrees.length = 0;
  safeLandingCols.clear();
  resetPickupSpawnState();
  for (let i = -ROWS_BEHIND; i <= ROWS_AHEAD; i++) makeRow(i, i < 3 ? 'grass' : undefined);
}

function ensureRows() {
  const furthest = rowIndex + ROWS_AHEAD;
  for (let i = rowIndex + 1; i <= furthest; i++) if (!rows.has(i)) makeRow(i);
  for (const [index, row] of rows) {
    if (index < rowIndex - ROWS_BEHIND) {
      world.remove(row.group);
      rows.delete(index);
      for (let i = cars.length - 1; i >= 0; i--) {
        if (cars[i].userData.row.index === index) {
          world.remove(cars[i]);
          cars.splice(i, 1);
        }
      }
      for (let i = logs.length - 1; i >= 0; i--) {
        if (logs[i].userData.row.index === index) {
          world.remove(logs[i]);
          logs.splice(i, 1);
        }
      }
      for (let i = pickups.length - 1; i >= 0; i--) {
        if (pickups[i].userData.rowIndex === index) pickups.splice(i, 1);
      }
    }
  }
}

function resetGame() {
  buildWorld();
  if (player) scene.remove(player);
  player = createCharacter();
  player.position.set(0, PLAYER_Y, 0);
  scene.add(player);
  rowIndex = colIndex = score = 0;
  cameraTargetZ = 0;
  move = null;
  dead = false;
  shieldActive = false;
  shieldGrace = 0;
  toastTimer = 0;
  skillUses = currentCharacter.maxSkillUses;
  playing = true;
  updateSkillUI();
  toastEl.classList.add('hidden');
  powerStatusEl.classList.add('hidden');
  scoreEl.textContent = '0';
  gameOverPanel.classList.add('hidden');
  startPanel.classList.add('hidden');
}

function requestMove(direction) {
  if (!playing || dead || move) return;
  const delta = {
    forward: [0, 1, 0], backward: [0, -1, Math.PI],
    left: [-1, 0, Math.PI / 2], right: [1, 0, -Math.PI / 2],
  }[direction];
  const nextCol = colIndex + delta[0];
  const nextRow = rowIndex + delta[1];
  if (Math.abs(nextCol) > HALF || nextRow < 0 || rows.get(nextRow)?.obstacles.has(nextCol)) return;
  move = {
    elapsed: 0,
    from: player.position.clone(),
    to: new THREE.Vector3(nextCol * TILE, PLAYER_Y, -nextRow * TILE),
  };
  colIndex = nextCol;
  rowIndex = nextRow;
  player.rotation.y = delta[2];
  if (rowIndex > score) {
    score = rowIndex;
    scoreEl.textContent = score;
    ensureRows();
  }
}

function findLandingCol(targetRow, preferredCol) {
  const target = rows.get(targetRow);
  preferredCol = THREE.MathUtils.clamp(preferredCol, -HALF, HALF);
  if (!target?.obstacles.has(preferredCol)) return preferredCol;
  for (let distance = 1; distance <= HALF * 2; distance++) {
    for (const candidate of [preferredCol - distance, preferredCol + distance]) {
      if (Math.abs(candidate) <= HALF && !target.obstacles.has(candidate)) return candidate;
    }
  }
  return preferredCol;
}

function applyLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  startTitleEl.textContent = t('startTitle');
  moveHintEl.textContent = t('moveHint');
  itemHintEl.textContent = t('itemHint');
  mobileHintEl.textContent = t('mobileHint');
  startButton.textContent = t('start');
  restartButton.textContent = t('restart');
  roundScoreLabelEl.textContent = t('roundScore');
  controlGuideTitleEl.textContent = t('howToPlay');
  guideTouchKeyEl.textContent = t('touchKey');
  scoreLabelEl.textContent = t('score');
  bestLabelEl.textContent = t('best');
  gameRoot.setAttribute('aria-label', t('gameArea'));
  document.querySelector('.character-picker').setAttribute('aria-label', t('chooseCharacter'));
  document.querySelector('.language-picker').setAttribute('aria-label', t('language'));
  document.querySelector('.controls').setAttribute('aria-label', t('touchControls'));
  document.querySelectorAll('[data-character]').forEach(button => {
    const character = CHARACTERS[button.dataset.character];
    button.textContent = `${character.emoji} ${t(character.nameKey)}`;
  });
  document.querySelectorAll('[data-direction]').forEach(button => {
    button.setAttribute('aria-label', t(button.dataset.direction));
  });
  document.querySelectorAll('[data-language]').forEach(button => {
    button.classList.toggle('selected', button.dataset.language === language);
  });
  if (shieldActive) powerStatusEl.textContent = t('shieldStatus');
  gameOverReasonEl.textContent = t(lastDeathKey);
  updateSkillUI();
}

function updateSkillUI() {
  skillUsesEl.textContent = skillUses;
  skillIconEl.textContent = currentCharacter.icon;
  skillNameEl.textContent = t(currentCharacter.skillKey);
  skillDescriptionEl.textContent = t(currentCharacter.descriptionKey);
  skillKeyEl.textContent = currentCharacter.automatic ? t('auto') : 'Q';
  guideSkillKeyEl.textContent = currentCharacter.automatic ? t('auto') : 'Q';
  skillButton.classList.toggle('automatic', currentCharacter.automatic);
  skillButton.disabled = skillUses <= 0 || !playing || currentCharacter.automatic;
  skillButton.setAttribute('aria-label', t('skillAria', {
    character: t(currentCharacter.nameKey), skill: t(currentCharacter.skillKey), count: skillUses,
  }));
  characterSkillHintEl.textContent = t(currentCharacter.hintKey);
}

function useChickenSkill() {
  if (currentCharacter.id !== 'chicken' || !playing || dead || move || skillUses <= 0) return;
  const landingRow = rowIndex + 2;
  const landingCol = findLandingCol(landingRow, colIndex);
  skillUses--;
  updateSkillUI();
  move = {
    elapsed: 0,
    duration: .56,
    height: 2.7,
    kind: 'chicken-skill',
    from: player.position.clone(),
    to: new THREE.Vector3(landingCol * TILE, PLAYER_Y, -landingRow * TILE),
  };
  rowIndex = landingRow;
  colIndex = landingCol;
  score = Math.max(score, rowIndex);
  scoreEl.textContent = score;
  player.rotation.y = 0;
  ensureRows();
  showToast(t('chickenToast', { count: skillUses }));
}

function usePenguinWaterSkill() {
  if (currentCharacter.id !== 'penguin' || !playing || dead || move || skillUses <= 0) return false;
  let landingRow = rowIndex;
  while (rows.get(landingRow)?.type === 'water') landingRow++;
  const crossedRows = landingRow - rowIndex;
  if (crossedRows <= 0) return false;
  const landingCol = findLandingCol(landingRow, colIndex);
  skillUses--;
  updateSkillUI();
  move = {
    elapsed: 0,
    duration: .38 + crossedRows * .18,
    height: .32,
    kind: 'penguin-skill',
    from: player.position.clone(),
    to: new THREE.Vector3(landingCol * TILE, PLAYER_Y, -landingRow * TILE),
  };
  rowIndex = landingRow;
  colIndex = landingCol;
  score = Math.max(score, rowIndex);
  scoreEl.textContent = score;
  player.rotation.y = 0;
  ensureRows();
  showToast(t('penguinToast', { rows: crossedRows, count: skillUses }));
  return true;
}

function knockCowObstacles(targetRowIndex, targetCol) {
  for (const obstacle of cars) {
    if (obstacle.userData.row.index !== targetRowIndex || obstacle.userData.knocked) continue;
    const lateralDistance = Math.abs(obstacle.position.x - player.position.x);
    const forwardDistance = player.position.z - obstacle.position.z;
    const inChargePath = lateralDistance < obstacle.userData.length * .5 + .72 &&
      forwardDistance >= -.35 && forwardDistance <= TILE + .3;
    if (!inChargePath) continue;
    obstacle.userData.knocked = true;
    obstacle.userData.knockAge = 0;
    obstacle.userData.knockY = 7.5;
    obstacle.userData.knockZ = -5.5;
  }
  const targetRow = rows.get(targetRowIndex);
  const tree = targetRow?.trees.get(targetCol);
  const treeForwardDistance = tree ? player.position.z - tree.position.z : Infinity;
  if (tree && treeForwardDistance >= -.35 && treeForwardDistance <= TILE + .3) {
    targetRow.obstacles.delete(targetCol);
    targetRow.trees.delete(targetCol);
    tree.userData.knockAge = 0;
    tree.userData.knockY = 6.5;
    knockedTrees.push({ tree, row: targetRow });
  }
}

function useCowSkill() {
  if (currentCharacter.id !== 'cow' || !playing || dead || move || skillUses <= 0) return;
  const landingRow = rowIndex + 1;
  const landingCol = THREE.MathUtils.clamp(colIndex, -HALF, HALF);
  skillUses--;
  updateSkillUI();
  knockCowObstacles(landingRow, landingCol);
  move = {
    elapsed: 0,
    duration: .34,
    height: .3,
    kind: 'cow-skill',
    targetRow: landingRow,
    targetCol: landingCol,
    from: player.position.clone(),
    to: new THREE.Vector3(landingCol * TILE, PLAYER_Y, -landingRow * TILE),
  };
  rowIndex = landingRow;
  colIndex = landingCol;
  score = Math.max(score, rowIndex);
  scoreEl.textContent = score;
  player.rotation.y = 0;
  ensureRows();
  showToast(t('cowToast', { count: skillUses }));
}

function useActiveSkill() {
  if (currentCharacter.id === 'chicken') useChickenSkill();
  if (currentCharacter.id === 'cow') useCowSkill();
}

function updateMove(dt) {
  if (!move) return;
  move.elapsed += dt;
  const t = Math.min(move.elapsed / (move.duration || MOVE_TIME), 1);
  const smooth = t * t * (3 - 2 * t);
  player.position.lerpVectors(move.from, move.to, smooth);
  player.position.y = PLAYER_Y + Math.sin(t * Math.PI) * (move.height || .72);
  player.rotation.z = Math.sin(t * Math.PI) * .08;
  if (move.kind === 'chicken-skill') {
    const flap = Math.sin(t * Math.PI * 7) * .72;
    player.userData.leftWing.rotation.z = .18 + flap;
    player.userData.rightWing.rotation.z = -.18 - flap;
  }
  if (move.kind === 'penguin-skill') {
    player.rotation.x = -Math.sin(t * Math.PI) * 1.05;
    const paddle = Math.sin(t * Math.PI * 6) * .3;
    player.userData.leftFlipper.rotation.z = -.42 + paddle;
    player.userData.rightFlipper.rotation.z = .42 - paddle;
  }
  if (move.kind === 'cow-skill') {
    knockCowObstacles(move.targetRow, move.targetCol);
    player.rotation.x = Math.sin(t * Math.PI) * .34;
    player.userData.head.rotation.x = -Math.sin(t * Math.PI) * .2;
  }
  if (t >= 1) {
    player.position.copy(move.to);
    player.rotation.z = 0;
    player.rotation.x = 0;
    if (player.userData.leftWing) player.userData.leftWing.rotation.z = .14;
    if (player.userData.rightWing) player.userData.rightWing.rotation.z = -.14;
    if (player.userData.leftFlipper) player.userData.leftFlipper.rotation.z = -.24;
    if (player.userData.rightFlipper) player.userData.rightFlipper.rotation.z = .24;
    if (player.userData.head) player.userData.head.rotation.x = 0;
    move = null;
  }
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  toastTimer = 1.8;
}

function startFlight() {
  const landingRow = rowIndex + 5;
  const landingCol = safeLandingCols.get(landingRow) ?? colIndex;
  ensureRows();
  move = {
    elapsed: 0,
    duration: .92,
    height: 5.2,
    from: player.position.clone(),
    to: new THREE.Vector3(landingCol * TILE, PLAYER_Y, -landingRow * TILE),
  };
  rowIndex = landingRow;
  colIndex = landingCol;
  score = Math.max(score, rowIndex);
  scoreEl.textContent = score;
  player.rotation.y = 0;
  ensureRows();
  showToast(t('flightToast'));
}

function collectPickups() {
  if (move || dead) return;
  for (const pickup of pickups) {
    if (pickup.userData.collected || pickup.userData.rowIndex !== rowIndex) continue;
    if (Math.abs(pickup.position.x - player.position.x) > .72) continue;
    if (pickup.userData.type === 'recharge' && skillUses >= currentCharacter.maxSkillUses) {
      if (!pickup.userData.fullNoticeShown) {
        pickup.userData.fullNoticeShown = true;
        showToast(t('rechargeFull'));
      }
      return;
    }
    pickup.userData.collected = true;
    pickup.visible = false;
    if (pickup.userData.type === 'flight') {
      startFlight();
    } else if (pickup.userData.type === 'shield') {
      shieldActive = true;
      player.userData.shieldAura.visible = true;
      powerStatusEl.textContent = t('shieldStatus');
      powerStatusEl.classList.remove('hidden');
      showToast(t('shieldEquipped'));
    } else {
      skillUses = Math.min(currentCharacter.maxSkillUses, skillUses + 1);
      updateSkillUI();
      showToast(t('rechargeToast', { count: skillUses }));
    }
    return;
  }
}

function consumeShield() {
  if (!shieldActive) return false;
  shieldActive = false;
  shieldGrace = 1.25;
  player.userData.shieldAura.visible = false;
  powerStatusEl.classList.add('hidden');
  showToast(t('shieldBlocked'));
  return true;
}

function rescueFromWater() {
  let rescueRow = rowIndex - 1;
  while (rescueRow > 0 && rows.get(rescueRow)?.type !== 'grass') rescueRow--;
  const desiredCol = THREE.MathUtils.clamp(Math.round(player.position.x / TILE), -HALF, HALF);
  const candidates = [desiredCol];
  for (let offset = 1; offset <= HALF * 2; offset++) {
    candidates.push(desiredCol - offset, desiredCol + offset);
  }
  const rescueCol = candidates.find(col => Math.abs(col) <= HALF && !rows.get(rescueRow)?.obstacles.has(col)) ?? 0;
  move = {
    elapsed: 0,
    duration: .34,
    height: 1.35,
    from: player.position.clone(),
    to: new THREE.Vector3(rescueCol * TILE, PLAYER_Y, -rescueRow * TILE),
  };
  rowIndex = rescueRow;
  colIndex = rescueCol;
  player.rotation.y = Math.PI;
  showToast(t('shieldRescue'));
}

function updatePickups(dt, now) {
  shieldGrace = Math.max(0, shieldGrace - dt);
  toastTimer = Math.max(0, toastTimer - dt);
  if (toastTimer === 0) toastEl.classList.add('hidden');
  for (const pickup of pickups) {
    if (pickup.userData.collected) continue;
    const rowsFromPlayer = pickup.userData.rowIndex - rowIndex;
    if (playing && rowsFromPlayer >= -2 && rowsFromPlayer <= 8) {
      pickup.userData.timerStarted = true;
      pickup.userData.timerBar.visible = true;
    }
    if (playing && pickup.userData.timerStarted) {
      pickup.userData.visibleFor -= dt;
      if (pickup.userData.visibleFor <= 0) {
        pickup.userData.collected = true;
        pickup.visible = false;
        continue;
      }
      const timerRatio = THREE.MathUtils.clamp(pickup.userData.visibleFor / 7, 0, 1);
      pickup.userData.timerFill.scale.x = 1.26 * timerRatio;
      pickup.userData.timerFill.position.x = -.63 * (1 - timerRatio);
      pickup.userData.timerFill.material = timerRatio > .35 ? materials.timerGood : materials.timerLow;
      const fadeScale = THREE.MathUtils.clamp(pickup.userData.visibleFor / 1.2, 0, 1);
      pickup.scale.setScalar(fadeScale);
    }
    pickup.rotation.y += dt * 2.2;
    pickup.userData.timerBar.rotation.y = Math.PI / 4 - pickup.rotation.y;
    pickup.position.y = pickup.userData.baseY + Math.sin(now * .003 + pickup.userData.rowIndex) * .16;
  }
  if (shieldActive && player?.userData.shieldAura) player.userData.shieldAura.rotation.y += dt * 1.4;
}

function updateMovers(dt) {
  const edge = (HALF + 4) * TILE;
  for (let i = cars.length - 1; i >= 0; i--) {
    const car = cars[i];
    if (car.userData.knocked) {
      car.userData.knockAge += dt;
      car.userData.knockY -= 11 * dt;
      car.position.y += car.userData.knockY * dt;
      car.position.z += car.userData.knockZ * dt;
      car.rotation.x += dt * 5.5;
      car.rotation.z += dt * 4;
      if (car.userData.knockAge > 1.35) {
        world.remove(car);
        cars.splice(i, 1);
      }
      continue;
    }
    car.position.x += car.userData.row.speed * dt;
    const margin = car.userData.length;
    if (car.position.x > edge + margin) car.position.x = -edge - margin;
    if (car.position.x < -edge - margin) car.position.x = edge + margin;
  }
  for (let i = knockedTrees.length - 1; i >= 0; i--) {
    const item = knockedTrees[i];
    item.tree.userData.knockAge += dt;
    item.tree.userData.knockY -= 10 * dt;
    item.tree.position.y += item.tree.userData.knockY * dt;
    item.tree.position.z -= 4.5 * dt;
    item.tree.rotation.x += dt * 4.8;
    if (item.tree.userData.knockAge > 1.35) {
      item.row.group.remove(item.tree);
      knockedTrees.splice(i, 1);
    }
  }
  for (const log of logs) {
    const speed = log.userData.row.speed;
    const margin = log.userData.length;
    const supportingPlayer = playing && !move && rowIndex === log.userData.row.index &&
      Math.abs(log.position.x - player.position.x) < margin * .5 - .08;
    const oldX = log.position.x;
    log.position.x += speed * dt;
    let wrapped = false;
    if (log.position.x > edge + margin) { log.position.x = -edge - margin; wrapped = true; }
    if (log.position.x < -edge - margin) { log.position.x = edge + margin; wrapped = true; }
    if (supportingPlayer && !wrapped) {
      player.position.x += log.position.x - oldX;
      colIndex = Math.round(player.position.x / TILE);
    }
  }
}

function endGame(reasonKey) {
  dead = true;
  playing = false;
  updateSkillUI();
  lastDeathKey = reasonKey;
  gameOverReasonEl.textContent = t(reasonKey);
  best = Math.max(best, score);
  localStorage.setItem('blocky-crossing-best', best);
  bestEl.textContent = best;
  finalScoreEl.textContent = score;
  setTimeout(() => gameOverPanel.classList.remove('hidden'), 450);
}

function checkCollision() {
  if (dead || move || shieldGrace > 0) return;
  const row = rows.get(rowIndex);
  if (row?.type === 'road' || row?.type === 'rail') {
    for (const car of cars) {
      if (car.userData.row.index !== rowIndex || car.userData.knocked) continue;
      const hitX = Math.abs(car.position.x - player.position.x) < car.userData.length * .5 + .55;
      if (hitX) {
        if (consumeShield()) return;
        player.scale.set(1.4, .15, 1.4);
        player.position.y = .28;
        endGame(car.userData.kind === 'train' ? 'trainDeath' : 'carDeath');
        return;
      }
    }
  }
  if (row?.type === 'water') {
    const safe = logs.some(log => log.userData.row.index === rowIndex &&
      Math.abs(log.position.x - player.position.x) < log.userData.length * .5 - .08);
    if (!safe || Math.abs(player.position.x) > (HALF + 1) * TILE) {
      if (usePenguinWaterSkill()) return;
      if (consumeShield()) {
        rescueFromWater();
        return;
      }
      player.rotation.x = Math.PI / 2;
      player.position.y = -.02;
      endGame('waterDeath');
    }
  }
}

function updateCamera(dt) {
  cameraTargetZ += (-rowIndex * TILE - cameraTargetZ) * Math.min(1, dt * 3.5);
  camera.position.set(20, 24, cameraTargetZ + 20);
  camera.lookAt(0, 0, cameraTargetZ - 2);
  sun.position.z = cameraTargetZ + 10;
  sun.target.position.set(0, 0, cameraTargetZ - 4);
}

function resize() {
  const aspect = innerWidth / innerHeight;
  const view = innerWidth < 700 ? 19 : 22;
  camera.left = -view * aspect / 2;
  camera.right = view * aspect / 2;
  camera.top = view / 2;
  camera.bottom = -view / 2;
  camera.near = .1;
  camera.far = 120;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
}

function animate(now) {
  const dt = Math.min((now - lastTime) / 1000, .05);
  lastTime = now;
  updateMovers(dt);
  updatePickups(dt, now);
  if (playing) {
    updateMove(dt);
    collectPickups();
    checkCollision();
  }
  updateCamera(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

const keyMap = {
  ArrowUp: 'forward', KeyW: 'forward', ArrowDown: 'backward', KeyS: 'backward',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
};
addEventListener('keydown', event => {
  if (keyMap[event.code]) {
    event.preventDefault();
    requestMove(keyMap[event.code]);
  }
  if (event.code === 'KeyQ') {
    event.preventDefault();
    useActiveSkill();
  }
  if ((event.code === 'Space' || event.code === 'Enter') && !playing) resetGame();
});

document.querySelectorAll('[data-direction]').forEach(button => {
  button.addEventListener('pointerdown', () => requestMove(button.dataset.direction));
});
startButton.addEventListener('click', resetGame);
restartButton.addEventListener('click', resetGame);
skillButton.addEventListener('click', useActiveSkill);
document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => applyLanguage(button.dataset.language));
});
document.querySelectorAll('[data-character]').forEach(button => {
  button.addEventListener('click', () => {
    if (playing) return;
    currentCharacter = CHARACTERS[button.dataset.character];
    skillUses = currentCharacter.maxSkillUses;
    document.querySelectorAll('[data-character]').forEach(choice => {
      choice.classList.toggle('selected', choice === button);
    });
    mascotEl.textContent = currentCharacter.emoji;
    if (player) scene.remove(player);
    player = createCharacter();
    player.position.set(0, PLAYER_Y, 0);
    scene.add(player);
    updateSkillUI();
  });
});

addEventListener('pointerdown', event => { touchStart = [event.clientX, event.clientY]; });
addEventListener('pointerup', event => {
  if (!touchStart || event.target.closest('button')) return;
  const dx = event.clientX - touchStart[0];
  const dy = event.clientY - touchStart[1];
  touchStart = null;
  if (Math.hypot(dx, dy) < 28) return;
  requestMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'backward' : 'forward'));
});

addEventListener('resize', resize);
buildWorld();
player = createCharacter();
player.position.set(0, PLAYER_Y, 0);
scene.add(player);
resize();
updateCamera(1);
requestAnimationFrame(animate);
applyLanguage('en');
window.blockyCrossingReady = true;
