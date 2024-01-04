<?php

try {
    // First JSON response
    // $jsonFilePath1 = './bike_data.json';
    $jsonFilePath1 = './bikePredictFinal.json';
    $jsonData1 = file_get_contents($jsonFilePath1);
    $data1 = json_decode($jsonData1, true);

    if ($data1 === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500);
        echo json_encode(['error' => 'Error decoding JSON 1']);
        exit;
    }

    $numberOfTimestamps1 = count($data1['timestamps']);
    $data1['numberOfTimestamps'] = $numberOfTimestamps1;

    // Prepare stations_info array
    $stations_info = $data1;

    // Second JSON response
    $jsonFilePath2 = './prediction.json';
    $jsonData2 = file_get_contents($jsonFilePath2);
    $data2 = json_decode($jsonData2, true);

    if ($data2 === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500);
        echo json_encode(['error' => 'Error decoding JSON 2']);
        exit;
    }

    // Prepare predictions array
    $predictions = $data2;

    // Combine the arrays into a single result array
    $result = [
        'stations_info' => $stations_info,
        'predictions' => $predictions,
    ];

    // Send the final JSON response
    header('Content-Type: application/json');
    echo json_encode($result);

} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}

?>