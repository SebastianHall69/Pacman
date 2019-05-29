<?php
//Require database configuration file
require_once('../LoginPage/config.php');

//Declare variables
$server = "localhost";
$username = "root";
$password = "";
$db = "pacman";
$conn = connDB($server, $username, $password, $db);
$sql = "SELECT `user_username`, `highscore_score` FROM `entity_users`, `entity_highscore`, `xref_user_highscore` ORDER BY `entity_highscore`.`highscore_score` DESC LIMIT 10;";

//Run sql query
if($result = $conn->query($sql)) {
    echo "<table><legend>Top Scores</legend>";
    while($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["user_username"] . "</td><td>" . $row["highscore_score"] . "</td></tr>";
    }
    echo "</table>";
}
?>