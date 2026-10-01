use std::collections::HashMap;
use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let mut counts: HashMap<String, u32> = HashMap::new();
    for word in input.split_whitespace() {
        // count the word, in lower case
    }
    println!("{}", counts.len());
}
