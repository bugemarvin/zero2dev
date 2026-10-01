import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.StringTokenizer;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer first = new StringTokenizer(in.readLine());
        int n = Integer.parseInt(first.nextToken());
        long target = Long.parseLong(first.nextToken());
        StringTokenizer tokens = new StringTokenizer(in.readLine());
        Map<Long, Integer> position = new HashMap<>();
        for (int i = 0; i < n; i++) {
            long x = Long.parseLong(tokens.nextToken());
            Integer partner = position.get(target - x);
            if (partner != null) {
                System.out.println(partner + " " + i);
                return;
            }
            position.put(x, i);
        }
    }
}
