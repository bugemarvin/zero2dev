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

fn main() {
    let circle = Shape::Circle { radius: 1.0 };
    let rect = Shape::Rect { width: 2.0, height: 3.0 };
    let square = Shape::Square(4.0);
    check("a circle of radius 1 has area pi", near(circle.area(), std::f64::consts::PI), format!("got {}", circle.area()));
    check("a 2 by 3 rect has area 6", near(rect.area(), 6.0), format!("got {}", rect.area()));
    check("a square of side 4 has area 16", near(square.area(), 16.0), format!("got {}", square.area()));
    eq("the names", vec![circle.name(), rect.name(), square.name()], vec!["circle", "rect", "square"]);

    let mut scaled = rect.clone();
    scaled.scale(2.0);
    eq("scale doubles both sides of a rect", scaled.clone(), Shape::Rect { width: 4.0, height: 6.0 });
    eq("the original is unchanged after cloning", rect, Shape::Rect { width: 2.0, height: 3.0 });
    let mut c = Shape::Circle { radius: 2.0 };
    c.scale(0.5);
    eq("scale changes the radius of a circle", c, Shape::Circle { radius: 1.0 });
    let mut s = Shape::Square(3.0);
    s.scale(3.0);
    eq("scale changes the side of a square", s, Shape::Square(9.0));

    let mut counter = Counter::new();
    eq("a new counter is 0", counter.value(), 0);
    counter.increment();
    counter.increment();
    counter.increment();
    eq("three increments give 3", counter.value(), 3);
    counter.reset();
    eq("reset goes back to 0", counter.value(), 0);
    finish();
}
