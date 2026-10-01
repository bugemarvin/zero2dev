pub trait Priced {
    fn price(&self) -> f64;
    fn label(&self) -> String;

    fn receipt_line(&self) -> String {
        format!("{}: {:.2}", self.label(), self.price())
    }
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

impl Priced for Product {
    fn price(&self) -> f64 {
        self.unit_price * self.quantity as f64
    }

    fn label(&self) -> String {
        format!("{} x{}", self.name, self.quantity)
    }
}

impl Priced for Service {
    fn price(&self) -> f64 {
        self.hours * self.rate
    }

    fn label(&self) -> String {
        self.name.clone()
    }
}

pub fn total<T: Priced>(items: &[T]) -> f64 {
    let mut sum = 0.0;
    for item in items {
        sum += item.price();
    }
    sum
}

pub fn most_expensive(items: &[Box<dyn Priced>]) -> Option<String> {
    let mut best: Option<&Box<dyn Priced>> = None;
    for item in items {
        match best {
            Some(current) if current.price() >= item.price() => {}
            _ => best = Some(item),
        }
    }
    best.map(|item| item.label())
}

pub fn largest<T: PartialOrd + Copy>(items: &[T]) -> Option<T> {
    let mut best = *items.first()?;
    for &item in items {
        if item > best {
            best = item;
        }
    }
    Some(best)
}
