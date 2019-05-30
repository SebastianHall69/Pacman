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
            margin: 3vw;
            color: black;
            padding: 1vw;
        }

        iframe#highScore {
            float: right;
            width: 20vw;
            height: 50vh;
            background-color: black;
            border: none;
        }

        div#signOut {
            float: left;
            width: 10vw;
            padding: 0;
            background-color: black;
        }
        
        iframe#game {
            width: 50vw;
            height: 50vw;
            margin: auto;
            position: fixed;
            right: 25%;
            border: none;
        }
    </style>
    <script>
		function focusGame() {
            document.getElementById("game").focus();
        }
	</script>
</head>

<body>
    <!--High Score area-->
    <iframe id="highScore" class="sideArea" src="Database/highscoreScript.php" ></iframe>
    
    <!--Sign Out Area Here-->
    <div id="signOut" class="sideArea">
        <?php
        if($_SERVER["REQUEST_METHOD"] == "POST") {
            unset($_SESSION["id"]);
            unset($_SESSION["username"]);
            unset($_SESSION["password"]);
            echo "<script> parent.window.location.href='LoginPage'; </script>";
        }
        ?>
        <form method='post' target='_self'>
            <input type='submit' value='Sign Out' />
        </form>
    </div>
    
    <!--Main Game Iframe here-->
    <iframe id="game" src="game/game.php" onload="focusGame();" ></iframe>
	
	
</body>
</html>
