<!DOCTYPE HTML>
<?php if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>
<html>
<head>
    <title>Pacman</title>
    <meta charset="utf-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #000;
            color: white;
            text-align: center;
        }
        div {
            width:85vh;
            height:100%;
            background-size:cover;
            overflow:hidden;
            margin-left: auto ;
            margin-right: auto ;
        }
    </style>
    <script src="//cdn.jsdelivr.net/phaser/2.2.2/phaser.min.js"></script>
    <script src="scripts/Pacman.js"></script>
    <script src="scripts/Ghost.js"></script>
    <script src="scripts/MainGame.js"></script>
</head>
<body>

    <script type="text/javascript">
    var user_id='<?php echo $_SESSION['id'];?>';
    console.log("User ID: " + user_id);

    var game = new Phaser.Game(448, 496, Phaser.AUTO, 'pacman');
    game.state.add('Game', MainGame, true);

    </script>

<p id="score">This text will change</p>
<div id="pacman"></div>

</body>
</html>