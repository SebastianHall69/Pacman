/*Sets up connection with database*/
<?php
    define('DB_SEVER', 'localhost:3036');   /*Server*/
    define('DB_USERNAME', 'root');          /*User*/
    define('DB_PASSWORD', '');  /*Password*/
    define('DB_DATABASE', 'database');      //*Database name*/
    $db = mysqlil_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_DATABASE);    /*Connects to database*/
?>