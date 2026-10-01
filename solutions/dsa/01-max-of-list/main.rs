use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let mut numbers = input.split_whitespace().map(|t| t.parse::<i64>().unwrap());
    let n = numbers.next().unwrap() as usize;
    let best = numbers.take(n).max().unwrap();
    println!("{}", best);
}
