use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let numbers: Vec<i64> = input.split_whitespace().map(|t| t.parse().unwrap()).collect();
    // numbers is a Vec<i64>: use numbers.len() and a for loop
    println!("count: {}", numbers.len());
}
