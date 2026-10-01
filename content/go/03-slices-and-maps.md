---
title: Slices, maps and strings
summary: The collections you will use in every Go program.
---

## Slices

A **slice** is a list that can grow. It is the collection you use most.

```go
numbers := []int{10, 20, 30}
numbers = append(numbers, 40)       // append returns the new slice: assign it back

fmt.Println(numbers[0])             // 10
fmt.Println(len(numbers))           // 4
fmt.Println(numbers[1:3])           // [20 30]: from index 1 up to, not including, 3
```

An empty slice ready to be filled:

```go
var names []string                  // nil, length 0: append works on it
scores := make([]int, 5)            // five zeros
```

Reading an index that does not exist stops the program with a **panic**: `index out of range`.

### Slices share memory

A slice is a small header that points at an underlying array. Slicing and assigning do **not** copy the elements:

```go
a := []int{1, 2, 3}
b := a
b[0] = 99
fmt.Println(a[0])      // 99: a and b look at the same array
```

To get an independent copy:

```go
b := make([]int, len(a))
copy(b, a)
// or, since Go 1.21:
b := slices.Clone(a)
```

Arrays with a fixed size exist too (`[3]int`), and you will rarely use them directly.

## Maps

A **map** stores values by key.

```go
ages := map[string]int{"sam": 30, "ada": 36}
ages["linus"] = 54
delete(ages, "sam")

age := ages["nobody"]               // 0: a missing key gives the zero value
age, ok := ages["ada"]              // ok says whether the key exists
if !ok {
	fmt.Println("not found")
}
```

Counting is the classic use. A missing key reads as 0, so no check is needed:

```go
counts := map[string]int{}
for _, word := range words {
	counts[word]++
}
```

**The order of a map is random**, on purpose. To print in order, sort the keys:

```go
keys := make([]string, 0, len(counts))
for key := range counts {
	keys = append(keys, key)
}
sort.Strings(keys)
for _, key := range keys {
	fmt.Println(key, counts[key])
}
```

A map must be created before use. Writing to a `nil` map panics:

```go
var m map[string]int
m["a"] = 1             // panic
m = map[string]int{}   // now it works
```

## Strings

A string is a read-only sequence of bytes holding UTF-8 text.

```go
s := "héllo"
fmt.Println(len(s))                 // 6: bytes, not characters
for i, r := range s {               // range gives runes (characters)
	fmt.Println(i, string(r))
}
```

The `strings` package has what you need:

```go
strings.ToUpper("go")                    // "GO"
strings.Fields("  a b   c ")             // ["a" "b" "c"]: split on whitespace
strings.Split("a,b,c", ",")              // ["a" "b" "c"]
strings.Join([]string{"a", "b"}, "-")    // "a-b"
strings.Contains("golang", "lang")       // true
strings.TrimSpace("  hi \n")             // "hi"
```

Converting numbers:

```go
n, err := strconv.Atoi("42")        // string to int
text := strconv.Itoa(42)            // int to string
```

## Reading all of the input

For input with many lines or words, `bufio.Scanner` is the tool:

```go
scanner := bufio.NewScanner(os.Stdin)
scanner.Split(bufio.ScanWords)      // word by word; leave this out for line by line
for scanner.Scan() {
	word := scanner.Text()
	fmt.Println(word)
}
```

## Common mistakes

- **`append(numbers, 4)` without assigning the result.**
- **Changing a slice** that another variable still uses, because slices share memory.
- **Relying on map order.**
- **Writing to a nil map.**
- **`len(s)` for the number of characters.** It counts bytes. Use `utf8.RuneCountInString(s)`.
