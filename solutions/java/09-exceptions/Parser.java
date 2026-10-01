import java.util.List;

public class Parser {
    public static int parseAge(String text) throws InvalidAgeException {
        int age;
        try {
            age = Integer.parseInt(text.trim());
        } catch (NumberFormatException e) {
            throw new InvalidAgeException("not a number: " + text);
        }
        if (age < 0 || age > 150) {
            throw new InvalidAgeException("out of range: " + age);
        }
        return age;
    }

    public static int sumValid(List<String> items) {
        int sum = 0;
        for (String item : items) {
            try {
                sum += Integer.parseInt(item.trim());
            } catch (NumberFormatException e) {
                // not a number: skip it
            }
        }
        return sum;
    }
}
