<?php
declare(strict_types=1);

function word_counts(string $text): array
{
    $counts = [];
    $words = preg_split('/\s+/', strtolower(trim($text)), -1, PREG_SPLIT_NO_EMPTY);
    foreach ($words as $word) {
        $counts[$word] = ($counts[$word] ?? 0) + 1;
    }
    ksort($counts);
    return $counts;
}

function average(array $numbers): float
{
    if (count($numbers) === 0) {
        return 0.0;
    }
    return array_sum($numbers) / count($numbers);
}

function top_scorers(array $scores, int $limit): array
{
    $names = array_keys($scores);
    usort($names, fn($a, $b) => [$scores[$b], $a] <=> [$scores[$a], $b]);
    return array_slice($names, 0, $limit);
}

function only_adults(array $people): array
{
    $adults = array_filter($people, fn($person) => $person['age'] >= 18);
    return array_values(array_map(fn($person) => $person['name'], $adults));
}
