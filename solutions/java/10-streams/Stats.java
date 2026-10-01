import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Stats {
    public static List<String> longNames(List<String> names, int minLength) {
        return names.stream()
            .filter(name -> name.length() >= minLength)
            .map(String::toUpperCase)
            .sorted()
            .toList();
    }

    public static int sumOfEvenSquares(List<Integer> numbers) {
        return numbers.stream()
            .filter(n -> n % 2 == 0)
            .mapToInt(n -> n * n)
            .sum();
    }

    public static Map<Character, Long> countByFirstLetter(List<String> words) {
        return words.stream()
            .filter(word -> !word.isEmpty())
            .collect(Collectors.groupingBy(word -> Character.toLowerCase(word.charAt(0)), Collectors.counting()));
    }

    public static Optional<String> longest(List<String> words) {
        return words.stream().max(Comparator.comparing(String::length));
    }

    public static long countNonBlankLines(Path path) throws IOException {
        try (Stream<String> lines = Files.lines(path)) {
            return lines.filter(line -> !line.isBlank()).count();
        }
    }
}
