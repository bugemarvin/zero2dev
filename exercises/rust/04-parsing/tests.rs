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
    let names = ["ada", "linus", "grace"];
    eq("find_user finds the position", find_user(&names, "linus"), Some(1));
    eq("find_user finds the first one", find_user(&names, "ada"), Some(0));
    eq("find_user returns None when absent", find_user(&names, "sam"), None);
    eq("find_user on an empty list", find_user(&[], "sam"), None);

    eq("parse_percent(\"42\")", parse_percent("42"), Ok(42));
    eq("spaces are ignored", parse_percent("  7 \n"), Ok(7));
    eq("0 and 100 are allowed", (parse_percent("0"), parse_percent("100")), (Ok(0), Ok(100)));
    eq("empty text", parse_percent("   "), Err(ParseError::Empty));
    eq("not a number", parse_percent(" abc "), Err(ParseError::NotANumber(String::from("abc"))));
    eq("a fraction is not a whole number", parse_percent("4.5"), Err(ParseError::NotANumber(String::from("4.5"))));
    eq("above the range", parse_percent("101"), Err(ParseError::OutOfRange(101)));
    eq("below the range", parse_percent("-3"), Err(ParseError::OutOfRange(-3)));
    eq("far above the range", parse_percent("5000"), Err(ParseError::OutOfRange(5000)));

    eq("average of three", average_percent(&["10", "20", "60"]), Ok(30.0));
    eq("average of one", average_percent(&[" 55 "]), Ok(55.0));
    eq("the first error is returned", average_percent(&["10", "x", "200"]), Err(ParseError::NotANumber(String::from("x"))));
    eq("an out-of-range value stops it", average_percent(&["10", "200"]), Err(ParseError::OutOfRange(200)));
    eq("an empty list", average_percent(&[]), Err(ParseError::Empty));
    finish();
}
