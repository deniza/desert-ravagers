var cursors;
var player;
var spacekey;
var ground;
var truckSprite;
var truckBody;
var startLine;
var finishLine;
var instructionsGroup;
var collidedFixtureCount = 0;
var collidedDollFixtureCount = 0;
var beacon;
var driveJoints = [];
var ramps = [];
var onair = false;
var prevonair = false;
var arrowSymbol;
var emitter;
var emitter2;

var currentGameRecord = [];
var savedGameRecord = [];
var savedGameRecordIndex = 0;
var gameStartTime;
var bestTime = -1;

var headerLabel;
var announcementLabel;
var bestRunLabel;
var bonusLabel;
var timeLabel;
var countDownTimer;
var currentCountDownPhase;
var trickRotLeft = false;
var trickRotRight = false;
var rotationTrickStartAngle = -1;
var rotationTrickDeltaAngle = 0;
var levelShakeCounter = 0;
var beaconTrail = [];

var gameState;
var GameStateWarmUp = 0;
var GameStateCountdown = 1;
var GameStateRun = 2;
var GameStateFinished = 3;

var DefaultThrustPower = 800;
var BoostedThrustPower = 1200;
var currentThrustPower = DefaultThrustPower;

var worldBounds = {x:0, y:0, width: 20*800, height: 600};

MyGame = function(game) {
    this.game = game;
};

MyGame.prototype.preload = function() {
}

function createSpriteRect(x,y,w,h,color) {

    var bodySprite = game.add.sprite(x,y);
    var g = game.add.graphics(0,0);
    g.beginFill(color);
    g.drawRect(-w*0.5, -h*0.5, w, h);
    g.endFill();
    bodySprite.addChild(g);
    
    game.physics.box2d.enable(bodySprite);
    bodySprite.body.setRectangle(w, h, 0, 0);

    return bodySprite;

}

function createBeacon() {

    var width = 50;
    var height = 5;
    var PTM = 1;

    var beaconSprite = createFilledSprite(0,0,width,height,0xffffff);    

    var dollBodySprite = game.add.sprite(0,-22,'nomad',3);
    dollBodySprite.anchor.setTo(0.5,0.5);
    beaconSprite.addChild(dollBodySprite);

    var rightArm = createFilledSprite(14,-22,13,6,0xffffff);
    var leftArm = createFilledSprite(-15,-22,13,6,0xffffff);

    rightArm.angle = 10;
    leftArm.angle = -10;

    beaconSprite.addChild(rightArm);
    beaconSprite.addChild(leftArm);

    var name = game.add.text(0, -50, 'your best');
    name.anchor.set(0.5);
    name.font = 'Arial';
    name.fontWeight = 'bold';
    name.fontSize = 12;
    name.fill = '#ffffff';
    //name.alpha = 0.5;    

    beaconSprite.addChild(name);

    beaconSprite.alpha = 0.5;
    return beaconSprite;

}

function createRamp() {

    var path = [0,0,50,0,25,-40];

    var spr = game.add.sprite(0,0);
    var g = game.add.graphics(0,0);
    g.beginFill(0xdd4455);
    //g.lineStyle(4, 0xffaa55, 1);
    g.drawPolygon(path);
    g.endFill();
    spr.addChild(g);

    game.physics.box2d.enable(spr);
    spr.body.setPolygon(path);
    spr.body.static = true;
    //spr.body.setCollisionCategory(8);

    //spr.body.mass = 100;
    //spr.body.friction = 0.01;

    truckSprite.colCircle.setBodyContactCallback(spr.body, groundTruckContactCallback, this);

    return spr;

}

function createStartLine() {

    var linew = 60;
    var rw = 20;
    var rh = 20;
    var col = 3;

    var colors = [0x55dd55,0x99ff99];
    var colorIdx = 0;

    var sprite = game.add.sprite(0,0);
    var g = game.add.graphics(0,0);

    for (var row=0;row<600/rh;++row) {
        for (var col=0;col<linew/rw;++col) {
        
            g.beginFill(colors[colorIdx]);
            g.drawRect(col*rw, row*rh, rw, rh);
            g.endFill();

            colorIdx = (colorIdx+1) % 2;

        }        
    }
    
    sprite.addChild(g);

    sprite.alpha = 0.2;

    var caption = game.add.text(30, 50, "START");
    caption.anchor.set(0.5);
    caption.align = 'center';
    caption.font = 'Arial';
    caption.fontWeight = 'bold';
    caption.fontSize = 16;
    caption.fill = '#ffffff';
    caption.alpha = 0.6;

    startLine = game.add.group();
    startLine.add(sprite);
    startLine.add(caption);
    startLine.x = 300;
    startLine.y = 0;

}

