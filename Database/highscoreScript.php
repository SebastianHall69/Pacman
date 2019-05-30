<html>
    <head>
        <meta charset="utf-8" />
        <style>
            table {
                margin: 0;
                margin-top: 30px;
                color: yellow;
                font-size: 1.5em;
            }
            legend {
                color: yellow;
                font-size: 2.5em;
                margin-bottom: 0.75em;
            }
            td {
                padding-right: 40px;
            }
        </style>
    </head>
    
    <body>
        <?php
        //Require database configuration file
        require_once('../LoginPage/config.php');

        //Declare variables
        $server = 'localhost';//Server name
        $username = 'mischie5_public';//Server username
        $password = 'pacmangroup';//Server password
        $db = 'mischie5_pacman';//Database name
        $conn = connDB($server, $username, $password, $db);
        $sql = "SELECT `entity_users`.`user_username`, `entity_highscore`.`highscore_score` FROM `mischie5_pacman`.`xref_user_highscore` AS `xref_user_highscore`, `mischie5_pacman`.`entity_users` AS `entity_users`, `mischie5_pacman`.`entity_highscore` AS `entity_highscore` WHERE `xref_user_highscore`.`user_id` = `entity_users`.`user_id` AND `xref_user_highscore`.`highscore_id` = `entity_highscore`.`highscore_id` ORDER BY `entity_highscore`.`highscore_score` DESC LIMIT 10";

        //Run sql query
        if($result = $conn->query($sql)) {
            echo "<table><legend>Top Scores</legend>";
            while($row = $result->fetch_assoc()) {
                echo "<tr><td>" . $row["user_username"] . "</td><td>" . $row["highscore_score"] . "</td></tr>";
            }
            echo "</table>";
        } else {
            echo $conn->error;
        }
        ?>
    </body>
</html>

