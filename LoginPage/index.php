<!DOCTYPE html>
<?php
    //include("config.php");    //Establishes connection to database
    session_start();            //Starts session
    
    //If info has been sent through post to server
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        
        //If login was chosen
        if(isSet($_POST["loginUsername"])) {
            echo "Login chosen<br/>";
            //Retrieves username and password through post
            $username = $_POST["loginUsername"];
            $password = $_POST["loginPassword"];
            
            //Validate through database with sql
            
            //If successul
                //Set username and password in session
                $_SESSION["loginUsername"] = $username;
                $_SESSION["loginPassword"] = $password;
            
        }//If sign up is chosen
        else if(isSet($_POST["signUpUsername"])) {
            echo "Signup chosen<br/>";
        }
        
        //If login information is valid send to page
        header("location: login.php");//Sends to php page after login
    }
?>
<html lang="en-US">

<head>
    <meta charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="style.css" />
    <script src="login.js"></script>
    <Title>Login or Sign Up</title>
</head>

<body>
    <!--Page Logo-->
    <div id="logoDiv">
        <img id="logo" src="logo.png" alt="Pac Man Logo" />
    </div>
    
    <!--Main page content-->
    <div id="main">
        
        <!--Login or Sign Up Buttons-->
        <div>
            <input type="button" id="login" value="User Login" onclick="showLogin();"/>
            <input type="button" id="signUp" value="Sign Up" onclick="showSignUp();"/>
        </div>

        <!--Login Form-->
        <div id="loginForm">
            <form method="post" target="_self" name="loginForm" onsubmit="return validateLogin()">
                <label for="loginUsername">Username</label><br/>
                <input type="text" id="loginUsername" name="loginUsername" title="1-16 char alphanumerical" />
                <span class="errMsg">&nbsp;</span><br/>
                <label for="loginPassword">Password</label><br/>
                <input type="password" id="loginPassword" name="loginPassword" title="4-16 char alphanumerical" />
                <span class="errMsg">&nbsp;</span><br/>
                <input type="submit" value="Login" /><br/>
            </form>
        </div>

        <!--Sign Up Form-->
        <div id="signUpForm" >
            <form method="post" target="_self" name="signUpForm" onsubmit="return validateSignUp()">
                <label for="signUpUsername">Username</label><br/>
                <input type="text" id="signUpUsername" name="signUpUsername" title="1-16 char alphanumerical" />
                <span class="errMsg">&nbsp;</span><br/>
                <label for="signUpPassword">Password</label><br/>
                <input type="text" id="signUpPassword" name="signUpPassword" title="4-16 char alphanumerical" />
                <span class="errMsg">&nbsp;</span><br/>
                <label for="confirmPassword">Confirm Password</label><br/>
                <input type="text" id="confirmPassword" name="confirmPassword" title="Same as above" /><br/><br/>
                <input type="submit" value="Sign Up" /><br/>
            </form>
        </div>
    </div>
    
    <!--Animated banner-->
    <img id="banner" src="pacbanner.gif" alt="Animated Pacman" />
        
</body>

</html>