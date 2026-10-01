import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int count = 0;
        long sum = 0;
        int min = 0;
        int max = 0;
        while (in.hasNextInt()) {
            int x = in.nextInt();
            if (count == 0 || x < min) {
                min = x;
            }
            if (count == 0 || x > max) {
                max = x;
            }
            sum += x;
            count++;
        }
        System.out.println("count: " + count);
        if (count > 0) {
            System.out.println("sum: " + sum);
            System.out.println("min: " + min);
            System.out.println("max: " + max);
        }
    }
}
