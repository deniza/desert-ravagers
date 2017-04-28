var Intro = function(game) {
    this.game = game;
};

Intro.prototype.preload = function() {
};

Intro.prototype.create = function() {

    var ground = this.createGround();
    ground.visible = false;

    var t = game.add.bitmapText(250, 150, 'arabian', 'Desert Ravagers', 48);
    t.alpha = 0.1;
    var tw = game.add.tween(t);
    tw.to({ alpha: 1.0 }, 500, "Linear", true);

    var line = this.createText("yallah 360° edition", 400, 250, 24);
    line.alpha = 0.5;
    line.fill = '#998851';
    this.line = line;
    this.line.bx = line.x;
    this.line.by = line.y;
    this.line.phase = 0;

    var pressSpace = this.createText("♦ press any key to continue ♦", 400, 580, 16);
    pressSpace.alpha = 0.5;
    pressSpace.fill = '#998851';
    pressSpace.visible = false;

    pressSpace.alpha = 0.5;
    var ta1 = game.add.tween(pressSpace);
    ta1.to({ alpha: 1.0 }, 500, "Linear", true, 0, -1);
    ta1.yoyo(true);

    game.time.events.add(Phaser.Timer.SECOND * 5, function() {
        pressSpace.visible = true;
    });

    SoundPlayer.init(game);
    SoundPlayer.playBackgroundMusic();
    SoundPlayer.playDrums();

    game.input.keyboard.addCallbacks(this, null, function() {
        game.input.keyboard.addCallbacks(this, null, null, null);
        this.game.state.start("Menu");        
    },null);

    this.gameStartTime = game.time.now;

};

Intro.prototype.createText = function(text, x, y, size) {

    var txt = this.game.add.text(x, y, text);
    txt.anchor.set(0.5);
    txt.align = 'center';
    txt.font = 'Arial';
    txt.fontWeight = 'bold';
    txt.fontSize = size;
    txt.fill = '#ffffff';
    txt.alpha = 1;

    return txt;

}

Intro.prototype.animateLine = function() {

    this.line.scale.x = 1;
    this.line.scale.y = 1;
    var tw1 = game.add.tween(this.line.scale);
    tw1.to({x: 1.2, y:1.2}, 100, "Linear", true);
    var tw2 = game.add.tween(this.line.scale);
    tw2.to({x: 1, y:1}, 100, "Linear", false);

    tw1.chain(tw2);

    this.line.angle = this.game.rnd.between(-5,5);

}

Intro.frameCount = 0;
Intro.startTime = 0;

Intro.prototype.update = function() {

    this.line.x = this.line.bx + this.game.rnd.between(-1,1);
    this.line.y = this.line.by + this.game.rnd.between(-1,1);

    ++Intro.frameCount;
    if (++Intro.frameCount == 1) {
        Intro.startTime = game.time.now;
    }

    var delta = game.time.now - Intro.startTime;
    if (this.line.phase == 0 && delta > 1000) {
        this.line.phase = 1;
        this.animateLine();
    }
    else
    if (this.line.phase == 1 && delta > 1200) {
        this.line.phase = 2;
        this.animateLine();
    }
    else
    if (this.line.phase == 2 && delta > 2000) {
        this.line.phase = 3;
        this.animateLine();
    }
    else
    if (this.line.phase == 3 && delta > 2500) {
        this.line.phase = 4;
        this.animateLine();
    }
    else
    if (this.line.phase == 4 && delta > 2200) {
        this.line.phase = 0;
        Intro.startTime = game.time.now;
    }

    //this.line.angle = this.game.rnd.between(-2,2);

};

Intro.prototype.render = function() {
};

Intro.prototype.createGround = function() {

    var PTM = 20; // conversion ratio

    var path = [];
    path.push(0, 610);

    var x1 = 0.0;
    var y1 = 5.0 * Math.cos(x1 / 18.0 * Math.PI);
        
    path.push(x1*PTM);
    path.push(y1*PTM);

    for (var i = 0; i < 600; ++i)
    {
        var x2 = x1 + 1.5;
        var y2 = 5.0 * Math.cos(x2 / 18.0 * Math.PI);

        path.push(x2*PTM);
        path.push(y2*PTM);

        x1 = x2;
        y1 = y2;
    }

    var lx = path[path.length-2];
    var ly = path[path.length-1];

    path.push(lx + 1);
    path.push(ly + 100);

    var b = this.game.add.sprite(-300,450);
    var g = this.game.add.graphics(0,0);
    g.beginFill(0xF7D063);
    g.lineStyle(8, 0xCC8851, 1);
    g.drawPolygon(path);
    g.endFill();
    b.addChild(g);

    return b;

};




