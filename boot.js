var Boot = function(game) {
    this.game = game;    
};

Boot.prototype.preload = function() {

    game.load.bitmapFont('arabian', 'assets/font.png', 'assets/font.fnt');


};

Boot.prototype.create = function() {

    this.game.stage.backgroundColor = 0xCCCA63;
    this.game.stage.smoothed = true;
    this.game.time.advancedTiming = true;
    
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();

    this.game.world.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);    

	var arPreventedKeys = [
            Phaser.Keyboard.SPACEBAR,
            ,Phaser.Keyboard.UP
            ,Phaser.Keyboard.DOWN
            ,Phaser.Keyboard.LEFT
            ,Phaser.Keyboard.RIGHT
    ];
    game.input.keyboard.addKeyCapture(arPreventedKeys);

    game.state.start("Preload");

};