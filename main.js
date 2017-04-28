var cursors;
var player;
var spacekey;
var ground;
var truckSprite;
var truckBody;
var collidedFixtureCount = 0;
var collidedDollFixtureCount = 0;
var beacon;
var driveJoints = [];

var currentGameRecord = [];
var savedGameRecord = [];
var savedGameRecordIndex = 0;
var gameStartTime;
var bestTime = -1;

var headerLabel;
var announcementLabel;
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

var worldBounds = {x:0, y:0, width: 2*800, height: 600};

var Game = function() {
};

//Game.prototype = {};

Game.prototype.preload = function() {
    console.log("PRELOAD");
}

Game.prototype.create = function() {
    console.log("CREATE");
}

//var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'PhaserGame');
game.state.add("Game", Game);
game.state.start("Game");

function preload() {

    game.load.spritesheet('tilemap', 'assets/ground_1x1_bw.png?1', 32, 32);
    game.load.spritesheet('baddie_yellow', 'assets/baddie_yellow.png?1', 32, 32);
    game.load.spritesheet('baddie', 'assets/baddie_bw.png?1', 32, 32);
    game.load.image('pattern-1', 'assets/pattern-1.jpg?1');
    game.load.image('pattern-2', 'assets/pattern-2.jpg?1');
    game.load.image('pattern-3', 'assets/pattern-3.jpg?1');
    game.load.image('heart', 'assets/heart_bw.png?1');
    game.load.image('horse-head', 'assets/horse-head-small.png?1');
    game.load.image('diamond', 'assets/diamond_bw.png?1');
    game.load.image('chunk', 'assets/chunk.png');
    game.load.audio('sfx', 'assets/fx_mixdown.mp3');
    game.load.audio('bgmusic', ['assets/A_Night_Of_Dizzy_Spells.mp3']);
    game.load.bitmapFont('carrier_command', 'assets/carrier_command.png', 'assets/carrier_command.xml');

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

    var beaconSprite = game.add.sprite(300,0);
    var g = game.add.graphics(0,0);
    g.beginFill(0xaadd00);
    g.drawRect(0, 0, 50, 5);
    g.endFill();
    beaconSprite.addChild(g);

    var doll = game.add.sprite(18,-32);
    var gg = game.add.graphics(0,0);
    gg.beginFill(0xaadd00);
    gg.drawRect(0, 0, 15, 30);
    gg.endFill();
    doll.addChild(gg);

    beaconSprite.addChild(doll);
    beaconSprite.alpha = 0.5;

    return beaconSprite;

}

function createRamp() {

    var path = [0,0,50,0,50,-100];

    var spr = game.add.sprite(800,450);
    var g = game.add.graphics(0,0);
    g.beginFill(0xdd4455);
    g.lineStyle(4, 0xffaa55, 1);
    g.drawPolygon(path);
    g.endFill();
    spr.addChild(g);

    game.physics.box2d.enable(spr);
    spr.body.setPolygon(path);
    spr.body.static = true;

    truckSprite.colCircle.setBodyContactCallback(spr.body, groundTruckContactCallback, this);    

}

function createStartLine() {

    var linew = 60;
    var rw = 20;
    var rh = 20;
    var col = 3;

    var colors = [0x55dd55,0x99ff99];
    var colorIdx = 0;

    var sprite = game.add.sprite(300,0);
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

    var caption = game.add.text(330, 45, "START");
    caption.anchor.set(0.5);
    caption.align = 'center';
    caption.font = 'Arial';
    caption.fontWeight = 'bold';
    caption.fontSize = 16;
    caption.fill = '#dddddd';
    caption.alpha = 0.6;

}

