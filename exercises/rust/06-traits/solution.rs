pub trait Priced {
    fn price(&self) -> f64;
    fn label(&self) -> String;
    // add the default method receipt_line
}

pub struct Product {
    pub name: String,
    pub unit_price: f64,
    pub quantity: u32,
}

pub struct Service {
    pub name: String,
    pub hours: f64,
    pub rate: f64,
}

pub fn largest<T: PartialOrd + Copy>(items: &[T]) -> Option<T> {
    None
}
