<?php
try {
    // podatki o postajah
    $apiUrl = 'http://119.12.135.127/gbapi/bikePredict.json';
    $jsonFilePath = './bike_data.json';

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    if ($response === false) {
        echo 'Failed to fetch API station data: ' . curl_error($ch);
        curl_close($ch);
        exit;
    }
    file_put_contents($jsonFilePath, $response);
    echo 'API stations response saved to ' . $jsonFilePath;
    curl_close($ch);

    // napoved koles
    $apiUrl = 'http://119.12.135.127/gbapi/predictor.json';
    $jsonFilePath = './prediction.json';

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    if ($response === false) {
        echo 'Failed to fetch API prediction data: ' . curl_error($ch);
        curl_close($ch);
        exit;
    }
    file_put_contents($jsonFilePath, $response);
    echo 'API prediction response saved to ' . $jsonFilePath;
    curl_close($ch);

} catch(Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
?>