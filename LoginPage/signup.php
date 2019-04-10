<?php
    //Declare variables
    $username = $_POST["signUpUsername"];
    $password1 = $_POST["signUpPassword"];
    $password2 = $_POST["confirmPassword"];
    echo "This page only echoes entered information until we know to do database/SQL stuff<br/>";
    echo "This page will check if a username already exists in server and require new<br/>";
    echo "information to be entered if the username is already taken. If not it will create<br/>";
    echo "the users profile and load the game<br/>";
    echo "Username: " . $username . "<br/>";
    echo "Password: " . $password1 . "<br/>";
    echo "Confirmed Password: " . $password2 . "<br/>";
    echo "Thanks for signing up<br/>";
?>