function createFinishLine() {

    var linew = 60;
    var rw = 20;
    var rh = 20;
    var col = 3;

    var colors = [0xdddd22,0xffff22];
    var colorIdx = 0;

    var sprite = game.add.sprite(0,0);
    var g = game.add.graphics(0,0);

    for (var row=0;row<600/rh;++row) {
        for (var col=0;col<linew/rw;++col) {
        
            g.beginFill(colors[colorIdx]);
            g.drawRect(col*rw, row*rh, rw, rh);
            g.endFill();

            colorIdx = (colorIdx+1) % 2;

        }        
    }
    
    sprite.addChild(g);

    sprite.alpha = 0.2;

    var caption = game.add.text(30, 50, "FINISH");
    caption.anchor.set(0.5);
    caption.align = 'center';
    caption.font = 'Arial';
    caption.fontWeight = 'bold';
    caption.fontSize = 16;
    caption.fill = '#ffffff';
    caption.alpha = 0.6;

    finishLine = game.add.group();
    finishLine.add(sprite);
    finishLine.add(caption);
    finishLine.x = worldBounds.width - 200;
    finishLine.y = 0;

}

function createFilledSprite(x,y,w,h,color) {

    var bodySprite = game.add.sprite(x,y);
    var g = game.add.graphics(0,0);
    g.beginFill(color);
    g.drawRect(-w*0.5, -h*0.5, w, h);
    g.endFill();
    bodySprite.addChild(g);
    
    return bodySprite;

};

function createTruck() {

    function createArm(x,y,w,h,color,rightArm) {

        var arm = game.add.sprite(x,y);
        var g = game.add.graphics(0,0);
        
        g.beginFill(color);
        g.drawRect(-w*0.5, -h*0.5, w, h);
        g.endFill();
        
        g.beginFill(0x333333);
        if (rightArm) {
            g.drawRect(8, -3, 2, 6);
        }
        else {
            g.drawRect(-8, -3, 2, 6);   
        }
        g.endFill();

        g.beginFill(0x333333);
        g.drawRect(-w*0.5, -h*0.5, w, 2);
        g.endFill();

        arm.addChild(g);
        game.physics.box2d.enable(arm);
        arm.body.setRectangle(w, h, 0, 0);
        
        return arm;

    }

    var width = 50;
    var height = 5;
    var PTM = 1;
    var randomColor = game.rnd.between(0,2);
    var colors = [0x58ADF7,0xaa0000,0x7CA832];

    truckSprite = createSpriteRect(350,300,width,height,0xdd2d2d);
    truckBody = truckSprite.body;

    truckBody.mass = 0.5;
    truckBody.friction = 0.04;

    var rightArm = createArm(320,200,15,6,colors[randomColor],true);
    var leftArm = createArm(280,200,15,6,colors[randomColor],false);

    //var rightHand = createFilledSprite(8,0,2,6,0x000000);
    //rightArm.addChild(rightHand);
    //var leftHand = createFilledSprite(-8,0,2,6,0x000000);
    //leftArm.addChild(leftHand);
    
    var dollBodySprite = createSpriteRect(300,200,15,30,0x777777);
    game.physics.box2d.enable(dollBodySprite);
    game.physics.box2d.weldJoint(truckBody, dollBodySprite.body, 0, 0, 0, 20, 7, 0.5);

    game.physics.box2d.weldJoint(dollBodySprite.body, rightArm.body, 2, 1, -7, 0, 5, 1.5);
    game.physics.box2d.weldJoint(dollBodySprite.body, leftArm.body, -4, 1, 7, 0, 5, 1.5);

    rightArm.body.sensor = true;
    rightArm.body.mass = 0.01;

    leftArm.body.sensor = true;
    leftArm.body.mass = 0.01;

    var nomad = game.add.sprite(0,0,'nomad',randomColor);
    nomad.anchor.setTo(0.5,0.5);
    dollBodySprite.addChild(nomad);

    var colCircle = new Phaser.Physics.Box2D.Body(game, null, 300, 300);
    colCircle.setCircle(15);
    colCircle.sensor = true;
    game.physics.box2d.weldJoint(truckBody, colCircle, 0, 15, 0, 0);

    var dollHeadCircle = new Phaser.Physics.Box2D.Body(game, null, 300, 300);
    dollHeadCircle.setCircle(7);
    dollHeadCircle.sensor = true;
    game.physics.box2d.weldJoint(dollBodySprite.body, dollHeadCircle, 0, -15, 0, 0);

    truckBody.setCollisionCategory(8);
    dollBodySprite.body.setCollisionCategory(8);

    truckSprite.dollSprite = dollBodySprite;
    truckSprite.colCircle = colCircle;
    truckSprite.dollSprite.dollHeadCircle = dollHeadCircle;
    truckSprite.dollSprite.arms = [rightArm, leftArm];
    
    colCircle.setBodyContactCallback(ground, groundTruckContactCallback, this);

}

