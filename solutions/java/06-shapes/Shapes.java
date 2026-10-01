import java.util.List;

public class Shapes {
    public static double totalArea(List<Shape> shapes) {
        double total = 0;
        for (Shape s : shapes) {
            total += s.area();
        }
        return total;
    }

    public static Shape largest(List<Shape> shapes) {
        Shape best = null;
        for (Shape s : shapes) {
            if (best == null || s.area() > best.area()) {
                best = s;
            }
        }
        return best;
    }
}
