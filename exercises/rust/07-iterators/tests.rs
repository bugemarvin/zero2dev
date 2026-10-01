// Tests. Do not edit.
#![allow(dead_code, unused)]

#[path = "solution.rs"]
mod solution;
use solution::*;

use std::fmt::Debug;
use std::sync::atomic::{AtomicBool, Ordering};

static FAILED: AtomicBool = AtomicBool::new(false);

fn check(name: &str, ok: bool, detail: String) {
    if ok {
        println!("ok - {}", name);
    } else {
        FAILED.store(true, Ordering::SeqCst);
        println!("not ok - {}: {}", name, detail);
    }
}

fn eq<T: PartialEq + Debug>(name: &str, got: T, want: T) {
    let ok = got == want;
    check(name, ok, format!("expected {:?}, got {:?}", want, got));
}

fn finish() {
    if FAILED.load(Ordering::SeqCst) {
        std::process::exit(1);
    }
}

fn main() {
    eq("sum_of_even_squares([1, 2, 3, 4])", sum_of_even_squares(&[1, 2, 3, 4]), 20);
    eq("negative even numbers count too", sum_of_even_squares(&[-2, 5, 6]), 40);
    eq("no even numbers gives 0", sum_of_even_squares(&[1, 3]), 0);
    eq("an empty slice gives 0", sum_of_even_squares(&[]), 0);

    eq("initials of two names", initials(&["ada", "linus"]), String::from("AL"));
    eq("initials are upper case already or not", initials(&["Grace", "brewster", "Hopper"]), String::from("GBH"));
    eq("empty names are skipped", initials(&["", "sam", ""]), String::from("S"));
    eq("no names", initials(&[]), String::new());

    eq("long_words keeps words of 4 or more", long_words("The quick brown Fox jumps", 4),
       vec![String::from("quick"), String::from("brown"), String::from("jumps")]);
    eq("long_words lower-cases", long_words("HELLO big World", 5), vec![String::from("hello"), String::from("world")]);
    eq("long_words can return nothing", long_words("a bc", 3), Vec::<String>::new());

    eq("apply_n doubles three times", apply_n(|x| x * 2, 3, 1), 8);
    eq("apply_n zero times returns the start", apply_n(|x| x + 100, 0, 7), 7);
    let step = 5;
    eq("apply_n works with a closure that captures", apply_n(|x| x + step, 4, 0), 20);

    eq("running_total([1, 2, 3])", running_total(&[1, 2, 3]), vec![1, 3, 6]);
    eq("running_total with negatives", running_total(&[5, -5, 10]), vec![5, 0, 10]);
    eq("running_total of nothing", running_total(&[]), Vec::<i64>::new());
    finish();
}