function createGround() {

    var PTM = 20; // conversion ratio

    ground = new Phaser.Physics.Box2D.Body(game, null, 0, 450);
    ground.friction = 0.04;
    ground.static = true;

    var path = [];
    path.push(0, 610);

    var x1 = -10.0;
    var y1 = 7.0 * box2d.b2Cos(x1 / 22.0 * box2d.b2_pi);
        
    path.push(x1*PTM);
    path.push(y1*PTM);

    for (var i = 0; i < 600; ++i)
    {
        var x2 = x1 + 1.5;
        var y2 = 3.0 * box2d.b2Cos(x2 / 22.0 * box2d.b2_pi) * 0.5 + box2d.b2Cos(x2 / 15.0 * box2d.b2_pi) * 3;

        ground.addEdge(x1 * PTM, y1 * PTM, x2 * PTM, y2 * PTM);

        path.push(x2*PTM);
        path.push(y2*PTM);

        x1 = x2;
        y1 = y2;
    }

    var lx = path[path.length-2];
    var ly = path[path.length-1];

    path.push(lx + 1);
    path.push(ly + 200);

    var b = game.add.sprite(0,450);
    var g = game.add.graphics(0,0);
    g.beginFill(0xF7D063);
    g.lineStyle(8, 0xCC8851, 1);
    g.drawPolygon(path);
    g.endFill();
    b.addChild(g);

}

function createInstructions() {

    function createInstructionTable(x,y,w,h) {

        var b = game.add.sprite(x,y);
        var g = game.add.graphics(0,0);

        g.beginFill(0xaa2012);
        g.drawRect(5,-2,5,40)        
        g.drawRect(w-10,-2,5,40)

        //g.beginFill(0xF7D063);
        g.beginFill(0xeeeeee);
        //g.lineStyle(8, 0xCC8851, 1);
        g.drawRect(0,0,w,h)

        g.endFill();
        b.addChild(g);
        b.anchor.setTo(0.5,0.5);

        return b;

    }

    function text(x,y,msg) {
        var i1 = game.add.text(x, y, msg);
        i1.font = 'Arial';
        i1.align = 'center';
        i1.fontWeight = 'bold';
        i1.fontSize = 12;
        i1.fill = '#aa2012';
        i1.anchor.x = 0.5;
        return i1;        
    }

    var b1 = createInstructionTable(600,470,70,20);
    b1.addChild(text(32,2,"▲ forward"));

    var b2 = createInstructionTable(1100,460,60,20);
    b2.addChild(text(28,2,"▼ brake"));

    var b3up = createInstructionTable(1750,510-25,70,20);
    b3up.addChild(text(35,2,"on air"));
    var b3down = createInstructionTable(1750,510,70,20);
    b3down.addChild(text(35,2,"◄ lean left"));

    var b4up = createInstructionTable(2080,340-25,80,20);
    b4up.addChild(text(40,2,"on air"));
    var b4down = createInstructionTable(2080,340,80,20);
    b4down.addChild(text(37,2,"► lean right"));

    var b5up = createInstructionTable(2700,390-25,80,20);
    b5up.addChild(text(40,2,"roll 360°"));
    var b5down = createInstructionTable(2700,390,80,20);
    b5down.addChild(text(37,2,"to boost!"));

    var b6up = createInstructionTable(15880,390-25,80,20);
    b6up.addChild(text(40,2,"[space]"));
    var b6down = createInstructionTable(15880,390,80,20);
    b6down.addChild(text(37,2,"to start"));

    var ramp1 = createRamp();
    ramp1.body.x = 3250;
    ramp1.body.y = 390;

    var ramp2 = createRamp();
    ramp2.body.x = 5060;
    ramp2.body.y = 400;

    ramps.push(ramp1);
    ramps.push(ramp2);

    instructionsGroup = game.add.group();
    instructionsGroup.add(b1);
    instructionsGroup.add(b2);
    instructionsGroup.add(b3up);
    instructionsGroup.add(b3down);
    instructionsGroup.add(b4up);
    instructionsGroup.add(b4down);
    instructionsGroup.add(b5up);
    instructionsGroup.add(b5down);
    instructionsGroup.add(b6up);
    instructionsGroup.add(b6down);

}

