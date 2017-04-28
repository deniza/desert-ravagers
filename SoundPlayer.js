SoundPlayer = {};

SoundPlayer.init = function(game) {

    var music = game.add.audio('bgmusic', 1, true);
    music.autoplay = false;

    var drums = game.add.sound('drums', 1, true);
    var kick = game.add.audio('kick', 1);
    var snare = game.add.audio('snare', 1);
    var splash = game.add.audio('splash', 1);
    var crash = game.add.audio('crash', 1);

    this.music = music;
    this.drums = drums;
    this.kick = kick;
    this.snare = snare;
    this.splash = splash;
    this.crash = crash;

    console.log("SoundPlayer.init()");
	
}

SoundPlayer.playDrums = function() {

    this.drums.onLoop.add(function(){
        this.drums.play();
    },this);
    this.drums.play();

}

SoundPlayer.stopDrums = function() {

    console.log("stopDrums");
    this.drums.fadeOut(4000);

}

SoundPlayer.playKick = function() {
    this.kick.play();
}

SoundPlayer.playSnare = function() {
    this.snare.play();
}

SoundPlayer.playSplash = function() {
    this.splash.play();
}

SoundPlayer.playCrash = function(fade) {
    
    this.crash.volume = 1;
    this.crash.play();
    if (fade) {
        this.crash.fadeOut(2000);        
    }
    else {        
    }
}

SoundPlayer.playRoll = function() {

    this.playKick();
    game.time.events.add(100, function() {
        this.playSnare();
        game.time.events.add(200, function() {
            this.playCrash(true);
        }, this);
    }, this);


}

SoundPlayer.playBackgroundMusic = function() {

    if (this.music.isDecoded) {
        this.music.fadeIn(1000, true);
    }
    else {
        this.music.onDecoded.add(function() {
            this.music.fadeIn(1000, true);
        }, this);        
    }

    this.music.onLoop.add(function(){
        this.music.play();
    },this);

}

SoundPlayer.stopBackgroundMusic = function() {
    this.music.fadeTo(2000, 0.3);
}