pub fn sum_of_even_squares(numbers: &[i64]) -> i64 {
    numbers.iter().filter(|n| *n % 2 == 0).map(|n| n * n).sum()
}

pub fn initials(names: &[&str]) -> String {
    names
        .iter()
        .filter_map(|name| name.chars().next())
        .flat_map(|c| c.to_uppercase())
        .collect()
}

pub fn long_words(text: &str, min: usize) -> Vec<String> {
    text.split_whitespace()
        .filter(|word| word.chars().count() >= min)
        .map(|word| word.to_lowercase())
        .collect()
}

pub fn apply_n<F: Fn(i64) -> i64>(f: F, times: u32, start: i64) -> i64 {
    (0..times).fold(start, |value, _| f(value))
}

pub fn running_total(numbers: &[i64]) -> Vec<i64> {
    let mut sum = 0;
    numbers
        .iter()
        .map(|n| {
            sum += n;
            sum
        })
        .collect()
}