function createArrowSymbol() {

    /*
    var path = [0,0,25,0,12.5,-25];

    arrowSymbol = game.add.sprite(0,0);
    var g = game.add.graphics(0,0);    
    g.beginFill(0x1F5Fbb);

    g.lineStyle(3, 0xffffff, 1);
    g.drawPolygon(path);
    g.endFill();
    arrowSymbol.addChild(g);

    arrowSymbol.scale.setTo(0.5,0.5);

    arrowSymbol.fixedToCamera = true;

    var arrowx = (truckBody.x / worldBounds.width) * 790;
    arrowSymbol.cameraOffset.setTo(arrowx, 47);
    */

    arrowSymbol = game.add.sprite(0,0,'head');
    arrowSymbol.anchor.setTo(1,1);
    arrowSymbol.scale.setTo(0.5);

    arrowSymbol.fixedToCamera = true;
    var arrowx = (truckBody.x / worldBounds.width) * 790;
    arrowSymbol.cameraOffset.setTo(arrowx, 47);

}

MyGame.prototype.create = function() {

    game.physics.startSystem(Phaser.Physics.BOX2D);
    game.physics.box2d.setBoundsToWorld(true, true, true, true);

    game.physics.box2d.debugDraw.shapes = true;
    game.physics.box2d.debugDraw.joints = true;
    game.physics.box2d.debugDraw.aabbs = false;
    game.physics.box2d.debugDraw.pairs = true;
    game.physics.box2d.debugDraw.centerOfMass = true;    

    game.physics.box2d.gravity.y = 400;
    game.physics.box2d.density = 1;
    game.physics.box2d.friction = 0.3;
    game.physics.box2d.restitution = 0.2;

    createGround();
    createTruck();    
    
    beacon = createBeacon();

    createStartLine();
    createFinishLine();

    startLine.visible = false;
    finishLine.visible = false;

    createUI();
    createInstructions();

    createArrowSymbol();

    emitter = game.add.emitter(0, 0, 100);
    emitter.makeParticles('gibs', [0,1], 100, false, false);
    emitter.gravity = 10;
    emitter.minParticleSpeed.setTo(-30, -20);
    emitter.maxParticleSpeed.setTo(30, 5);
    emitter.minParticleScale = 0.2;
    emitter.maxParticleScale = 0.8;

    emitter2 = game.add.emitter(0, 0, 100);
    emitter2.makeParticles('stars', [0,1,2,3], 100, false, false);
    emitter2.gravity = 10;
    emitter2.minParticleSpeed.setTo(-100, -300);
    emitter2.maxParticleSpeed.setTo(100, 300);
    emitter2.minParticleScale = 0.5;
    emitter2.maxParticleScale = 1.5;

    cursors = game.input.keyboard.createCursorKeys();
    spacekey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    game.camera.follow(truckSprite);
    game.camera.deadzone = new Phaser.Rectangle(0, 0, 200, 600);
    //game.camera.x = 15200;

    announcementLabel.setText("Follow\nTutorial");
    popAnnouncement(6000);

    SoundPlayer.stopDrums();
    
    gameState = GameStateWarmUp;

}

function starBurst(x, y) {

    emitter2.x = x;
    emitter2.y = y;

    emitter2.start(true, 3000, null, 25);


}

function bloodBurst() {

    emitter.x = truckSprite.dollSprite.dollHeadCircle.x;
    emitter.y = truckSprite.dollSprite.dollHeadCircle.y;

    //  The first parameter sets the effect to "explode" which means all particles are emitted at once
    //  The second gives each particle a 2000ms lifespan
    //  The third is ignored when using burst/explode mode
    //  The final parameter (10) is how many particles will be emitted in this single burst
    emitter.start(true, 2000, null, 20);

}

