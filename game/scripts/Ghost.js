Ghost = function (game, mainGame, x, y, animStartIndex, movetype) {
    //Inherit from Sprite
    Phaser.Sprite.call(this, game, (x * 16) + 8, (y * 16) + 8, 'ghosts', animStartIndex);
    this.speed = 150;
    this.threshold = 3;
    this.inplay = false;
    this.lastIntersection = null;
    this.game = game;
    this.distanceToPac = 0;
    this.mainGame = mainGame;
    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();
    this.directions = [null, null, null, null, null];
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.current = Phaser.NONE;
    this.turning = Phaser.NONE;
    this.dead = false;
    
    this.timerGhost = game.time.create(false);  //Timer for ghost after being eaten
    this.scared = false;                        //Scared status
    this.scaredFlash = false;                   //Scared status just before wearing off

    //Selected movement type.
    this.moveType = movetype;

    //Animations
    //Parameters(name,frames,frameRate,loop)
    this.animations.add('up', [animStartIndex, animStartIndex + 1], 10, true);
    this.animations.add('down', [animStartIndex + 2, animStartIndex + 3], 10, true);
    this.animations.add('left', [animStartIndex + 4, animStartIndex + 5], 10, true);
    this.animations.add('right', [animStartIndex + 6, animStartIndex + 7], 10, true);
    this.animations.add('scare', [32,33], 10, true);         //Blue       scare animation
    this.animations.add('scare2', [32,33,34,35], 10, true);  //Blue+white scare animation
    this.animations.add('dead', [36], 10, true);
    game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    this.body.setSize(16, 16, 0, 0);
    this.play('right');

    //Movetype 0 starts outside of the ghost house
    if (this.moveType == 0) {
        this.start();
    }
    //Movetype 1 starts in the ghosthouse but leaves immediately.
    else if (this.moveType == 1) {
        this.leaveHouse();
    }
    else if (this.moveType == 2) {
        //Wait 5 seconds before leaving house
        game.time.events.add(Phaser.Timer.SECOND * 5, this.leaveHouse, this);
    }
    else if (this.moveType == 3) {
        //Wait 10 seconds before leaving house
        game.time.events.add(Phaser.Timer.SECOND * 10, this.leaveHouse, this);
    }
}

Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.checkDirection = function (turnTo) {
    if (this.directions[turnTo] === null || this.directions[turnTo].index !== this.mainGame.moveabletile) {
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

Ghost.prototype.move = function (direction) {
    var speed = this.speed;
    if (direction === Phaser.LEFT || direction === Phaser.UP) {
        speed = -speed;
    }

    //Depending on direction apply speed to x velocity or y velocity.
    direction === Phaser.LEFT || direction === Phaser.RIGHT ? this.body.velocity.x = speed : this.body.velocity.y = speed;

    //Play animation depending on direction
    if (!this.scared && !this.dead) {
        switch (direction) {
            case Phaser.LEFT:
                this.play('left');
                break;
            case Phaser.RIGHT:
                this.play('right');
                break;
            case Phaser.UP:
                this.play('up');
                break;
            case Phaser.DOWN:
                this.play('down');
                break;
        }
    }
    
    this.current = direction;
}

Ghost.prototype.turn = function () {
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

Ghost.prototype.checkDistance = function (direction, tileCor) {
    //Destination points for ghost (x,y)
    var destX, destY;
    
    //Get tile coordinates depending on direction
    //If Pacman is facing left
    if (this.mainGame.pacman.current === Phaser.LEFT) {
        destX = this.mainGame.pacman.x - tileCor;
        destY = this.mainGame.pacman.y;
    }
    //If Pacman is facing right
    else if (this.mainGame.pacman.current === Phaser.RIGHT || this.mainGame.pacman.current === Phaser.NONE) {
        destX = this.mainGame.pacman.x + tileCor;
        destY = this.mainGame.pacman.y;
    }
    //If Pacman is facing up
    else if (this.mainGame.pacman.current === Phaser.UP) {
        destX = this.mainGame.pacman.x;
        destY = this.mainGame.pacman.y - tileCor;
    }
    //If Pacman is facing down
    else if (this.mainGame.pacman.current === Phaser.DOWN) {
        destX = this.mainGame.pacman.x;
        destY = this.mainGame.pacman.y + tileCor;
    }
    
    //Only for Inky
    if (this.moveType === 2) {
        //Get position of blinky
        var blinkX = this.mainGame.blinky.x;
        var blinkY = this.mainGame.blinky.y;
        
        //Update new target coordinates: (x2+(x2-x1), y2+(y2-y1))
        destX = destX + (destX - blinkX);
        destY = destY + (destY - blinkY);
    }
    
    //Only for Clyde
    if (this.moveType === 3) {
        //Calculate distance between Clyde and Pacman
        var distCtoP = Phaser.Math.distance(this.mainGame.clyde.x, this.mainGame.clyde.y, this.mainGame.pacman.x, this.mainGame.pacman.x);
        //If more than 8 tiles away, movement will be similar to Blinky (default)
        //If less than 8 tiles away, movement will be towards bottom-left corner (24, 472)
        if (distCtoP < 128) {
            //Target tile is 1 tile left, 3 tiles down
            destX = 8;
            destY = 520;
        }
    }
    
    return Phaser.Math.distance(this.directions[direction].worldX, this.directions[direction].worldY, destX, destY); 
}

Ghost.prototype.leaveHouse = function() {
    this.speed = 150;    //Assign speed to normal
    
    var tweenA = this.game.add.tween(this).to({ x: 224, y: 232 }, 1000, Phaser.Easing.Linear.None);
    var tweenB = this.game.add.tween(this).to({ x: 224, y: 184 }, 1000, Phaser.Easing.Linear.None);
    tweenA.chain(tweenB);
    tweenB.onComplete.add(this.start, this);
    tweenA.start();
}

//Determining direction of movement for ghost at start of game
Ghost.prototype.start = function() {
    //Ghost always moves left @ at beginning
    this.move(Phaser.LEFT);
    this.inplay = true;
}

//Red ghost: Blinky
//Movement: Chases pacman directly
Ghost.prototype.moveBlinky = function() {
    var target = 0; //Target Pacman
    this.chase(target);
}

//Pink ghost: Pinky
//Movement: Target 4 tiles in front of Pacman
Ghost.prototype.movePinky = function() {
    var target = 64; //Target 4 tiles in front of pacman
    this.chase(target);
}

//Blue ghost: Inky
//Movement: Get tile1: 2 tiles away from pacman, get tile2: blinkys tile.
//          Then, double vector from tile2 to tile1 to get tile3(target)                
Ghost.prototype.moveInky = function() {
    var target = 32; //Target 2 tiles in front of pacman
    this.chase(target);
}

//Yellow ghost: Clyde
//Movement: Farther than 8 tiles away from Pacman => Same as Blinky
//          Less than 8 tiles away from Pacman => Bottom-left of maze
Ghost.prototype.moveClyde = function () {
    var target = 0; //Target pacman
    this.chase(target);
}

Ghost.prototype.target = function(x,y) {
    //Init variables
    var dist = 10000; //Just set to a high number.
    var dir = null;
    
    //Check if were at an intersection
    //Then choose the tile with the closest distance to target
    if (this.inplay && this.lastIntersection != this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index)) {
        for (var i = 1; i <= 4; i++) {
            if (this.directions[i].index === this.mainGame.moveabletile && this.directions[i] !== this.current && this.opposites[i] != this.current) {
                if (Phaser.Math.distance(this.directions[i].worldX, this.directions[i].worldY, x, y) < dist) { 
                    dir = i;
                    dist = Phaser.Math.distance(this.directions[i].worldX, this.directions[i].worldY, x, y); 
                }
                this.lastIntersection = this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index);
            }
        }
        dir != null ? this.checkDirection(dir) : console.log("Pathing Error");
    }
}

Ghost.prototype.chase = function(target) {
    //Init variables
    var dist = 10000; //Just set to a high number.
    var dir = null;
    
    //Check if were at an intersection
    //Then choose the tile with the closest distance to target
    if (this.inplay && this.lastIntersection != this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index)) {
        for (var i = 1; i <= 4; i++) {
            if (this.directions[i].index === this.mainGame.moveabletile && this.directions[i] !== this.current && this.opposites[i] != this.current) {
                if (this.checkDistance(i, target) < dist) { 
                    dir = i;
                    dist = this.checkDistance(i, target);
                }
                this.lastIntersection = this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index);
            }
        }
        dir != null ? this.checkDirection(dir) : console.log("Pathing Error");
    }
}

