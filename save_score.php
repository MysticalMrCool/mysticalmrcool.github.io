<?php
$leaderboardFile = 'leaderboard.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $playerName = $_POST['playerName'];
    $score = $_POST['score'];

    // Load existing leaderboard data from leaderboard.json
    $leaderboard = [];
    if (file_exists($leaderboardFile)) {
        $leaderboardData = file_get_contents($leaderboardFile);
        $leaderboard = json_decode($leaderboardData, true);
    }

    // Create a new entry with the player's name and score
    $newEntry = [
        'name' => $playerName,
        'score' => $score
    ];

    // Add the new entry to the leaderboard
    $leaderboard[] = $newEntry;

    // Sort the leaderboard in descending order based on the score
    usort($leaderboard, function($a, $b) {
        return $b['score'] - $a['score'];
    });

    // Keep only the top 10 entries
    $leaderboard = array_slice($leaderboard, 0, 10);

    // Save the updated leaderboard data to leaderboard.json
    file_put_contents($leaderboardFile, json_encode($leaderboard));

    echo 'Score saved successfully';
} else {
    echo 'Invalid request method';
}
?>