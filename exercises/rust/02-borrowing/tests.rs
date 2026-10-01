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
    eq("longest picks the longer text", longest("apple", "fig"), "apple");
    eq("longest picks the second when it is longer", longest("fig", "banana"), "banana");
    eq("longest returns the first on a tie", longest("abc", "xyz"), "abc");

    let numbers = vec![3, 4, 5];
    eq("total adds the numbers", total(&numbers), 12);
    eq("the vector is still usable after total", numbers.len(), 3);
    eq("total of an empty slice is 0", total(&[]), 0);
    eq("total works on part of a vector", total(&numbers[1..]), 9);

    let mut values = vec![1, -2, 10];
    double_all(&mut values);
    eq("double_all doubles in place", values.clone(), vec![2, -4, 20]);
    double_all(&mut values);
    eq("double_all can be applied again", values, vec![4, -8, 40]);

    let mut text = String::from("hello");
    append_exclamation(&mut text);
    eq("append_exclamation adds one !", text.as_str(), "hello!");
    append_exclamation(&mut text);
    eq("and another when called again", text.as_str(), "hello!!");
    finish();
}