//Scatter movement for all ghosts 
Ghost.prototype.scatter = function() {
    var x, y; //Target destinations
    
    //Upper right corner for Blinky
    if (this.moveType === 0){
        x = 392;
        y = -40;
    }
    //Top left corner for Pinky
    else if (this.moveType === 1) {
        x = 56;
        y = -40;
    }
    //Bottom right corner for Inky
    else if (this.moveType === 2) {
        x = 440;
        y = 520;
    }
    //Bottom left corner for Clyde
    else if (this.moveType === 3) {
        x = 8;
        y = 520;
    }
    
    this.target(x,y);
}

//Movement phases (scatter+chase) and their timing
Ghost.prototype.movement = function() {
    this.speed = 150;
    
    var time = this.mainGame.timer.seconds; //Get time
    
    if (time >= 0 && time <= 7) {           //First 7 seconds, scatter
        this.scatter();
    }
    else if (time > 7 && time <= 27) {      //Next 20 seconds, chase
        this.moveAll();
    }
    else if (time > 27 && time <= 34) {     //Next 7 seconds, scatter
        this.scatter();
    }
    else if (time > 34 && time <= 54) {     //Next 20 seconds, chase
        this.moveAll();
    }
    else if (time > 54 && time <= 59) {     //Next 5 seconds, scatter
        this.scatter();
    }
    else if (time > 59 && time <= 79) {     //Next 20 seconds, chase
        this.moveAll();
    }
    else if (time > 79 && time <= 84) {     //Next 5 seconds, scatter
        this.scatter();
    }
    else {                                  //Permanent scatter
        this.moveAll();
    }  
}

