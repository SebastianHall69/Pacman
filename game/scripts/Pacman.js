Pacman = function (game, mainGame, x, y) {
    //Inherit from Sprite
    Phaser.Sprite.call(this, game, (x * 16) + 8, (y * 16) + 8, 'pacman', 0);
    this.speed = 150;
    this.threshold = 3;
    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();
    this.directions = [null, null, null, null, null];
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.current = Phaser.NONE;
    this.turning = Phaser.NONE;
    
    opTimer = game.time.create(false);  //Timer for pills
    this.invincible = false;            //Invincible state
    this.end = false;                   //Flag - pacman lose life

    this.game = game;
    this.mainGame = mainGame;

    this.anchor.set(0.5);

    this.dead = false;

    //Animations
    this.animations.add('munch', [0, 1, 2, 1], 15, true);
    death = this.animations.add('die', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 10, false);
    death.onComplete.add(function() { this.kill() }, this);

    this.game.physics.arcade.enable(this);
    this.body.setSize(16, 16, 0, 0);

    this.mainGame.cursors = this.mainGame.input.keyboard.createCursorKeys();

    this.play('munch');
    //this.move(Phaser.LEFT);
}

Pacman.prototype = Object.create(Phaser.Sprite.prototype);
Pacman.prototype.constructor = Pacman;

Pacman.prototype.checkKeys = function () {

    if (this.mainGame.cursors.left.isDown && this.current !== Phaser.LEFT) {
        this.checkDirection(Phaser.LEFT);
    }
    else if (this.mainGame.cursors.right.isDown && this.current !== Phaser.RIGHT) {
        this.checkDirection(Phaser.RIGHT);
    }
    else if (this.mainGame.cursors.up.isDown && this.current !== Phaser.UP) {
        this.checkDirection(Phaser.UP);
    }
    else if (this.mainGame.cursors.down.isDown && this.current !== Phaser.DOWN) {
        this.checkDirection(Phaser.DOWN);
    }
    else {
        //So you have to hold the key down to turn a corner
        this.turning = Phaser.NONE;
    }
}

Pacman.prototype.checkDirection = function (turnTo) {
    if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.mainGame.moveabletile) {
        //  Invalid direction if they're already set to turn that way
        //  Or there is no tile there, or the tile isn't index 1 (a floor tile)
        console.log("returning nothing checkdir");
        return;
    }

    //  Check if they want to turn around and can
    if (this.current === this.opposites[turnTo]) {
        this.move(turnTo);
    }
    else {
        this.turning = turnTo;
        this.turnPoint.x = (this.marker.x * this.mainGame.gridsize) + (this.mainGame.gridsize / 2);
        this.turnPoint.y = (this.marker.y * this.mainGame.gridsize) + (this.mainGame.gridsize / 2);
    }
}

Pacman.prototype.move = function (direction) {
    var speed = this.speed;
    if (direction === Phaser.LEFT || direction === Phaser.UP) {
        speed = -speed;
    }

    //Depending on direction apply speed to x velocity or y velocity.
    direction === Phaser.LEFT || direction === Phaser.RIGHT ? this.body.velocity.x = speed : this.body.velocity.y = speed;

    //Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
    this.scale.x = 1;
    this.angle = 0;

    //Rotate pacman's sprite depending on direction
    switch (direction) {
        case Phaser.LEFT:
            this.scale.x = -1;
            break;
        case Phaser.UP:
            this.angle = 270;
            break;
        case Phaser.DOWN:
            this.angle = 90;
            break;
    }

    this.current = direction;
}

Pacman.prototype.turn = function () {
    var cx = Math.floor(this.x);
    var cy = Math.floor(this.y);

    //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (!this.mainGame.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.mainGame.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
        return false;
    }

    //  Grid align before turning
    this.x = this.turnPoint.x;
    this.y = this.turnPoint.y;

    this.body.reset(this.turnPoint.x, this.turnPoint.y);
    this.move(this.turning);
    this.turning = Phaser.NONE;
    return true;
}

Pacman.prototype.resetGame = function () {
    if (!this.end) {    //Flag added to register die function only once
        this.scale.x = 1;
        this.angle = 0;
        this.play('die');
        this.dead = true;
        this.body.velocity.y = 0;
        this.body.velocity.x = 0;
        this.game.time.events.add(Phaser.Timer.SECOND*4, function(){ game.state.restart() }, this);
        this.end = true;
    } 
}

Pacman.prototype.eatDot = function (pacman, dot) {
    dot.kill();
    this.mainGame.score += 10;
    if (this.mainGame.dots.total === 0) {
        this.resetGame();
        //this.mainGame.dots.callAll('revive');
    }
    this.game.sound.play('eat');
}

//When pacman eats energizer/power pill
Pacman.prototype.eatPill = function (pacman, pill) {
    opTimer = game.time.create(false);  //Reset timer if function called again
    opTimer.start();                    //Start timer

    pill.kill();                //Get rid of pill
    this.mainGame.score += 50;  //Increase score counter by 50
    this.invincible = true;     //Invincible state ON
    
    //Ghost status scared ON
    this.mainGame.blinky.scared = true;
    this.mainGame.pinky.scared = true;
    this.mainGame.inky.scared = true;
    this.mainGame.clyde.scared = true;
    //In case player gets more than 1 pill, reset animation
    this.mainGame.blinky.scaredFlash = false;
    this.mainGame.pinky.scaredFlash = false;
    this.mainGame.inky.scaredFlash = false;
    this.mainGame.clyde.scaredFlash = false;
    
    this.game.sound.play('eatPill');    //Play soundFX
}

