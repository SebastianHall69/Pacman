var MainGame = function (game) {
    this.map = null;
    this.layer = null;
    this.pacman = null;

    //Ghosts
    this.blinky = null;
    this.pinky = null;
    this.inky = null;
    this.clyde = null;

    //Tile index for blank/moveable tile
    this.moveabletile = 14;
    this.gridsize = 16;

    //Score
    this.score = 0;
};

MainGame.prototype = {

    init: function () {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        this.physics.startSystem(Phaser.Physics.ARCADE);

    },

    preload: function () {
        
        this.load.image('dot', 'assets/dot.png');
        this.load.image('pill', 'assets/pill.png');
        this.load.image('tiles', 'assets/pacman-tiles.png');
        this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
        this.load.spritesheet('ghosts', 'assets/ghosts.png', 32, 32);
        this.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);
        
        //Load Sound effects
        this.load.audio('die', 'assets/audio/die.mp3');
        this.load.audio('eat', 'assets/audio/eat.mp3');
        this.load.audio('eatPill', 'assets/audio/eat_pill.mp3');
        
    },

    create: function () {

        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman-tiles', 'tiles');

        this.layer = this.map.createLayer('Pacman');

        this.dots = this.add.physicsGroup();
        this.pills = this.add.physicsGroup();

        //Create sprites from the dots (tile index 7), replace original tile with moveabletile(index 14)
        this.map.createFromTiles(7, this.moveabletile, 'dot', this.layer, this.dots);
        this.map.createFromTiles(36, this.moveabletile, 'pill', this.layer, this.pills);

        //  The dots will need to be offset by 6px to put them back in the middle of the grid
        this.dots.setAll('x', 6, false, false, 1);
        this.dots.setAll('y', 6, false, false, 1);
        
        //  Pacman should collide with everything except the safe tile
        this.map.setCollisionByExclusion([this.moveabletile], true, this.layer);

        //Setup ghosts
        this.blinky = new Ghost(game, this, 13.5, 11, 0, 0);
        this.add.existing(this.blinky);
        this.pinky = new Ghost(game, this, 13.5, 14, 8, 1);
        this.add.existing(this.pinky);
        this.inky = new Ghost(game, this, 11.5, 14, 16, 2);
        this.add.existing(this.inky);
        this.clyde = new Ghost(game, this, 15.5, 14, 24, 3);
        this.add.existing(this.clyde);

        //Setup pacman
        //X coordinate should be 13.5 but pacman can't move if changed
        this.pacman = new Pacman(game, this, 13, 23);
        this.add.existing(this.pacman);
        
        //Timer
        this.timer = game.time.create(false);
        this.timer.start(); //Start time
        
        //Add sound effects
        this.add.audio('die', 'assets/audio/die.wav');
        this.add.audio('eat', 'assets/audio/eat.mp3');
        this.add.audio('eatPill', 'assets/audio/eat_pill.mp3');
        
    },

    update: function () {
        document.getElementById("score").innerHTML="Score: " + this.score;
    }
};