function createFinishLine() {

    var linew = 60;
    var rw = 20;
    var rh = 20;
    var col = 3;

    var colors = [0xdddd22,0xffff22];
    var colorIdx = 0;

    var sprite = game.add.sprite(worldBounds.width - 200,0);
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

    var caption = game.add.text(worldBounds.width - 200 + 30, 45, "FINISH");
    caption.anchor.set(0.5);
    caption.align = 'center';
    caption.font = 'Arial';
    caption.fontWeight = 'bold';
    caption.fontSize = 16;
    caption.fill = '#dddddd';
    caption.alpha = 0.6;

}

function createTruck() {

    var width = 50;
    var height = 5;
    var PTM = 1;

    truckSprite = createSpriteRect(350,300,width,height,0xff0f0f);
    truckBody = truckSprite.body;

    truckBody.mass = 0.5;
    truckBody.friction = 0.04;
    
    var dollBodySprite = createSpriteRect(300,200,15,30,0x0000ff); 
    game.physics.box2d.weldJoint(truckBody, dollBodySprite.body, 0, 0, 0, 20, 7, 0.5);

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
    
    colCircle.setBodyContactCallback(ground, groundTruckContactCallback, this);

    //truckBody.rotation = Math.PI * 2;

}

function createGround() {

    var PTM = 20; // conversion ratio

    ground = new Phaser.Physics.Box2D.Body(game, null, 0, 450);
    ground.friction = 0.04;
    ground.static = true;

    var path = [];
    path.push(0, 610);

    var x1 = 0.0;
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
    path.push(ly + 100);

    var b = game.add.sprite(0,450);
    var g = game.add.graphics(0,0);
    g.beginFill(0x224455);
    g.lineStyle(4, 0xa1d9f5, 1);
    g.drawPolygon(path);
    g.endFill();
    b.addChild(g);

    //var bg = game.add.tileSprite(0,0,worldBounds.width,768,'pattern-3');
    //bg.mask = g;

}

function create() {

    game.stage.smoothed = true;
    game.time.advancedTiming = true;

    game.world.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
    //game.world.setBounds(0, 0, 2 * 800, 600);

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    SoundPlayer.init(game);

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

    //var bg = game.add.tileSprite(0,0,worldBounds.width,worldBounds.height,'pattern-2');
    //bg.alpha = 0.5;

    createGround();
    createTruck();    
    createRamp();

    beacon = createBeacon();

    createStartLine();
    createFinishLine();

    //beacon.x = 200;
    //beacon.y = 200;

    createUI();

    emitter = game.add.emitter(0, 0, 200);
    emitter.makeParticles('chunk');

    emitter.setRotation(0, 0);
    emitter.setAlpha(0.3, 0.8);
    emitter.setScale(1, 1);
    //emitter.gravity = 100;
    emitter.setXSpeed(-100, 0);
    emitter.setYSpeed(0, 0);
    emitter.emitY = 100;

    cursors = game.input.keyboard.createCursorKeys();
    spacekey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    game.camera.follow(truckSprite);
    game.camera.deadzone = new Phaser.Rectangle(0, 0, 200, 600);

    game.input.onDown.add(mouseDragStart, this);
    game.input.addMoveCallback(mouseDragMove, this);
    game.input.onUp.add(mouseDragEnd, this);

    gameState = GameStateWarmUp;
    
}

function createUI() {

    var g = game.add.graphics(0,0);
    g.beginFill(0x333333);
    g.drawRect(0,0, 800, 32);
    g.endFill();
    g.fixedToCamera = true;

    headerLabel = game.add.text(0, 0, "PRESS [SPACE] TO BEGIN");
    headerLabel.align = 'right';
    headerLabel.anchor.set(1);
    headerLabel.fontWeight = 'bold';
    headerLabel.fontSize = 24;
    headerLabel.font = 'Arial';
    headerLabel.fill = '#888888';
    headerLabel.fixedToCamera = true;
    headerLabel.cameraOffset.setTo(790, 30);

    timeLabel = game.add.text(0, 0, "00:00.000");
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
    bonusLabel.cameraOffset.setTo(800*0.5,600*0.5);
    bonusLabel.visible = false;

}

