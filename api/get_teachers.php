<?php
header('Content-Type: application/json');
include "../config/database.php";

$sql = "SELECT teacher_name FROM teacher ORDER BY teacher_name ASC";
$result = $conn->query($sql);

$teachers = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $teachers[] = $row['teacher_name'];
    }
}

echo json_encode($teachers);
?>
