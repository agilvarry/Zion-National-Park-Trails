<?php
print "I'm about to learn PHP!";
include '/Project2/php/cartoDBProxy.php';
//			^CHANGE THIS TO THE PATH TO YOUR cartodbProxy.php
$queryURL = $_POST['qurl'];
$return = goProxy($queryURL);

echo $return;
?>