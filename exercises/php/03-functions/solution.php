<?php
declare(strict_types=1);

function grade(int $score): string
{
    return '';
}

function initials(string $fullName): string
{
    return '';
}

function apply_discount(float $price, float $percent = 10.0): float
{
    return $price;
}

function make_counter(int $start = 0): callable
{
    return fn() => $start;
}

function sum_all(int ...$numbers): int
{
    return 0;
}
