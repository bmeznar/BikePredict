<?php

try {
    // L I V E    A P I

    // $apiEndpoint = 'http://119.12.135.127/gbapi/getData.php?x=50';
    // $apiResponse = str_replace("<br>", "", file_get_contents($apiEndpoint));
    // $data = json_decode(file_get_contents($apiEndpoint), true);

    // if ($data === false) {
    //     throw new Exception('Failed to fetch data from the external API');
    // }
    // if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    //     throw new Exception('Napaka pri pretvrbi JSON');
    // }

    // $numberOfTimestamps = count($data['timestamps']);
    // $data['numberOfTimestamps'] = $numberOfTimestamps;
    

    // T E S T    J S O N
    // $jsonData = file_get_contents('test.json');
    // $data = json_decode($jsonData, true);
    // echo $data;

    // if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    //     throw new Exception('Napaka pri pretvrbi JSON');
    // }
    
    // $numberOfTimestamps = count($data['timestamps']);
    // $data['numberOfTimestamps'] = $numberOfTimestamps;

    // header('Content-Type: application/json');
    // echo json_encode($data);




    $jsonData = file_get_contents('test_data.json');
    $data = json_decode($jsonData, true);

    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500); 
        echo json_encode(['error' => 'Error decoding JSON']);
        exit;
    }
    $numberOfTimestamps = count($data['timestamps']);
    $data['numberOfTimestamps'] = $numberOfTimestamps;
    header('Content-Type: application/json');
    echo json_encode($data);

} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}


// Dummy function to process data (modify based on your requirements)
// function processData($data)
// {
    // Example: Return the first 5 items from the data
    // return array_slice($data, 0, 5);
// }

?>