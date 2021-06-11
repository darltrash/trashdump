let assets = {
  player: [],
  trash: [],

  sfx: {},
};
let player;
let warming = 0;
let itemPool = [];

function rrandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class TrashBin {
  constructor(kind, x, y) {
    this.kind = kind;
    this.itemCount = 0;
    this.x = x;
    this.y = y;

    this.color = "white";
    switch (kind) {
      case 0: // can
        this.color = "#FF3663";
        break;
      case 1: // chips
        this.color = "#36FF7A";
        break;
      case 2: // paper
        this.color = "#D9BEC4";
        break;
      case 3: // banana peel
        this.color = "#FFA936";
        break;
      case 4: // apple
        this.color = "#FF3663";
        break;
    }
  }

  draw(delta) {
    if (
      (abs(this.x - player.x) < 30) &
      (abs(this.y - player.y) < 8) &
      (player.item == this.kind)
    ) {
      this.itemCount += 1;
      wasteAmount -= 1;
      player.item = null;
    }

    fill("rgba(0, 0, 0, 0.3)");
    stroke("rgba(0, 0, 0, 0)");
    ellipse(this.x - 6, this.y - 3, 40, 10);

    push();
    translate(
      floor(this.x + assets.trashbin.width * 0.5),
      floor(this.y - assets.trashbin.height)
    );
    tint(this.color);
    image(assets.trashbin, -assets.trashbin.width, 0);
    tint("white");
    if (this.kind !== null) {
      image(assets.trash[this.kind], -assets.trashbin.width + 10, 30);
    }
    pop();
  }
}

class Waste {
  constructor() {
    this.x = rrandom(70, width - 20);
    this.y = rrandom(20, height - 40);

    this.k = rrandom(0, 5);

    this.t = 0;
  }

  draw(delta) {
    if (
      (abs(this.x - player.x) < 30) &
      (abs(this.y - player.y) < 8) &
      (player.item == null)
    ) {
      this.delete = true;
      player.item = this.k;
    }

    let spr = assets.trash[this.k];
    this.t += delta / 300;
    fill("rgba(0, 0, 0, 0.3)");
    stroke("rgba(0, 0, 0, 0)");
    ellipse(this.x, this.y, 20 + sin(this.t) * 10, 6 + sin(this.t) * 2);
    image(
      spr,
      this.x - spr.width / 2,
      this.y - 7 - spr.height + sin(this.t) * 5
    );
  }
}

class Player {
  constructor() {
    this.x = 30;
    this.y = 30;

    this.v = 0.2;
    this.r = 1;
    this.rr = 1;
    this.c = 0;
    this.a = 0;

    this.item = null;

    this.wx = 0;
    this.wy = 0;
  }

  draw(delta) {
    let moving = false;
    if (abs(this.x - this.wx) > 10 || abs(this.y - this.wy) > 10) {
      moving = true;

      let angle = atan2(this.y - this.wy, this.x - this.wx);

      let vx = Math.cos(angle);
      let vy = Math.sin(angle);

      this.x -= vx * delta * this.v;
      this.y -= vy * delta * this.v;

      this.r = -Math.sign(vx);
    }

    this.rr = lerp(this.rr, this.r, delta / 100);

    this.wx = mouseX;
    this.wy = mouseY;

    if (moving) {
      this.a += delta / 200;
    } else {
      this.a = 0;
    }

    this.c = floor(this.a % 2);

    let spr = assets.player[this.c];
    //circle(this.x, this.y, 10)

    fill("rgba(0, 0, 0, 0.3)");
    stroke("rgba(0, 0, 0, 0)");
    ellipse(this.x, this.y - 2, 30, 8);
    //
    push();
    translate(
      floor(this.x + spr.width * this.rr * 0.5),
      floor(this.y - spr.height)
    );
    scale(this.rr, 1);
    image(spr, -spr.width, 0);
    if (this.item !== null) {
      let ispr = assets.trash[this.item];
      image(ispr, -(spr.width - 40), 20);
      image(assets.player[2], -(spr.width - 30), 30);
    }
    pop();
  }
}

let titleFont;
function preload() {
  //soundFormats("wav", "mp3");

  var i;
  for (i = 0; i < 3; i++) {
    assets.player.push(loadImage("assets/player_" + i + ".png"));
  }

  for (i = 0; i < 5; i++) {
    assets.trash.push(loadImage("assets/trash_" + i + ".png"));
  }

  titleFont = loadFont("assets/Staatliches-Regular.ttf");
  //assets.sfx.footsteps = loadSound("assets/footsteps.ogg");

  assets.trashbin = loadImage("assets/trashbin.png");
}

let counter = 0;
let tick = 0;
function setup() {
  createCanvas(400, 400);

  player = new Player();
  itemPool.push(player);

  var i;
  for (i = 1; i < 6; i++) {
    itemPool.push(new TrashBin(i - 1, 30, (width / 5) * (i - 0.3)));
  }
}

let rate = 1;
let wasteAmount = 0;
function draw() {
  fill("#36FF7A");
  blendMode(BLEND);
  rect(0, 0, width, height);
  counter += deltaTime * (rate / 100);

  if (counter > tick) {
    tick = rrandom(10, 50);
    counter = 0;

    itemPool.push(new Waste());
    wasteAmount += 1;
  }

  warming = lerp(warming, wasteAmount * 10, deltaTime / 200);
  itemPool.sort((a, b) => {
    return a.y - b.y;
  });

  let shouldRegenerate = 0;
  itemPool.forEach((item) => {
    if (item.delete) {
      shouldRegenerate += 1;
      return;
    }
    item.draw(deltaTime);
  });

  if (shouldRegenerate > 10) {
    itemPool = itemPool.filter((item) => !item.delete);
  }

  blendMode(MULTIPLY);
  fill(255, 0, 0, warming);
  rect(0, 0, width, height);
}