function createUI() {

    var g = game.add.graphics(0,0);
    g.beginFill(0x333333);
    g.drawRect(0,0, 800, 32);
    g.endFill();
    g.fixedToCamera = true;

    headerLabel = game.add.text(0, 0, "press [space] to start");
    headerLabel.align = 'right';
    headerLabel.anchor.set(1);
    headerLabel.fontWeight = 'bold';
    headerLabel.fontSize = 24;
    headerLabel.font = 'Arial';
    headerLabel.fill = '#888888';
    headerLabel.fixedToCamera = true;
    headerLabel.cameraOffset.setTo(790, 35);

    timeLabel = game.add.text(0, 0, "00:00.00");
    timeLabel.anchor.set(0.0);
    timeLabel.align = 'left';
    timeLabel.font = 'Courier';
    timeLabel.fontWeight = 'bold';
    timeLabel.fontSize = 24;
    timeLabel.fill = '#888888';
    //timeLabel.alpha = 0.8;
    timeLabel.fixedToCamera = true;
    timeLabel.cameraOffset.setTo(5, 5);

    announcementLabel = game.add.text(0, 0, "READY");
    announcementLabel.anchor.set(0.5);
    announcementLabel.align = 'center';
    announcementLabel.font = 'Arial';
    announcementLabel.fontWeight = 'bold';
    announcementLabel.fontSize = 90;
    announcementLabel.fill = '#ffffff';
    announcementLabel.alpha = 0.2;
    announcementLabel.fixedToCamera = true;
    announcementLabel.cameraOffset.setTo(800*0.5,600*0.5);
    announcementLabel.visible = false;

    bonusLabel = game.add.text(0, 0, "NICE!");
    bonusLabel.anchor.set(0.5);
    bonusLabel.align = 'center';
    bonusLabel.font = 'Arial';
    bonusLabel.fontWeight = 'bold';
    bonusLabel.fontSize = 90;
    bonusLabel.fill = '#ff6666';
    bonusLabel.alpha = 0.2;
    bonusLabel.fixedToCamera = true;
    bonusLabel.cameraOffset.setTo(800*0.5,600*0.25);
    bonusLabel.visible = false;

    bestRunLabel = game.add.text(0, 0, "BEST RUN: 00:34.12");
    bestRunLabel.anchor.set(0);
    bestRunLabel.align = 'left';
    bestRunLabel.font = 'Arial';
    bestRunLabel.fontWeight = 'bold';
    bestRunLabel.fontSize = 28;
    bestRunLabel.fill = '#ffffff';
    bestRunLabel.alpha = 0.5;
    bestRunLabel.fixedToCamera = true;
    bestRunLabel.cameraOffset.setTo(2,600-30);
    bestRunLabel.visible = false;

    game.time.events.add(Phaser.Timer.SECOND * 15, function() {
        if (gameState == GameStateWarmUp || gameState == GameStateFinished) {
            announcementLabel.setText("press space\nto start");
            popAnnouncement(5000);
        }
    });    

}

MyGame.prototype.render = function() {
    //game.debug.box2dWorld();

    //var angle = Math.floor(180 * normalizeAngle(truckBody.rotation) / Math.PI);
    //var angle2 = Math.floor(180 * truckBody.rotation / Math.PI);

    //var a = normalRelativeAngle(truckBody.rotation);

    //game.debug.text("relative angle: " + a, 32, 50);
    //game.debug.text("angle: " + angle, 32, 70);
    //game.debug.text("delta: " + Math.floor(rotationTrickDeltaAngle), 32, 70);

    //game.debug.text("on air: " + onair, 32, 50);

}

function destroyCurrentTruck() {

    /*
    truckSprite.dollSprite.body.destroy();
    truckBody.destroy();

    truckSprite.alpha = 0.2;
    truckSprite.dollSprite.alpha = 0.2;
    */

    truckSprite.dollSprite.arms[0].destroy();
    truckSprite.dollSprite.arms[1].destroy();
    truckSprite.dollSprite.destroy();
    truckSprite.destroy();

}

function showBonusMessage(message) {

    bonusLabel.setText(message);
    bonusLabel.visible = true;
    bonusLabel.alpha = 0;

    var tw1 = game.add.tween(bonusLabel);
    tw1.to({ alpha: 0.2 }, 250, "Linear", false);

    var tw2 = game.add.tween(bonusLabel);
    tw2.to({ alpha: 0.0 }, 500, "Linear", false, 2000);
    tw2.onComplete.add(function(){
        bonusLabel.visible = false;
        bonusLabel.scale.setTo(1,1);
        console.log("tween done!");
    }, this);

    var tw3 = game.add.tween(bonusLabel.scale);
    tw3.to({x: 1.5, y:1.5}, 1000, Phaser.Easing.Bounce.Out, true);

    tw1.chain(tw2);
    tw1.start();

}

