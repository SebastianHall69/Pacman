<!DOCTYPE html>
<?php
if(session_status() == PHP_SESSION_NONE) {
    session_start();
}
if(!isSet($_SESSION["username"])) {
    header("location:LoginPage/");
}
?>
<html lang="en-US">
<head>
    <meta charset="utf-8">
    <title>Pacman</title>
    <link href="LoginPage/style.css" rel="stylesheet" type="text/css">
    <style>
        .sideArea {
            background-color: white;
            margin: 5vw;
            color: black;
            padding: 1vw;
        }
        
        #highScore {
            float: right;
            width: 17vw;
        }
        
        #signOut {
            float: left;
            width: 7vw;
        }
        
        #game {
            width: 50vw;
            height: 50vw;
            margin: auto;
        }
    </style>
</head>

<body>
    <!--High Score area-->
    <iframe id="highScore" class="sideArea" src="Database/highscoreScript.php" ></iframe>
    
    <!--Sign Out Area Here-->
    <div id="signOut" class="sideArea"><p>Sign Out Here</p></div>
    
    <!--Main Game Iframe here-->
    <iframe id="game" src=game/game.html></iframe>
</body>
</html>
