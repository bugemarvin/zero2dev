use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let numbers: Vec<i64> = input.split_whitespace().map(|t| t.parse().unwrap()).collect();
    println!("count: {}", numbers.len());
    if numbers.is_empty() {
        return;
    }
    let mut sum = 0;
    let mut max = numbers[0];
    for &n in &numbers {
        sum += n;
        if n > max {
            max = n;
        }
    }
    println!("sum: {}", sum);
    println!("max: {}", max);
    println!("average: {:.2}", sum as f64 / numbers.len() as f64);
}
