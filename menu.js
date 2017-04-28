var line1;
var line2;

var Menu = function(game) {
    this.game = game;
};

Menu.prototype.preload = function() {
};

Menu.prototype.create = function() {

    this.ground = this.createGround();
    this.doll = this.createDoll();

    this.ground.alpha = 0;
    var tw1 = game.add.tween(this.ground);
    tw1.to({ alpha: 1.0 }, 1000, "Linear", true);

    this.doll.alpha = 0;
    var tw2 = game.add.tween(this.doll);
    tw2.to({ alpha: 1.0 }, 1000, "Linear", true);

    var t = game.add.bitmapText(250, 150, 'arabian', 'Desert Ravagers', 48);

    line1 = this.createText("a game by deniz aydınoğlu", 460, 275, 20);
    line2 = this.createText("developed for super game pack I", 400, 300, 24);

    line2.fill = '#998851';
    line1.fill = '#555555';

    var link = game.add.text(0, 0, "http://deniz.itch.io");
    link.anchor.set(0,0);
    link.align = 'left';
    link.font = 'Arial';
    link.fontWeight = 'bold';
    link.fontSize = 12;
    link.fill = '#670000';
    link.alpha = 0.5;
    link.fixedToCamera = true;
    link.cameraOffset.setTo(2,585);
    link.visible = true;

    this.savedGameRecord = JSON.parse(saved_data);
    this.savedGameRecordIndex = 0;    

    for (var i=0;i<this.savedGameRecord.length;++i) {
        var r = this.savedGameRecord[i];
        r.x = Math.round(r.x * 100) / 100;
        r.y = Math.round(r.y * 100) / 100;
        r.rotation = Math.round(r.rotation * 1000) / 1000;
    }

    this.gameStartTime = game.time.now;

    game.time.events.add(750, function() {
        game.input.keyboard.addCallbacks(this, null, function() {
            game.input.keyboard.addCallbacks(this, null, null, null);
            this.game.state.start("MyGame");
        }, null);
    });

};

Menu.prototype.createText = function(text, x, y, size) {

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

Menu.prototype.update = function() {

    this.updateBeacon();

    line1.x = 460 + this.game.rnd.between(-1,1);
    line1.y = 275 + this.game.rnd.between(-1,1);

    line2.x = 400 + this.game.rnd.between(-1,1);
    line2.y = 300 + this.game.rnd.between(-1,1);


};

Menu.prototype.updateBeacon = function() {

    var ct = game.time.now - this.gameStartTime;

    if (this.savedGameRecord.length > 0) {
        for (var i=this.savedGameRecordIndex;i<this.savedGameRecord.length;++i) {
            
            var rec = this.savedGameRecord[i];
            if (rec.time >= ct) {

                this.savedGameRecordIndex = i+1;
                this.doll.x = rec.x;
                this.doll.y = rec.y;
                this.doll.rotation = rec.rotation;

                break;
            }
        }

    }

    if (this.savedGameRecordIndex == 1500) {

        var tw1 = game.add.tween(this.doll);
        tw1.to({ alpha: 0 }, 250, "Linear", true);
        tw1.onComplete.add(function(){

            this.savedGameRecordIndex = 0;
            this.gameStartTime = game.time.now;

            var tw2 = game.add.tween(this.doll);
            tw2.to({ alpha: 1.0 }, 250, "Linear", true);
            
            //var out = JSON.stringify(this.savedGameRecord);
            //window.open('data:text/csv,' + encodeURIComponent(out));

        }, this);

    }

}

Menu.prototype.render = function() {
};

Menu.prototype.createGround = function() {

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

Menu.prototype.createSpriteRect = function(x,y,w,h,color) {

    var bodySprite = game.add.sprite(x,y);
    var g = game.add.graphics(0,0);
    g.beginFill(color);
    g.drawRect(-w*0.5, -h*0.5, w, h);
    g.endFill();
    bodySprite.addChild(g);
    
    return bodySprite;

};


Menu.prototype.createDoll = function() {

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
        
        return arm;

    }


    var width = 50;
    var height = 5;
    var PTM = 1;

    var truckSprite = this.createSpriteRect(350,350,width,height,0xdd2d2d);    
    var dollBodySprite = this.createSpriteRect(0,-22,15,30,0x777777);     
    
    var colors = [0x58ADF7,0xaa0000,0x7CA832];
    var color = game.rnd.between(0,2);

    var rightArm = createArm(10,-22,15,6,colors[color],true);
    var leftArm = createArm(-11,-22,15,6,colors[color],false);

    rightArm.angle = 10;
    leftArm.angle = -10;

    truckSprite.addChild(rightArm);
    truckSprite.addChild(leftArm);

    truckSprite.addChild(dollBodySprite);

    var nomad = game.add.sprite(0,0,'nomad',color);
    nomad.anchor.setTo(0.5,0.5);
    dollBodySprite.addChild(nomad);

    return truckSprite;

};