function render() {
    //game.debug.box2dWorld();

    //var angle = Math.floor(180 * normalizeAngle(truckBody.rotation) / Math.PI);
    //var angle2 = Math.floor(180 * truckBody.rotation / Math.PI);

    //game.debug.text("angle: " + angle2, 32, 50);
    //game.debug.text("delta: " + Math.floor(rotationTrickDeltaAngle), 32, 70);

}

function destroyCurrentTruck() {

    /*
    truckSprite.dollSprite.body.destroy();
    truckBody.destroy();

    truckSprite.alpha = 0.2;
    truckSprite.dollSprite.alpha = 0.2;
    */

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
        announcementLabel.setText("SET");
        SoundPlayer.play('collect');
    }
    else
    if (currentCountDownPhase == 2) {
        announcementLabel.setText("GO!");
        SoundPlayer.play('hit');

        startRun();
    }
    else {
        countDownTimer.destroy();
        countDownTimer = null;
        //announcementLabel.visible = false;
    }

}

function popAnnouncement() {

    announcementLabel.visible = true;
    announcementLabel.alpha = 0;

    var tw1 = game.add.tween(announcementLabel);
    tw1.to({ alpha: 0.2 }, 250, "Linear", false);

    var tw2 = game.add.tween(announcementLabel);
    tw2.to({ alpha: 0.0 }, 500, "Linear", false, 4500);
    tw2.onComplete.add(function(){
        announcementLabel.alpha = 0.2;
        announcementLabel.visible = false;
        announcementLabel.scale.setTo(1,1);
    }, this);

    var tw3 = game.add.tween(announcementLabel.scale);
    tw3.to({x: 1.5, y:1.5}, 900, Phaser.Easing.Bounce.Out, true);

    tw1.chain(tw2);
    tw1.start();

}

function beginCountdownToRun() {

    destroyCurrentTruck();
    createTruck();

    game.camera.follow(truckSprite);

    gameState = GameStateCountdown;

    headerLabel.visible = false;
    announcementLabel.visible = true;

    announcementLabel.setText("READY?");

    game.physics.box2d.gravity = 0;

    if (countDownTimer) {
        countDownTimer.destroy();
        countDownTimer = null;        
    }

    currentCountDownPhase = 0;
    countDownTimer = game.time.create(false);
    countDownTimer.loop(1250, updateCountDown, this);
    countDownTimer.start();

    popAnnouncement();

    SoundPlayer.play('collect');

}

function startRun() {

    //destroyCurrentTruck();
    //createTruck();

    //game.camera.follow(truckSprite);
        
    gameStartTime = game.time.now;
    gameState = GameStateRun;

    truckSprite.dollSprite.dollHeadCircle.setBodyContactCallback(ground, groundDollContactCallback, this);

    game.physics.box2d.gravity.y = 400;

    currentGameRecord = [];
    savedGameRecordIndex = 0;
    
}