function updateCountDown() {

    ++currentCountDownPhase;
    if (currentCountDownPhase == 1) {
        announcementLabel.setText("READY");
        SoundPlayer.playSnare();
    }
    else
    if (currentCountDownPhase == 2) {
        announcementLabel.setText("SET");
        SoundPlayer.playSnare();
    }
    else
    if (currentCountDownPhase == 3) {
        announcementLabel.setText("YALLAH!");
        SoundPlayer.playCrash(true);

        startRun();

    }
    else {
        countDownTimer.destroy();
        countDownTimer = null;
        //announcementLabel.visible = false;
    }

}

function popAnnouncement(wtime) {

    if (announcementLabel.tweens) {
        for (var i=0;i<announcementLabel.tweens.length;++i) {
            game.tweens.remove(announcementLabel.tweens[i]);
            announcementLabel.tweens[i] = null;
        }
        announcementLabel.tweens = null;
    }

    announcementLabel.visible = true;
    announcementLabel.scale.setTo(1,1);
    announcementLabel.alpha = 0;

    var tw1 = game.add.tween(announcementLabel);
    tw1.to({ alpha: 0.2 }, 250, "Linear", false);

    var tw2 = game.add.tween(announcementLabel);
    tw2.to({ alpha: 0.0 }, 500, "Linear", false, wtime);
    tw2.onComplete.add(function(){
        announcementLabel.alpha = 0.2;
        announcementLabel.visible = false;
        announcementLabel.scale.setTo(1,1);
    }, this);

    var tw3 = game.add.tween(announcementLabel.scale);
    tw3.to({x: 1.5, y:1.5}, 900, Phaser.Easing.Bounce.Out, true);

    tw1.chain(tw2);
    tw1.start();

    announcementLabel.tweens = [tw1, tw2, tw3];

}

function beginCountdownToRun() {

    destroyCurrentTruck();
    createTruck();

    game.camera.follow(truckSprite);

    gameState = GameStateCountdown;

    headerLabel.visible = false;
    announcementLabel.visible = true;
    startLine.visible = true;
    finishLine.visible = true;
    instructionsGroup.visible = false;
    
    ramps.forEach(function(ramp) {
        ramp.destroy();
    });

    announcementLabel.setText("PREPARE");

    //game.physics.box2d.gravity.y = 0;

    if (countDownTimer) {
        countDownTimer.destroy();
        countDownTimer = null;        
    }

    currentCountDownPhase = 0;
    countDownTimer = game.time.create(false);
    countDownTimer.loop(1250, updateCountDown, this);
    countDownTimer.start();

    popAnnouncement(6000);

    updateTimeLabel(0, true);

    SoundPlayer.playSnare();

}

function startRun() {

    //destroyCurrentTruck();
    //createTruck();

    //game.camera.follow(truckSprite);
        
    gameStartTime = game.time.now;
    gameState = GameStateRun;

    truckSprite.dollSprite.dollHeadCircle.setBodyContactCallback(ground, groundDollContactCallback, this);

    game.physics.box2d.gravity.y = 400;

    //starBurst(330, worldBounds.height * 0.5);

    currentGameRecord = [];
    savedGameRecordIndex = 0;
    
}

function msToTime(timems, showFullClock) {

    var min = Math.floor(timems*0.001/60); 
    var secs = Math.floor(timems*0.001 - min*60) 
    var ms = Math.floor((timems - (min * 60 + secs) * 1000)*0.1);
    if (min < 10) {
        min = "0"+min;
    }
    if (secs < 10) {
        secs = "0"+secs;
    }
    if (ms < 10) {
        ms = "0"+ms;
    }
    var tick = " ";
    if (ms > 50 || showFullClock == true) {
        tick = ":";
    }

    return min+tick+secs+"."+ms;

}

function updateTimeLabel(timems, showFullClock) {

    timeLabel.setText(msToTime(timems,showFullClock));

}

function thrustForward(body,power,sign) {
    var magnitude = -sign * body.world.pxm(power) * body.data.GetMass();
        
    var force = new box2d.b2Vec2();
    body.toWorldVector(force, {y:0,x:magnitude});
        
    body.data.ApplyForce( force, body.data.GetWorldCenter(), true );
}

function thrustDown(body,power) {
    var magnitude = body.world.pxm(power) * body.data.GetMass();
        
    var force = new box2d.b2Vec2();
    body.toWorldVector(force, {x:0,y:-magnitude});
        
    body.data.ApplyForce( force, body.data.GetWorldCenter(), true );
}

function normalizeAngle(angle) { 
  angle = angle % (2 * Math.PI); 
  return angle >= 0 ? angle : angle + 2 * Math.PI;
};

