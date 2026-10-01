import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        StringTokenizer tokens = new StringTokenizer(in.readLine());
        long best = Long.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            best = Math.max(best, Long.parseLong(tokens.nextToken()));
        }
        System.out.println(best);
    }
}
