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
        this.load.image('tiles', 'assets/pacman-tiles.png');
        this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
        this.load.spritesheet('ghosts', 'assets/ghosts.png', 32, 32);
        this.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);
    },

    create: function () {

        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman-tiles', 'tiles');

        this.layer = this.map.createLayer('Pacman');

        this.dots = this.add.physicsGroup();

        //Create sprites from the dots (tile index 7), replace original tile with moveabletile(index 14)
        this.map.createFromTiles(7, this.moveabletile, 'dot', this.layer, this.dots);

        //  The dots will need to be offset by 6px to put them back in the middle of the grid
        this.dots.setAll('x', 6, false, false, 1);
        this.dots.setAll('y', 6, false, false, 1);

        //  Pacman should collide with everything except the safe tile
        this.map.setCollisionByExclusion([this.moveabletile], true, this.layer);

        //Setup ghosts
        this.blinky = new Ghost(game, this, 13.5, 11, 0, 0);
        this.add.existing(this.blinky);
        this.clyde = new Ghost(game, this, 11.5, 14, 24, 1);
        this.add.existing(this.clyde);

        //Setup pacman
        this.pacman = new Pacman(game, this, 14, 17);
        this.add.existing(this.pacman);
    },

    update: function () {
        document.getElementById("score").innerHTML="Score: " + this.score;
    }
};