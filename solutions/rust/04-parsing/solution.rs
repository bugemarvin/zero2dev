#[derive(Debug, PartialEq)]
pub enum ParseError {
    Empty,
    NotANumber(String),
    OutOfRange(i64),
}

pub fn find_user(names: &[&str], wanted: &str) -> Option<usize> {
    for (index, name) in names.iter().enumerate() {
        if *name == wanted {
            return Some(index);
        }
    }
    None
}

pub fn parse_percent(text: &str) -> Result<u8, ParseError> {
    let text = text.trim();
    if text.is_empty() {
        return Err(ParseError::Empty);
    }
    let n: i64 = text.parse().map_err(|_| ParseError::NotANumber(text.to_string()))?;
    if !(0..=100).contains(&n) {
        return Err(ParseError::OutOfRange(n));
    }
    Ok(n as u8)
}

pub fn average_percent(texts: &[&str]) -> Result<f64, ParseError> {
    if texts.is_empty() {
        return Err(ParseError::Empty);
    }
    let mut sum = 0.0;
    for text in texts {
        sum += parse_percent(text)? as f64;
    }
    Ok(sum / texts.len() as f64)
}