//Check invincible state, if on, turn off after x seconds
Pacman.prototype.ifInvincible = function() {
    if (this.invincible) {
        var n = 10; //Seconds pacman should be invincible
        if (opTimer.seconds > n) {
            this.invincible = false;    //Pacman is vulnerable again
            this.mainGame.blinky.scared = false;
            this.mainGame.pinky.scared = false;
            this.mainGame.inky.scared = false;
            this.mainGame.clyde.scared = false;
            this.mainGame.blinky.scaredFlash = false;
            this.mainGame.pinky.scaredFlash = false;
            this.mainGame.inky.scaredFlash = false;
            this.mainGame.clyde.scaredFlash = false;
            opTimer.destroy();
        }
        //Ghosts will have animation signaling end of invincible phase
        if (opTimer.seconds > n-2) {
            this.mainGame.blinky.scaredFlash = true;
            this.mainGame.pinky.scaredFlash = true;
            this.mainGame.inky.scaredFlash = true;
            this.mainGame.clyde.scaredFlash = true;
        }
    }
}

Pacman.prototype.die = function () {
    if (!this.end) {    //Flag added to register die function only once
        this.mainGame.lives--;
        console.log("Lives: " + this.mainGame.lives);
        this.scale.x = 1;
        this.angle = 0;
        this.play('die');
        this.game.sound.play('die');    //Sound effect
        this.dead = true;
        this.body.velocity.y = 0;
        this.body.velocity.x = 0;
        
        //Check if no more lives and upload score
        if (this.mainGame.lives < 0) {
            UploadScore(user_id, this.mainGame.score);
            this.mainGame.lives = 3;
            this.mainGame.score = 0;
        }
        
        this.game.time.events.add(Phaser.Timer.SECOND*4, function(){ game.state.restart() }, this);
        this.end = true;
    } 
}

Pacman.prototype.update = function () { 
    //Corridor that goes to other side of the map
    if (this.x < -8) {
        this.x = 452;
    }
    else if (this.x > 452) {
        this.x = -8;
    }
    
    //Check for collisions with tiles and dots.
    this.mainGame.physics.arcade.collide(this, this.mainGame.layer);
    this.mainGame.physics.arcade.overlap(this, this.mainGame.dots, this.eatDot, null, this);
    this.mainGame.physics.arcade.overlap(this, this.mainGame.pills, this.eatPill, null, this);

    //Check if pacman is invincible
    this.ifInvincible();
    
    //Check for collisions with ghosts
    if (!this.invincible) { //If pacman not invincible, dead
        this.mainGame.physics.arcade.overlap(this, this.mainGame.blinky, this.die, null, this);
        this.mainGame.physics.arcade.overlap(this, this.mainGame.pinky, this.die, null, this);
        this.mainGame.physics.arcade.overlap(this, this.mainGame.inky, this.die, null, this);
        this.mainGame.physics.arcade.overlap(this, this.mainGame.clyde, this.die, null, this);
    }
    else {
        //Pacman can eat ghosts
        //If eaten, change ghost animation to only eyes, ghost goes back home
        //Come back out after x seconds
        this.mainGame.physics.arcade.overlap(this, this.mainGame.blinky, this.mainGame.blinky.goHome, null, this.mainGame.blinky);
        this.mainGame.physics.arcade.overlap(this, this.mainGame.pinky, this.mainGame.pinky.goHome, null, this.mainGame.pinky);
        this.mainGame.physics.arcade.overlap(this, this.mainGame.inky, this.mainGame.inky.goHome, null, this.mainGame.inky);
        this.mainGame.physics.arcade.overlap(this, this.mainGame.clyde, this.mainGame.clyde.goHome, null, this.mainGame.clyde);
    }

    this.marker.x = this.mainGame.math.snapToFloor(Math.floor(this.x), this.mainGame.gridsize) / this.mainGame.gridsize;
    this.marker.y = this.mainGame.math.snapToFloor(Math.floor(this.y), this.mainGame.gridsize) / this.mainGame.gridsize;

    //  Update our grid sensors
    this.directions[1] = this.mainGame.map.getTileLeft(this.mainGame.layer.index, this.marker.x, this.marker.y);
    this.directions[2] = this.mainGame.map.getTileRight(this.mainGame.layer.index, this.marker.x, this.marker.y);
    this.directions[3] = this.mainGame.map.getTileAbove(this.mainGame.layer.index, this.marker.x, this.marker.y);
    this.directions[4] = this.mainGame.map.getTileBelow(this.mainGame.layer.index, this.marker.x, this.marker.y);

    //Check for input
    if (this.x > 0 && this.x < 432 && !this.dead) {
        this.checkKeys();
    }

    if (this.turning !== Phaser.NONE) {
        this.turn();
    }
}