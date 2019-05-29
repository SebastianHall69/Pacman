<?php
function connDB($server, $username, $password, $db){
    //Create database connection
    $conn = new mysqli($server, $username, $password, $db);
    
    //Check for errors and return connection or echo failure
    if($conn->connect_error) {//If connection error echo
        echo "Connection Failed: " . $conn->connect_error;
    } else {//Else return connection
        return $conn;
    }
}
?>