//To specify specific ghost movement
Ghost.prototype.moveAll = function() {
    if (this.moveType === 0) {
        this.moveBlinky();
    }
    else if (this.moveType === 1) {
        this.movePinky();
    }
    else if (this.moveType === 2) {
        this.moveInky();
    }
    else if (this.moveType === 3) {
        this.moveClyde();
    }
}

//Movement of ghost when frightened (slower speed, random movement)
Ghost.prototype.scareMove = function() {
    //Slow speed of ghost
    if (!this.dead) {
        this.speed = 50;
    }
    
    //Init variables
    var dirs = new Array();

    //Check if were at an intersection
    //Then choose a random tile
    if (this.inplay && this.lastIntersection !== this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index)) {
        for (var i = 1; i <= 4; i++) {
            if (this.directions[i].index === this.mainGame.moveabletile && this.directions[i] !== this.current && this.opposites[i] !== this.current) {
                dirs.push(i);
                this.lastIntersection = this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index);
            }
        }
        //Choose direction at random
        var index = Math.floor((Math.random() * dirs.length));
        dirs[index] !== null ? this.checkDirection(dirs[index]) : console.log("Pathing Error");
    }
}

//When pacman eats ghost, change settings
Ghost.prototype.goHome = function() {
    if (this.dead === false) {
        this.animations.play("dead");       //Change sprite to 'dead'
        this.game.sound.play('eatGhost');   //Play soundFX
        this.mainGame.score += 200;         //Increase score counter
        
        this.scared = false;
        this.dead = true;
        this.speed = 300;
    }
};

