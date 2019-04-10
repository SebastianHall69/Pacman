<?php
    //Declare variables
    $username = $_POST["loginUsername"];
    $password = $_POST["loginPassword"];
    echo "This page only echoes entered information until we know to do database/SQL stuff<br/>";
    echo "It will check for existing and matching login info on server and either load the<br/>";
    echo "game or it will require the user to enter information again if a login is not found<br/>";
    echo "Username: " . $username . "<br/>";
    echo "Password: " . $password . "<br/>";
?>