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

    //Selected movement type.
    //0 = Chase, 1 = Random
    this.moveType = movetype;

    //Animations
    //Parameters(name,frames,frameRate,loop)
    this.animations.add('up', [animStartIndex, animStartIndex + 1], 10, true);
    this.animations.add('down', [animStartIndex + 2, animStartIndex + 3], 10, true);
    this.animations.add('left', [animStartIndex + 4, animStartIndex + 5], 10, true);
    this.animations.add('right', [animStartIndex + 6, animStartIndex + 7], 10, true);

    game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    this.body.setSize(16, 16, 0, 0);
    this.play('right');

    //If were movetype 0 (Chase) we start outside of the ghost house
    if (this.moveType == 0) {
        this.start();
    }
    //Movetype 1 (Random) starts in the ghosthouse but leaves immediately.
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

Ghost.prototype.checkDistance = function (direction, tileCor, inky, clyde) {
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
    if (inky) {
        //Get position of blinky
        var blinkX = this.mainGame.blinky.x;
        var blinkY = this.mainGame.blinky.y;
        
        //Update new target coordinates
        //New vector location: (x2+(x2-x1), y2+(y2-y1))
        destX = destX + (destX - blinkX);
        destY = destY + (destY - blinkY);
    }
    
    //Only for Clyde
    if (clyde) {
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

Ghost.prototype.leaveHouse = function () {
    var tweenA = this.game.add.tween(this).to({ x: 226, y: 234 }, 1000, Phaser.Easing.Linear.None);
    var tweenB = this.game.add.tween(this).to({ x: 226, y: 184 }, 1000, Phaser.Easing.Linear.None);
    tweenA.chain(tweenB);
    tweenB.onComplete.add(this.start, this);
    tweenA.start();
}

//Determining direction of movement for ghost at start of game
Ghost.prototype.start = function () {
    //Ghost always moves left @ at beginning
    this.move(Phaser.LEFT);
    this.inplay = true;
}

//Red ghost: Blinky
//Movement: Chases pacman directly
Ghost.prototype.moveBlinky = function () {
    //Initialize the variables we need.
    var dist = 10000; //Just set to a high number.
    var dir = null;
    var target = 0; //Target Pacman

    //Check if were at an intersection
    //Then choose the tile with the closest distance to pacman
    if (this.inplay && this.lastIntersection != this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index)) {
        for (var i = 1; i <= 4; i++) {
            if (this.directions[i].index === this.mainGame.moveabletile && this.directions[i] !== this.current && this.opposites[i] != this.current) {
                if (this.checkDistance(i, target, false, false) < dist) { 
                    dir = i;
                    dist = this.checkDistance(i, target, false, false);
                }
                this.lastIntersection = this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index);
            }
        }
        dir != null ? this.checkDirection(dir) : console.log("Pathing Error");
    }
}

//Pink ghost: Pinky
//Movement: Target 4 tiles in front of Pacman
Ghost.prototype.movePinky = function() {
    //Initialize the variables we need.
    var dist = 10000; //Just set to a high number.
    var dir = null;
    var target = 64; //Target 4 tiles in front of pacman

    //Check if were at an intersection
    //Then choose the tile with the closest distance to target
    if (this.inplay && this.lastIntersection != this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index)) {
        for (var i = 1; i <= 4; i++) {
            if (this.directions[i].index === this.mainGame.moveabletile && this.directions[i] !== this.current && this.opposites[i] != this.current) {
                if (this.checkDistance(i, target, false, false) < dist) {
                    dir = i;
                    dist = this.checkDistance(i, target, false, false);
                }
                this.lastIntersection = this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index);
            }
        }
        dir != null ? this.checkDirection(dir) : console.log("Pathing Error");
    }
}

//Blue ghost: Inky
//Movement: Get tile1: 2 tiles away from pacman, get tile2: blinkys tile.
//          Then, double vector from tile2 to tile1 to get tile3(target)                
Ghost.prototype.moveInky = function() {
    //Initialize the variables we need.
    var dist = 10000; //Just set to a high number.
    var dir = null;
    var target = 32; //Target 2 tiles in front of pacman

    //Check if were at an intersection
    //Then choose the tile with the closest distance to target
    if (this.inplay && this.lastIntersection != this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index)) {
        for (var i = 1; i <= 4; i++) {
            if (this.directions[i].index === this.mainGame.moveabletile && this.directions[i] !== this.current && this.opposites[i] != this.current) {
                if (this.checkDistance(i, target, true, false) < dist) {
                    dir = i;
                    dist = this.checkDistance(i, target, true, false);
                }
                this.lastIntersection = this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index);
            }
        }
        dir != null ? this.checkDirection(dir) : console.log("Pathing Error");
    }
}

//Yellow ghost: Clyde
//Movement: Farther than 8 tiles away from Pacman => Same as Blinky
//          Less than 8 tiles away from Pacman => Bottom-left of maze
Ghost.prototype.moveClyde = function () {
    //Init variables
    var dist = 10000; //Just set to a high number.
    var target = 0; //Target pacman

    //Check if were at an intersection
    //Then choose the tile with the closest distance to target
    if (this.inplay && this.lastIntersection != this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index)) {
        for (var i = 1; i <= 4; i++) {
            if (this.directions[i].index === this.mainGame.moveabletile && this.directions[i] !== this.current && this.opposites[i] != this.current) {
                if (this.checkDistance(i, target, false, true) < dist) { 
                    dir = i;
                    dist = this.checkDistance(i, target, false, true);
                }
                this.lastIntersection = this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index);
            }
        }
        dir != null ? this.checkDirection(dir) : console.log("Pathing Error");
    }
    
//    -----Original function for Clyde before rewritten-----
//Ghost.prototype.moveRandom = function () {
//    //Init variables
//    var dirs = new Array();
//
//    //Check if were at an intersection
//    //Then choose a random tile
//    if (this.inplay && this.lastIntersection != this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index)) {
//        for (var i = 1; i <= 4; i++) {
//            if (this.directions[i].index === this.mainGame.moveabletile && this.directions[i] !== this.current && this.opposites[i] != this.current) {
//                dirs.push(i);
//                this.lastIntersection = this.mainGame.map.getTile(this.marker.x, this.marker.y, this.mainGame.layer.index);
//            }
//        }
//        //Choose direction at random
//        var index = Math.floor((Math.random() * dirs.length));
//        dirs[index] != null ? this.checkDirection(dirs[index]) : console.log("Pathing Error");
//    }
}

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

    //Do movement when in bounds
    if (this.inplay && this.x > 16 && this.x < 432) {
        if (this.moveType === 0) {
            this.moveBlinky();
        }
        else if (this.moveType === 1) {
            this.moveClyde();
        }
        else if (this.moveType === 2) {
            this.movePinky();
        }
        else if (this.moveType === 3) {
            this.moveInky();
        }
    }

    if (this.turning !== Phaser.NONE) {
        this.turn();
    }
}