//Ghost movement back home after being eaten
Ghost.prototype.moveToHome = function() {
    var homeX = 227;    //X-coordinate1 front of home
    var homeX2 = 226;   //X-coordinate2 front of home
    var homeY = 184;    //Y-coordinate  front of home
    
    //Go back home, target home tile
    this.target(homeX2,homeY);
    this.target(homeX,homeY);

    //When ghost reaches coordinate in front of home, tween inside
    if ( (this.x === homeX || this.x === homeX2) && this.y===homeY) {        
        //Moving animation in pen
        var tweenA = this.game.add.tween(this).to({ x: 225, y: 232 }, 1000, Phaser.Easing.Linear.None);
        if (this.moveType === 0 || this.moveType === 1) {
            var tweenB = this.game.add.tween(this).to({ x: 226, y: 232 }, 1000, Phaser.Easing.Linear.None);  
            tweenA.chain(tweenB);
        }
        else if (this.moveType === 2) {
            var tweenB = this.game.add.tween(this).to({ x: 192, y: 232 }, 1000, Phaser.Easing.Linear.None);
            tweenA.chain(tweenB);
        }
        else if (this.moveType === 3) {
            var tweenB = this.game.add.tween(this).to({ x: 256, y: 232 }, 1000, Phaser.Easing.Linear.None);
            tweenA.chain(tweenB);
        }
        
        this.speed = 0; //Stop ghost from moving
        tweenA.onComplete.add(this.resetDeath, this);
        tweenA.start();
    }
};

Ghost.prototype.resetDeath = function() {
    console.log("Reset");
    this.play('up');

    this.inplay = false;
    this.dead = false;

    //Amount of time to wait until ghost comes outside of home after dying
    this.mainGame.time.events.add(Phaser.Timer.SECOND * 5, this.leaveHouse, this);
};

//When ghost is scared
Ghost.prototype.ifScared = function() {
    //Scared animations
    if (this.scared && !this.dead) {
        if (!this.scaredFlash) {
            this.animations.play('scare');
        }
        else {
            this.animations.play('scare2'); //Signals end of Pacman invincibility
        }
    }
};

Ghost.prototype.update = function () {
    game.physics.arcade.collide(this, this.mainGame.layer);

    //Corridor that goes to other side of the map
    if (this.x < -8) {
        this.x = 452;
    }
    else if (this.x > 452) {
        this.x = -8;
    }

    this.distanceToPac = Phaser.Math.distance(this.x, this.y, this.mainGame.pacman.x, this.mainGame.pacman.y)

    this.marker.x = this.mainGame.math.snapToFloor(Math.floor(this.x), this.mainGame.gridsize) / this.mainGame.gridsize;
    this.marker.y = this.mainGame.math.snapToFloor(Math.floor(this.y), this.mainGame.gridsize) / this.mainGame.gridsize;

    //Update our grid sensors
    this.directions[1] = this.mainGame.map.getTileLeft(this.mainGame.layer.index, this.marker.x, this.marker.y);
    this.directions[2] = this.mainGame.map.getTileRight(this.mainGame.layer.index, this.marker.x, this.marker.y);
    this.directions[3] = this.mainGame.map.getTileAbove(this.mainGame.layer.index, this.marker.x, this.marker.y);
    this.directions[4] = this.mainGame.map.getTileBelow(this.mainGame.layer.index, this.marker.x, this.marker.y);

    //Check if ghost is scared
    this.ifScared();
    
    //MOVEMENT SETTINGS
    //Do movement when in bounds
    if (this.inplay && this.x > 16 && this.x < 432) {    
        if (this.scared) {
            this.scareMove();
        } 
        else if (this.dead) {
            this.moveToHome();
        }
        else {
            this.movement();    //Includes all phases
        }
    }

    if (this.turning !== Phaser.NONE) {
        this.turn();
    }

    //game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32);
};