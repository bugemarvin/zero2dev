#[derive(Debug, PartialEq)]
pub enum ParseError {
    Empty,
    NotANumber(String),
    OutOfRange(i64),
}

pub fn find_user(names: &[&str], wanted: &str) -> Option<usize> {
    None
}

pub fn parse_percent(text: &str) -> Result<u8, ParseError> {
    Err(ParseError::Empty)
}

pub fn average_percent(texts: &[&str]) -> Result<f64, ParseError> {
    Err(ParseError::Empty)
}
