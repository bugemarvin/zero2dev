<?php
declare(strict_types=1);

function grade(int $score): string
{
    if ($score < 0 || $score > 100) {
        throw new InvalidArgumentException('score out of range');
    }
    return match (true) {
        $score >= 90 => 'A',
        $score >= 80 => 'B',
        $score >= 70 => 'C',
        default => 'F',
    };
}

function initials(string $fullName): string
{
    $words = preg_split('/\s+/', trim($fullName), -1, PREG_SPLIT_NO_EMPTY);
    return implode('', array_map(fn(string $word) => strtoupper($word[0]), $words));
}

function apply_discount(float $price, float $percent = 10.0): float
{
    return round($price * (1 - $percent / 100), 2);
}

function make_counter(int $start = 0): callable
{
    $next = $start;
    return function () use (&$next): int {
        return $next++;
    };
}

function sum_all(int ...$numbers): int
{
    return array_sum($numbers);
}
