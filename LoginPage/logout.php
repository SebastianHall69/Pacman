<!DOCTYPE html>
<?php
if(session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>
<html lang="en-US">
<head>
    <meta charset="utf-8">
    <link href="style.css" rel="stylesheet" type="text/css" />
    <title>Logout</title>
    <style>
        .button {
            margin: auto;
        }
    </style>
</head>

<body>
    <?php
    if($_SERVER["REQUEST_METHOD"] == "POST") {
        unset($_SESSION["id"]);
        unset($_SESSION["username"]);
        unset($_SESSION["password"]);
        echo "<script> parent.window.location.href='index.php'; </script>";
    }
    ?>
        <form method='post' target='_self'>
            <input type='submit' value='Sign Out' />
        </form>
</body>
</html>
