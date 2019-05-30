<?php
$servername = 'localhost';//Server name
$username = 'mischie5_public';//Server username
$password = 'pacmangroup';//Server password
$dbname = 'mischie5_pacman';//Database name
$loginsuccess = false;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$score = $_GET['score'];
$userid = $_GET['userid'];

$sql = "INSERT INTO `entity_highscore` (highscore_score) VALUES ($score);";

if ($conn->query($sql) === TRUE) {
    echo "New score added successfully";
    
    $highscore_id = $conn->insert_id;
    
    $sql = "INSERT INTO `xref_user_highscore` (user_id, highscore_id) VALUES (" . $userid . ", $highscore_id);";
    
    if ($conn->query($sql) === TRUE) { 
        echo "Score Linked Successfully";
    }
    else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>