var TWO_PI = 2 * Math.PI;
function normalRelativeAngle(angle) {
    return ((angle %= TWO_PI) >= 0 ? (angle < Math.PI) ? angle : angle - TWO_PI : (angle >= -Math.PI) ? angle : angle + TWO_PI)* (180 / Math.PI);
}   

var rightpressed = false;
var leftpressed = false;
var spressed = false;
var lpressed = false;
var kpressed = false;
var spacePressed = false;

MyGame.prototype.update = function() {

    onair = collidedFixtureCount == 0;
    if (onair != prevonair) {
        prevonair = onair;
    }

    if (onair == false) {
        trickRotLeft = trickRotRight = false;
    }

    if (gameState == GameStateRun) {

        var ct = game.time.now - gameStartTime;
        updateTimeLabel(ct);

        if (truckBody.x > game.world._width - 200) {

            console.log("GAME FINISHED!");

            announcementLabel.setText("FINISH");

            //starBurst(worldBounds.width - 200, worldBounds.height * 0.5);
            starBurst(truckSprite.x, truckSprite.y);

            if (GJAPI.bActive == true) {
                var scoreToSubmit = (game.time.now - gameStartTime)*0.001;
                scoreToSubmit = scoreToSubmit.toFixed(2);
                console.log("submit:",scoreToSubmit)
                GJAPI.ScoreAdd(64856, scoreToSubmit, scoreToSubmit+" secs");
            }

            //announcementLabel.visible = true;

            //game.camera.follow(null);
            //truckBody.destroy();

            gameState = GameStateFinished;

            var lapTime = game.time.now - gameStartTime;
            if (lapTime < bestTime || bestTime == -1) {
                
                savedGameRecord = currentGameRecord.slice();
                
                if (bestTime != -1) {
                    console.log("best time: ", Math.floor(bestTime*0.001), " secs");
                    announcementLabel.setText("NEW BEST!");    
                }

                bestTime = lapTime;
                bestRunLabel.setText("BEST TIME  "+msToTime(bestTime, true));
                bestRunLabel.visible = true;
                
            }

            popAnnouncement(8000);

            game.time.events.add(Phaser.Timer.SECOND * 12, function() {
                if (gameState == GameStateWarmUp || gameState == GameStateFinished) {
                    announcementLabel.setText("press space\nto start");
                    popAnnouncement(20000);
                }
            });    

            updateTimeLabel(ct, true);

            headerLabel.visible = true;

            SoundPlayer.playRoll();
            
        }
        
        var record = {time:ct, x:truckBody.x, y:truckBody.y, rotation:truckBody.rotation};
        currentGameRecord[currentGameRecord.length] = record;

        if (savedGameRecord.length > 0) {
            for (var i=savedGameRecordIndex;i<savedGameRecord.length;++i) {
                
                var rec = savedGameRecord[i];
                if (rec.time >= ct) {

                    savedGameRecordIndex = i+1;
                    beacon.x = rec.x;
                    beacon.y = rec.y;
                    beacon.rotation = rec.rotation;

                    for (var j=0;j<beaconTrail.length;++j) {
                        var b = beaconTrail[j];
                        b.destroy();
                        beaconTrail[j] = null;
                    }
                    beaconTrail = [];

                    for (var k=0;k<20;k+=2) {
                        if (i-k>0) {
                            var rprev = savedGameRecord[i-k];
                            var b = createBeacon();
                            b.x = rprev.x;
                            b.y = rprev.y;
                            b.rotation = rprev.rotation;
                            b.alpha = b.alpha - 0.05*k;
                            beaconTrail.push(b);
                        }
                    }

                    break;
                }
            }

            if (savedGameRecordIndex == savedGameRecord.length && beaconTrail.length>0) {
                //beacon finished game (before us)
                for (var j=0;j<beaconTrail.length;++j) {
                    var b = beaconTrail[j];
                    b.destroy();
                    beaconTrail[j] = null;
                }
                beaconTrail = [];
            }

        }
        
    }
    else
    if (gameState == GameStateCountdown) {

        truckBody.setZeroVelocity();
        truckBody.setZeroRotation();
        truckBody.setZeroDamping();

        if (savedGameRecord.length > 0) {
            var rec = savedGameRecord[0];
            beacon.x = rec.x;
            beacon.y = rec.y;
            beacon.rotation = rec.rotation;            
        }

    }

    var arrowx = (truckBody.x / worldBounds.width) * 790;
    arrowSymbol.cameraOffset.setTo(arrowx, 47);

    if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {        
        if (onair) {
            truckBody.rotateRight(200);
        }

        var currentAngle = 180 * truckBody.rotation / Math.PI;

        if (trickRotRight == false && gameState != GameStateCountdown) {
            trickRotRight = true;
            trickRotLeft = false;
            rotationTrickStartAngle = currentAngle;
        }

    }

    if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
        if (onair) {
            truckBody.rotateLeft(200);
        }

        var currentAngle = 180 * truckBody.rotation / Math.PI;

        if (trickRotLeft == false && gameState != GameStateCountdown) {
            trickRotLeft = true;
            trickRotRight = false;
            rotationTrickStartAngle = currentAngle;
        }

    }

    if (trickRotRight || trickRotLeft) {

        var currentAngle = 180 * truckBody.rotation / Math.PI;
        var delta = currentAngle - rotationTrickStartAngle;
        rotationTrickDeltaAngle = delta;

        if (delta >= 300) {
            showBonusMessage("FORW 360°");
            trickRotRight = false;
            SoundPlayer.playRoll();

            currentThrustPower = BoostedThrustPower;
            game.time.events.add(Phaser.Timer.SECOND * 3, function() {
                currentThrustPower = DefaultThrustPower;
                console.log("boost end");
            });

        }
        else
        if (delta <= -300) {
            showBonusMessage("REV 360°");
            trickRotLeft = false;
            SoundPlayer.playRoll();

            currentThrustPower = BoostedThrustPower;
            game.time.events.add(Phaser.Timer.SECOND * 3, function() {
                currentThrustPower = DefaultThrustPower;
                console.log("boost end");
            });

        }


    }

    if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {        
        if (onair == false) {
            thrustForward(truckBody, DefaultThrustPower, -1);
        }
        else {
            //air brake

            var a = normalRelativeAngle(truckBody.rotation);
            if (a > -80 && a < 80) {
                thrustForward(truckBody, DefaultThrustPower * 0.8, -1);
            }

        }
    }
    else
    if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
        if (onair == false) {

            var thrustForce = currentThrustPower;
            if (normalRelativeAngle(truckBody.rotation) > 0) {
                thrustForce = currentThrustPower * 1.25;
            }

            thrustForward(truckBody, thrustForce, 1);

        }        
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        if (spacePressed == false) {
            spacePressed = true;

            if (gameState == GameStateWarmUp || gameState == GameStateFinished || gameState == GameStateRun) {
                
                beginCountdownToRun();

            }

        }        
    }
    else {
        spacePressed = false;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.T)) {
        if (spressed == false) {
            spressed = true;
            //SoundPlayer.playSnare();
        }
    }
    else {
        spressed = false;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
        if (lpressed == false) {
            lpressed = true;
            //SoundPlayer.playKick();
        }        
    }
    else {
        lpressed = false;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
        if (kpressed == false) {
            kpressed = true;
            //SoundPlayer.playCrash();
        }        
    }
    else {
        kpressed = false;
    }

    if (levelShakeCounter > 0) {

        var rand1 = this.game.rnd.integerInRange(-10,10);
        var rand2 = this.game.rnd.integerInRange(-10,10);

        game.world.setBounds(rand1, rand2, worldBounds.width, worldBounds.height);
        if (--levelShakeCounter == 0) {
            game.world.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
        }

    }

    emitter.forEachAlive(function(p){
        p.alpha= p.lifespan / emitter.lifespan;
    });    

    emitter2.forEachAlive(function(p){
        p.alpha= p.lifespan / emitter2.lifespan;
    });    

}

function groundTruckContactCallback(body1, body2, fixture1, fixture2, begin) {

    if (begin) {
        ++collidedFixtureCount;
    }
    else {
        --collidedFixtureCount;
    }

}

function groundDollContactCallback(body1, body2, fixture1, fixture2, begin) {

    if (begin) {
        ++collidedDollFixtureCount;
    }
    else {
        --collidedDollFixtureCount;
    }

    if (collidedDollFixtureCount == 1 && gameState == GameStateRun) {
        
        if (levelShakeCounter == 0) {
            SoundPlayer.playSplash();
            levelShakeCounter = 20;

            bloodBurst();
        }
        trickRotRight = false;
        trickRotLeft = false;
    }    

}

function mouseDragStart() {
    game.physics.box2d.mouseDragStart(game.input.mousePointer);
}

function mouseDragMove() {
    game.physics.box2d.mouseDragMove(game.input.mousePointer);
}

function mouseDragEnd() {
    game.physics.box2d.mouseDragEnd();
}

