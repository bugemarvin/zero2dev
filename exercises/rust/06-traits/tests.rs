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

fn near(a: f64, b: f64) -> bool {
    (a - b).abs() < 1e-9
}

fn coffee() -> Product {
    Product { name: String::from("Coffee"), unit_price: 3.5, quantity: 2 }
}

fn repair() -> Service {
    Service { name: String::from("Repair"), hours: 1.5, rate: 40.0 }
}

fn main() {
    check("a product costs unit price times quantity", near(coffee().price(), 7.0), format!("got {}", coffee().price()));
    eq("a product label shows the quantity", coffee().label(), String::from("Coffee x2"));
    check("a service costs hours times rate", near(repair().price(), 60.0), format!("got {}", repair().price()));
    eq("a service label is its name", repair().label(), String::from("Repair"));
    eq("the default receipt line of a product", coffee().receipt_line(), String::from("Coffee x2: 7.00"));
    eq("the default receipt line of a service", repair().receipt_line(), String::from("Repair: 60.00"));

    let products = vec![coffee(), Product { name: String::from("Tea"), unit_price: 2.25, quantity: 4 }];
    check("total adds the prices", near(total(&products), 16.0), format!("got {}", total(&products)));
    let none: Vec<Service> = vec![];
    check("total of nothing is 0", near(total(&none), 0.0), format!("got {}", total(&none)));

    let mixed: Vec<Box<dyn Priced>> = vec![Box::new(coffee()), Box::new(repair()), Box::new(Product {
        name: String::from("Mug"), unit_price: 9.0, quantity: 1 })];
    eq("most_expensive works on a mixed list", most_expensive(&mixed), Some(String::from("Repair")));
    eq("most_expensive of nothing is None", most_expensive(&[]), None);

    eq("largest of integers", largest(&[3, 9, 2]), Some(9));
    eq("largest of floats", largest(&[1.5, 0.25, 1.25]), Some(1.5));
    eq("largest of characters", largest(&['b', 'z', 'a']), Some('z'));
    let empty: [i32; 0] = [];
    eq("largest of nothing is None", largest(&empty), None);
    finish();
}
