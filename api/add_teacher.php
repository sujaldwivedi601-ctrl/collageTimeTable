<?php
include "../config/database.php";
ob_clean();
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['name'])) {
    $name = $conn->real_escape_string($data['name']);
    $sql = "INSERT INTO teacher (teacher_name) VALUES ('$name')";
    
    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "message" => "Teacher added"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
exit();
?>