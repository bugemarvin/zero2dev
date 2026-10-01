#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long best = 0;
    for (int i = 0; i < n; i++) {
        long x;
        cin >> x;
        if (i == 0 || x > best) {
            best = x;
        }
    }
    cout << best << endl;
    return 0;
}