function updateTimeLabel(timems, showFullClock) {

    var min = Math.floor(timems*0.001/60); 
    var secs = Math.floor(timems*0.001 - min*60) 
    var ms = Math.floor((timems - secs * 1000)*0.1);
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

    timeLabel.setText(min+tick+secs+"."+ms);

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
var spacePressed = false;

function update() {

    if (gameState == GameStateRun) {

        var ct = game.time.now - gameStartTime;
        updateTimeLabel(ct);

        if (truckBody.x > game.world._width - 200) {

            console.log("GAME FINISHED!");

            announcementLabel.setText("FINISHED");            

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
                
            }

            popAnnouncement();

            updateTimeLabel(ct, true);

            headerLabel.visible = true;

            SoundPlayer.play('boss hit');
            
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
                //beacon finished game
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

    if (bonusLabel.visible) {
        //var cx = 800*0.5 + game.rnd.between(-3,3);
        //var cy = 600*0.5 + game.rnd.between(-3,3);
        //bonusLabel.cameraOffset.setTo(cx, cy);
    }

    if (cursors.right.isDown) {        
        if (collidedFixtureCount == 0) {
            truckBody.rotateRight(200);
        }

        var currentAngle = 180 * truckBody.rotation / Math.PI;

        if (trickRotRight == false) {
            trickRotRight = true;
            trickRotLeft = false;
            rotationTrickStartAngle = currentAngle;
        }
        else {

            var delta = currentAngle - rotationTrickStartAngle;
            rotationTrickDeltaAngle = delta;
            if (delta >= 300) {
                showBonusMessage("FORW 360°");
                trickRotRight = false;
                SoundPlayer.play('collect');

                currentThrustPower = BoostedThrustPower;
                game.time.events.add(Phaser.Timer.SECOND * 3, function() {
                    currentThrustPower = DefaultThrustPower;
                    console.log("boost end");
                });

            }
            
        }

    }
    else {
        trickRotRight = false;
    }

    if (cursors.left.isDown) {
        if (collidedFixtureCount == 0) {
            truckBody.rotateLeft(200);
        }

        var currentAngle = 180 * truckBody.rotation / Math.PI;

        if (trickRotLeft == false) {
            trickRotLeft = true;
            trickRotRight = false;
            rotationTrickStartAngle = currentAngle;
        }
        else {

            var delta = currentAngle - rotationTrickStartAngle;
            rotationTrickDeltaAngle = delta;
            if (delta <= -300) {
                showBonusMessage("REV 360°");
                trickRotLeft = false;
                SoundPlayer.play('collect');

                currentThrustPower = BoostedThrustPower;
                game.time.events.add(Phaser.Timer.SECOND * 3, function() {
                    currentThrustPower = DefaultThrustPower;
                    console.log("boost end");
                });

            }
            
        }

    }
    else {
        trickRotLeft = false;
    }

    if (cursors.left.isDown && cursors.right.isDown) {
        trickRotLeft = false;
        trickRotRight = false;
    }

    if (cursors.down.isDown) {        
        if (collidedFixtureCount > 0) {
            thrustForward(truckBody, DefaultThrustPower, -1);
        }
        else {
            //air brake
            thrustForward(truckBody, DefaultThrustPower * 0.8, -1);
        }
    }
    else
    if (cursors.up.isDown) {
        if (collidedFixtureCount > 0) {

            var thrustForce = currentThrustPower;
            if (normalRelativeAngle(truckBody.rotation) > 0) {
                thrustForce = currentThrustPower * 1.25;
            }

            thrustForward(truckBody, thrustForce, 1);

            //emitter.start(false, 2000, 100);
            //emitter.start(true, 500, null, 2);
            //emitter.emitY = 0;
        }        
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        if (spacePressed == false) {
            spacePressed = true;

            //truckBody.applyForce(0,-100);

            if (gameState == GameStateWarmUp || gameState == GameStateFinished || gameState == GameStateRun) {
                
                beginCountdownToRun();

            }

        }        
    }
    else {
        spacePressed = false;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
        if (spressed == false) {
            spressed = true;
            //savedGameRecord = currentGameRecord.slice();
            //console.log("save");
        }
    }
    else {
        spressed = false;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
        if (lpressed == false) {
            lpressed = true;
            //savedGameRecordIndex = 0;
            //gameStartTime = game.time.now;
            //console.log("load");
        }        
    }
    else {
        lpressed = false;
    }

    emitter.x = truckBody.x;
    emitter.y = truckBody.y;

    if (levelShakeCounter > 0) {

        var rand1 = this.game.rnd.integerInRange(-10,10);
        var rand2 = this.game.rnd.integerInRange(-10,10);

        game.world.setBounds(rand1, rand2, worldBounds.width, worldBounds.height);
        if (--levelShakeCounter == 0) {
            game.world.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
        }

    }

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
        SoundPlayer.play('hit');
        levelShakeCounter = 20;
        trickRotRight = true;
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

