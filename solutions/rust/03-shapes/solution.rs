use std::f64::consts::PI;

#[derive(Debug, Clone, PartialEq)]
pub enum Shape {
    Circle { radius: f64 },
    Rect { width: f64, height: f64 },
    Square(f64),
}

impl Shape {
    pub fn area(&self) -> f64 {
        match self {
            Shape::Circle { radius } => PI * radius * radius,
            Shape::Rect { width, height } => width * height,
            Shape::Square(side) => side * side,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Shape::Circle { .. } => "circle",
            Shape::Rect { .. } => "rect",
            Shape::Square(_) => "square",
        }
    }

    pub fn scale(&mut self, factor: f64) {
        match self {
            Shape::Circle { radius } => *radius *= factor,
            Shape::Rect { width, height } => {
                *width *= factor;
                *height *= factor;
            }
            Shape::Square(side) => *side *= factor,
        }
    }
}

pub struct Counter {
    count: u32,
}

impl Counter {
    pub fn new() -> Counter {
        Counter { count: 0 }
    }

    pub fn increment(&mut self) {
        self.count += 1;
    }

    pub fn value(&self) -> u32 {
        self.count
    }

    pub fn reset(&mut self) {
        self.count = 0;
    }
}
