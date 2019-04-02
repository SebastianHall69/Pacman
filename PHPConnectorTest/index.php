<?php
// descriptor array
$desc = array(
    0 => array('pipe', 'r'), // 0 is STDIN for process
    1 => array('pipe', 'w'), // 1 is STDOUT for process
    2 => array('file', './tmp/error-output.txt', 'a') // 2 is STDERR for process
);

// command to invoke markup engine
$cmd = "C:\\xampp\\htdocs\\CTest\\NB_CTest\\dist\\Debug\\Cygwin-Windows\\nb_ctest.exe";

// spawn the process
$p = proc_open($cmd, $desc, $pipes);

//Display Into Message
echo fgets($pipes[1]) . "<br>";

//Send input
fwrite($pipes[0], "Test" . PHP_EOL);

// read the output from the engine
echo fgets($pipes[1]) . "<br>";

//Send second input
fwrite($pipes[0], "Test2" . PHP_EOL);

//Output again
echo fgets($pipes[1]) . "<br>";

// all done! Clean up
fclose($pipes[0]);
fclose($pipes[1]);
proc_close($p);

?>