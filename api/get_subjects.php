<?php
header('Content-Type: application/json'); 
include "../config/database.php";

if (isset($_GET['class_id'])) {
    $class_id = $_GET['class_id'];
    $sql = "SELECT * FROM subjects WHERE class_id = '$class_id'";
    $result = $conn->query($sql);
    
    $subjects = [];
    while ($row = $result->fetch_assoc()) {
        $subjects[] = $row;
    }
    
    echo json_encode($subjects); 
}
?>