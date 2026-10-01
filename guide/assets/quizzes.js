window.Z2D_QUIZZES = {
"html/01-page-structure": [
{
"q": "Where does the text shown on the browser tab come from?",
"options": [
"The first h1",
"The <title> element in the head",
"The file name",
"The lang attribute"
],
"answer": 1,
"why": "<title> lives in the head and is used for the tab, bookmarks and search results."
},
{
"q": "Which of these is a void element (it has no closing tag)?",
"options": [
"<p>",
"<h1>",
"<img>",
"<body>"
],
"answer": 2,
"why": "img, br, meta, input and hr have no content, so they have no closing tag."
},
{
"q": "How many h1 elements should a page normally have?",
"options": [
"None",
"One",
"One per section",
"As many as you like"
],
"answer": 1,
"why": "One h1 says what the whole page is about. Sections use h2, h3 and so on."
},
{
"q": "What is wrong here?",
"options": [
"Nothing",
"The tags are closed in the wrong order",
"strong cannot be inside p",
"p needs an attribute"
],
"answer": 1,
"why": "Elements nest like boxes: the one opened last is closed first.",
"code": "<p>Read <strong>this</p></strong>"
}
],
"html/02-text-links-images": [
{
"q": "Which address is relative?",
"options": [
"https://example.com/about.html",
"about.html",
"mailto:me@example.com",
"//example.com"
],
"answer": 1,
"why": "A relative address has no scheme and no domain: it is found from the current page."
},
{
"q": "What is the alt attribute of an image for?",
"options": [
"A tooltip",
"The text used when the image cannot be seen",
"The file name",
"The image title in search results only"
],
"answer": 1,
"why": "Screen readers read it, and browsers show it when the image fails to load."
},
{
"q": "An image is pure decoration. What do you write?",
"options": [
"No alt attribute",
"alt=\"image\"",
"alt=\"\"",
"alt=\"decoration\""
],
"answer": 2,
"why": "An empty alt tells assistive technology to skip the image. A missing alt makes it read the file name."
},
{
"q": "Which element marks text as important?",
"options": [
"<b>",
"<i>",
"<strong>",
"<big>"
],
"answer": 2,
"why": "strong carries meaning (importance). b only changes the look."
}
],
"html/03-tables": [
{
"q": "What is a table for?",
"options": [
"Placing page sections side by side",
"Data that has rows and columns",
"Making text bold",
"Navigation menus"
],
"answer": 1,
"why": "Layout is done with CSS. Tables are for tabular data."
},
{
"q": "Which element is a header cell?",
"options": [
"<td>",
"<tr>",
"<th>",
"<thead>"
],
"answer": 2,
"why": "th labels a row or a column. thead only groups the header rows."
},
{
"q": "What does scope=\"row\" on a th say?",
"options": [
"The cell spans a row",
"The header labels its row",
"The row is hidden",
"The row is the first one"
],
"answer": 1,
"why": "scope tells assistive technology which cells a header describes."
}
],
"html/04-forms": [
{
"q": "A field has an id but no name. What happens when the form is submitted?",
"options": [
"The id is used",
"Its value is not sent",
"The browser shows an error",
"It is sent as 'undefined'"
],
"answer": 1,
"why": "Only fields with a name attribute are sent."
},
{
"q": "How is a label connected to its field?",
"options": [
"They are on the same line",
"The label's for equals the field's id",
"The label's name equals the field's name",
"By the placeholder"
],
"answer": 1,
"why": "for on the label must equal id on the field."
},
{
"q": "Three radio buttons should allow only one choice. What must they share?",
"options": [
"The same id",
"The same value",
"The same name",
"The same label"
],
"answer": 2,
"why": "Radio buttons with the same name form one group."
},
{
"q": "The browser validates your form. Is that enough for security?",
"options": [
"Yes",
"No: the server must check again"
],
"answer": 1,
"why": "Anyone can send a request without using your form."
}
],
"html/05-semantic-html": [
{
"q": "How many main elements may a page have?",
"options": [
"One",
"One per article",
"Two",
"Any number"
],
"answer": 0,
"why": "main is the main content of the page: there is one."
},
{
"q": "Which element fits a blog post that could be shared on its own?",
"options": [
"<section>",
"<article>",
"<aside>",
"<div>"
],
"answer": 1,
"why": "article is for content that stands alone."
},
{
"q": "Why is <button> better than a clickable <div>?",
"options": [
"It is faster",
"It works with the keyboard and screen readers",
"It needs less CSS",
"It is newer"
],
"answer": 1,
"why": "A button can be focused with Tab and pressed with Enter or Space, and is announced as a button."
},
{
"q": "A quick accessibility test anyone can do:",
"options": [
"Zoom to 50%",
"Use only the Tab key",
"Disable images",
"Open two tabs"
],
"answer": 1,
"why": "If everything can be reached and used with the keyboard, most of the basics are right."
}
],
"css/01-selectors-and-cascade": [
{
"q": "Which selector matches every element with class=\"note\"?",
"options": [
"note",
"#note",
".note",
"*note"
],
"answer": 2,
"why": "A dot selects a class, a hash selects an id."
},
{
"q": "p { color: black } and .note { color: green } both match <p class=\"note\">. Which colour wins?",
"options": [
"black",
"green",
"The first one in the file",
"Neither"
],
"answer": 1,
"why": "A class is more specific than an element, wherever the rules are in the file."
},
{
"q": "Two rules with the same specificity set the same property. Which wins?",
"options": [
"The first",
"The later one",
"The shorter one",
"It is random"
],
"answer": 1,
"why": "With equal specificity, the rule that comes later wins."
},
{
"q": "Which of these is inherited by child elements?",
"options": [
"margin",
"border",
"color",
"padding"
],
"answer": 2,
"why": "Text properties such as color and font-family are inherited. Box properties are not."
}
],
"css/02-box-model": [
{
"q": "Which layer is between the content and the border?",
"options": [
"margin",
"padding",
"outline",
"gap"
],
"answer": 1,
"why": "Order from the inside: content, padding, border, margin."
},
{
"q": "width: 200px; padding: 10px; border: 5px solid; with the default box-sizing. How wide is the box in pixels?",
"accept": [
"230"
],
"why": "content-box adds padding and border on both sides: 200 + 10 + 10 + 5 + 5."
},
{
"q": "What does margin: 10px 20px mean?",
"options": [
"top 10, right 20",
"top and bottom 10, left and right 20",
"left 10, right 20",
"all sides 15"
],
"answer": 1,
"why": "Two values: vertical first, then horizontal."
},
{
"q": "An h2 has margin-bottom 30px and the p under it has margin-top 20px. How big is the gap in pixels?",
"accept": [
"30"
],
"why": "Vertical margins collapse: the larger one wins."
}
],
"css/03-colours-fonts-units": [
{
"q": "Which unit follows the reader's default text size setting?",
"options": [
"px",
"rem",
"pt",
"cm"
],
"answer": 1,
"why": "rem is relative to the root font size, which the reader can change."
},
{
"q": "With default settings, how many pixels is 2rem?",
"accept": [
"32"
],
"why": "The default root font size is 16px."
},
{
"q": "How do you read the custom property --brand?",
"options": [
"$brand",
"var(--brand)",
"@brand",
"--brand()"
],
"answer": 1,
"why": "var() reads a custom property."
},
{
"q": "Why end font-family with sans-serif?",
"options": [
"It is required syntax",
"It is the fallback when the named fonts are missing",
"It loads faster",
"It makes text bold"
],
"answer": 1,
"why": "The browser walks the list and uses the first font it has. The generic family always exists."
}
],
"css/04-flexbox": [
{
"q": "On which element do you put display: flex?",
"options": [
"Each item",
"The parent of the items",
"The body, always",
"The first item"
],
"answer": 1,
"why": "The container gets display: flex. Its direct children become flex items."
},
{
"q": "In a row, which property moves items left, centre or right?",
"options": [
"align-items",
"justify-content",
"flex-wrap",
"align-self"
],
"answer": 1,
"why": "justify-content distributes along the main axis, which is horizontal in a row."
},
{
"q": "What does flex: 1 on an item mean?",
"options": [
"Its width is 1px",
"It takes a share of the free space",
"It is the first item",
"It cannot shrink"
],
"answer": 1,
"why": "flex: 1 lets the item grow to share the remaining space."
},
{
"q": "flex-direction is column. Which property now centres items horizontally?",
"options": [
"justify-content",
"align-items"
],
"answer": 1,
"why": "In a column the main axis is vertical, so the cross axis, controlled by align-items, is horizontal."
}
],
"css/05-grid": [
{
"q": "What does 1fr mean?",
"options": [
"1 pixel",
"One fraction of the free space",
"One full row",
"A fixed 100px"
],
"answer": 1,
"why": "fr shares out the space that is left."
},
{
"q": "grid-template-columns: 240px 1fr. What is the second column?",
"options": [
"240px",
"Whatever space is left",
"Half the page",
"Zero"
],
"answer": 1,
"why": "The fixed column takes 240px and the fr column takes the rest."
},
{
"q": "How many grid lines do three columns have?",
"accept": [
"4"
],
"why": "A line on each side of every column: one more than the number of columns."
},
{
"q": "Which tool for a navigation bar of links in one row?",
"options": [
"Grid",
"Flexbox",
"A table",
"Floats"
],
"answer": 1,
"why": "One direction: flexbox. Rows and columns together: grid."
}
],
"css/06-responsive": [
{
"q": "What does 'mobile first' mean?",
"options": [
"Design only for phones",
"Base rules for small screens, min-width queries for larger ones",
"Load the mobile site first",
"Use max-width queries only"
],
"answer": 1,
"why": "The small layout is the base, and larger screens add to it."
},
{
"q": "Which rule stops a wide image from overflowing its container?",
"options": [
"width: 100vw",
"max-width: 100%",
"overflow: visible",
"display: block"
],
"answer": 1,
"why": "max-width: 100% lets the image shrink and never grow past its own size."
},
{
"q": "Where should a media query go, relative to the rule it overrides?",
"options": [
"Before it",
"After it",
"It does not matter"
],
"answer": 1,
"why": "A media query adds no specificity, so order decides: later wins."
},
{
"q": "How do you choose a breakpoint?",
"options": [
"From a list of phone models",
"Where the layout starts to look wrong",
"Always 768px",
"At half the screen"
],
"answer": 1,
"why": "Let the content decide: resize the window until it breaks."
}
],
"go/01-basics": [
{
"q": "What is the difference between := and = ?",
"options": [
":= compares, = assigns",
":= declares and assigns, = assigns to an existing variable",
"They are the same",
":= is for constants"
],
"answer": 1,
"why": ":= creates a new variable and gives it a value. = needs the variable to exist already."
},
{
"q": "What happens when you declare a variable and never use it?",
"options": [
"A warning",
"Nothing",
"A compile error",
"It is removed silently"
],
"answer": 2,
"why": "Unused variables and unused imports stop the build."
},
{
"q": "What does this print?",
"accept": [
"3"
],
"why": "Both operands are ints, so the division is integer division.",
"code": "fmt.Println(7 / 2)"
},
{
"q": "Which names are visible from other packages?",
"options": [
"Names marked public",
"Names starting with a capital letter",
"All names",
"Names in main"
],
"answer": 1,
"why": "Capitalised names are exported. That is the whole visibility rule."
}
],
"go/02-control-flow-and-functions": [
{
"q": "How many kinds of loop keyword does Go have?",
"options": [
"One: for",
"Two: for and while",
"Three: for, while, do",
"None"
],
"answer": 0,
"why": "for covers every kind of loop."
},
{
"q": "A case in a Go switch matches. What happens after its body runs?",
"options": [
"The next case runs too",
"The switch ends",
"It loops",
"It is an error without break"
],
"answer": 1,
"why": "Go does not fall through. Only the matching case runs."
},
{
"q": "How does a Go function normally report failure?",
"options": [
"It throws an exception",
"It returns an error as its last value",
"It sets a global variable",
"It exits the program"
],
"answer": 1,
"why": "Errors are values: result, err := f() followed by if err != nil."
},
{
"q": "When does a deferred call run?",
"options": [
"Immediately",
"When the surrounding function returns",
"At the end of the program",
"Never, unless called"
],
"answer": 1,
"why": "defer schedules the call for when the function ends, on every path."
}
],
"go/03-slices-and-maps": [
{
"q": "What does this print?",
"accept": [
"99"
],
"why": "b := a copies the slice header, not the elements. Both see the same array.",
"code": "a := []int{1, 2, 3}\nb := a\nb[0] = 99\nfmt.Println(a[0])"
},
{
"q": "What does reading a missing key from a map[string]int give?",
"options": [
"A panic",
"nil",
"0",
"-1"
],
"answer": 2,
"why": "A missing key gives the zero value of the value type."
},
{
"q": "In what order does range visit a map?",
"options": [
"Insertion order",
"Sorted by key",
"Random order",
"Reverse order"
],
"answer": 2,
"why": "Map iteration order is deliberately random. Sort the keys when order matters."
},
{
"q": "What is wrong with: append(numbers, 4) on a line by itself?",
"options": [
"Nothing",
"The result is not assigned, so it does not compile",
"append needs three arguments",
"It panics"
],
"answer": 1,
"why": "append returns the new slice. Write numbers = append(numbers, 4)."
}
],
"go/04-structs-and-methods": [
{
"q": "A function receives a struct (not a pointer) and changes a field. What happens to the caller's struct?",
"options": [
"It changes too",
"Nothing: the function changed a copy",
"A compile error",
"A panic"
],
"answer": 1,
"why": "Go passes copies. To change the original, pass a pointer."
},
{
"q": "What does &p mean?",
"options": [
"The value of p",
"The address of p",
"p and something",
"A reference count"
],
"answer": 1,
"why": "& takes the address of a variable."
},
{
"q": "Which receiver does a method need to change its struct?",
"options": [
"A value receiver",
"A pointer receiver",
"Either",
"Neither"
],
"answer": 1,
"why": "With a value receiver the method works on a copy."
},
{
"q": "Does Go have classes and inheritance?",
"options": [
"Yes, both",
"Classes but no inheritance",
"Neither: it has types with methods, and embedding",
"Only inheritance"
],
"answer": 2,
"why": "A type plus methods replaces a class, and embedding replaces inheritance."
}
],
"go/05-interfaces-and-errors": [
{
"q": "How does a type declare that it implements an interface?",
"options": [
"With the implements keyword",
"It does not: having the methods is enough",
"By embedding the interface",
"With an annotation"
],
"answer": 1,
"why": "Interfaces are satisfied implicitly."
},
{
"q": "Which verb wraps an error so that errors.Is can still find it?",
"options": [
"%v",
"%s",
"%w",
"%e"
],
"answer": 2,
"why": "fmt.Errorf with %w keeps the original error inside the new one."
},
{
"q": "How should you check whether an error is ErrNotFound?",
"options": [
"err.Error() == \"not found\"",
"errors.Is(err, ErrNotFound)",
"err == nil",
"strings.Contains(err.Error(), \"not\")"
],
"answer": 1,
"why": "errors.Is looks through wrapped errors and does not depend on the message."
},
{
"q": "When is panic appropriate?",
"options": [
"A file is missing",
"The user typed bad input",
"A bug: a state that should be impossible",
"A network timeout"
],
"answer": 2,
"why": "Expected failures are errors. panic is for programming mistakes."
}
],
"go/06-goroutines-and-channels": [
{
"q": "What happens to running goroutines when main returns?",
"options": [
"They finish first",
"They are cut off: the program ends",
"They become daemons",
"A panic"
],
"answer": 1,
"why": "The program ends when main returns. Wait with a WaitGroup or a channel."
},
{
"q": "Two goroutines do count++ on the same variable with no protection. What is this called?",
"options": [
"A deadlock",
"A data race",
"A leak",
"A panic"
],
"answer": 1,
"why": "Unsynchronised access where at least one side writes is a data race."
},
{
"q": "Who should close a channel?",
"options": [
"The receiver",
"The sender",
"Either",
"The garbage collector"
],
"answer": 1,
"why": "Only the sender knows there are no more values."
},
{
"q": "What ends a `for v := range ch` loop?",
"options": [
"An empty channel",
"The channel being closed",
"A timeout",
"Nothing"
],
"answer": 1,
"why": "range over a channel runs until the channel is closed and drained."
}
],
"go/07-modules-testing-http": [
{
"q": "Which file names a Go module and lists its dependencies?",
"options": [
"package.json",
"go.mod",
"main.go",
"Gofile"
],
"answer": 1,
"why": "go.mod is created by go mod init."
},
{
"q": "How must a test file be named?",
"options": [
"test_calc.go",
"calc_test.go",
"calc.test.go",
"CalcTest.go"
],
"answer": 1,
"why": "go test picks up files ending in _test.go."
},
{
"q": "Each HTTP request in Go runs in ...",
"options": [
"the main goroutine",
"its own goroutine",
"a new process",
"a thread pool of size 1"
],
"answer": 1,
"why": "So data shared between handlers needs a mutex."
},
{
"q": "A struct field is named `title` (lower case). What does encoding/json do with it?",
"options": [
"Encodes it as title",
"Leaves it out",
"Fails to compile",
"Encodes it as Title"
],
"answer": 1,
"why": "Only exported (capitalised) fields are encoded. Use a json tag to choose the name."
}
],
"rust/01-basics": [
{
"q": "What does `let x = 5; x = 6;` do?",
"options": [
"Sets x to 6",
"Fails to compile: x is immutable",
"Creates a second x",
"Panics at run time"
],
"answer": 1,
"why": "Variables are immutable unless declared with let mut."
},
{
"q": "How does this function return its value?",
"options": [
"It does not: it is missing return",
"The last expression without a semicolon is the result",
"With the -> keyword",
"It prints it"
],
"answer": 1,
"why": "The final expression of a block is its value.",
"code": "fn add(a: i32, b: i32) -> i32 {\n    a + b\n}"
},
{
"q": "What does 0..5 contain?",
"options": [
"0 to 5",
"0 to 4",
"1 to 5",
"1 to 4"
],
"answer": 1,
"why": "The end of a .. range is not included. ..= includes it."
},
{
"q": "Which tool builds and runs a Rust project?",
"options": [
"npm",
"cargo",
"make",
"rustup"
],
"answer": 1,
"why": "cargo is the build tool and package manager. rustup installs Rust itself."
}
],
"rust/02-ownership-and-borrowing": [
{
"q": "After `let b = a;` where a is a String, what is true?",
"options": [
"a and b share the text",
"a can no longer be used",
"b is a copy and a is unchanged",
"Both are dropped"
],
"answer": 1,
"why": "A String moves. The compiler rejects any later use of a."
},
{
"q": "How many mutable references to one value may exist at the same time?",
"accept": [
"1"
],
"why": "One writer, or any number of readers, never both."
},
{
"q": "Which parameter type means 'I only look at your value'?",
"options": [
"x: T",
"x: &T",
"x: &mut T",
"x: Box<T>"
],
"answer": 1,
"why": "& borrows without taking ownership and without permission to change."
},
{
"q": "Why can an i32 still be used after `let y = x;`?",
"options": [
"It was moved back",
"Integers implement Copy, so they are copied",
"The compiler ignores numbers",
"It cannot"
],
"answer": 1,
"why": "Small stack-only types are Copy: assignment duplicates them."
}
],
"rust/03-structs-enums-match": [
{
"q": "What does 'match must be exhaustive' mean?",
"options": [
"It must be fast",
"Every possible case must be handled",
"It needs a default arm",
"It runs every arm"
],
"answer": 1,
"why": "If a variant is not covered, the code does not compile."
},
{
"q": "Which first parameter lets a method change its struct?",
"options": [
"self",
"&self",
"&mut self",
"mut"
],
"answer": 2,
"why": "&mut self borrows the value mutably."
},
{
"q": "What does #[derive(Debug)] give a type?",
"options": [
"A debugger",
"Printing with {:?}",
"Faster code",
"Tests"
],
"answer": 1,
"why": "Debug is the trait behind the {:?} format."
},
{
"q": "What is special about Rust enums compared with C enums?",
"options": [
"They are faster",
"Each variant can carry its own data",
"They are strings",
"They cannot be matched"
],
"answer": 1,
"why": "Variants can hold values, which makes enums a tool for modelling states."
}
],
"rust/04-option-result": [
{
"q": "What does Rust use where other languages use null?",
"options": [
"nil",
"Option<T>",
"undefined",
"0"
],
"answer": 1,
"why": "Option<T> is Some(value) or None, and the compiler makes you handle both."
},
{
"q": "What does the ? operator do on an Err?",
"options": [
"Panics",
"Ignores it",
"Returns the error from the current function",
"Converts it to None"
],
"answer": 2,
"why": "? unwraps Ok, and returns early with the Err."
},
{
"q": "What does .unwrap() do on None?",
"options": [
"Returns 0",
"Returns a default",
"Panics",
"Does not compile"
],
"answer": 2,
"why": "unwrap panics when there is no value. Use it only where that is acceptable."
},
{
"q": "A file may be missing. Which type should the function return?",
"options": [
"Option",
"Result",
"bool",
"It should panic"
],
"answer": 1,
"why": "An operation that can fail returns Result, so the caller learns why it failed."
}
],
"rust/05-collections-and-strings": [
{
"q": "Which type is text you own and can grow?",
"options": [
"&str",
"String",
"char",
"str"
],
"answer": 1,
"why": "String owns its text. &str borrows text owned elsewhere."
},
{
"q": "What does v.get(10) return on a vector of 3 elements?",
"options": [
"A panic",
"0",
"None",
"The last element"
],
"answer": 2,
"why": "get returns an Option. v[10] would panic."
},
{
"q": "How many characters does \"héllo\".len() report?",
"accept": [
"6"
],
"why": "len counts bytes, and é takes two bytes in UTF-8."
},
{
"q": "Which map keeps its keys in sorted order?",
"options": [
"HashMap",
"BTreeMap",
"Vec",
"HashSet"
],
"answer": 1,
"why": "BTreeMap is ordered by key. HashMap has no order."
}
],
"rust/06-traits-and-generics": [
{
"q": "How does a type implement a trait in Rust?",
"options": [
"Automatically, by having the methods",
"With an impl Trait for Type block",
"With extends",
"It cannot"
],
"answer": 1,
"why": "Unlike Go, the implementation is explicit."
},
{
"q": "What does the bound in fn largest<T: PartialOrd>(...) mean?",
"options": [
"T must be a number",
"T must support comparison",
"T is optional",
"T is a pointer"
],
"answer": 1,
"why": "The bound limits T to types that implement PartialOrd, so < and > can be used."
},
{
"q": "When do you need Box<dyn Trait> in place of generics?",
"options": [
"Always",
"When one collection must hold values of different types",
"For speed",
"Never"
],
"answer": 1,
"why": "A trait object lets a list mix types that share a trait."
},
{
"q": "Which trait controls how a value prints with {} ?",
"options": [
"Debug",
"Display",
"ToString",
"Print"
],
"answer": 1,
"why": "Display is for {} and Debug is for {:?}."
}
],
"rust/07-iterators-closures-testing": [
{
"q": "Iterators are lazy. What does that mean?",
"options": [
"They are slow",
"Nothing runs until a consumer asks for values",
"They skip items",
"They run in the background"
],
"answer": 1,
"why": "Adapters such as map only describe the work. collect, sum or a for loop make it happen."
},
{
"q": "What does this produce?",
"options": [
"[4, 16]",
"[2, 4]",
"[1, 4, 9, 16]",
"20"
],
"answer": 0,
"why": "filter keeps 2 and 4, map squares them.",
"code": "vec![1, 2, 3, 4].iter().filter(|n| *n % 2 == 0).map(|n| n * n).collect::<Vec<_>>()"
},
{
"q": "Which attribute marks a test function?",
"options": [
"#[check]",
"#[test]",
"#[cfg]",
"#[assert]"
],
"answer": 1,
"why": "cargo test runs every function marked #[test]."
},
{
"q": "After `for x in v.into_iter()`, can v still be used?",
"options": [
"Yes",
"No: into_iter consumes the collection"
],
"answer": 1,
"why": "into_iter takes ownership of the items. iter() only borrows."
}
],
"php/01-basics": [
{
"q": "Which operator compares value and type?",
"options": [
"=",
"==",
"===",
"<>"
],
"answer": 2,
"why": "=== is true only when both the value and the type are the same."
},
{
"q": "What does this print?",
"options": [
"Hello, $name",
"Hello, Sam",
"An error",
"Hello, "
],
"answer": 0,
"why": "Single quotes do not fill in variables.",
"code": "$name = 'Sam';\necho 'Hello, $name';"
},
{
"q": "How do you join two strings in PHP?",
"options": [
"+",
".",
"&",
","
],
"answer": 1,
"why": "The dot joins strings. + is for numbers."
},
{
"q": "What does declare(strict_types=1) change?",
"options": [
"It makes PHP faster",
"Passing a value of the wrong type becomes an error",
"Variables need declaring",
"It disables echo"
],
"answer": 1,
"why": "Without it PHP silently converts between scalar types."
}
],
"php/02-arrays": [
{
"q": "What does `$a[] = 5;` do?",
"options": [
"Empties the array",
"Adds 5 to the end",
"Sets every item to 5",
"It is an error"
],
"answer": 1,
"why": "Empty brackets append."
},
{
"q": "What does `$x = $user['email'] ?? 'none';` do when the key is missing?",
"options": [
"Throws an error",
"Sets $x to 'none'",
"Sets $x to null",
"Sets $x to false"
],
"answer": 1,
"why": "?? gives the right-hand value when the left side is missing or null."
},
{
"q": "After `$b = $a;` (arrays) and `$b[] = 1;`, is $a changed?",
"options": [
"Yes",
"No: arrays are copied"
],
"answer": 1,
"why": "Arrays have value semantics: assigning copies."
},
{
"q": "Why call array_values after array_filter?",
"options": [
"To sort",
"To renumber the keys 0, 1, 2",
"To remove nulls",
"To copy"
],
"answer": 1,
"why": "array_filter keeps the original keys, which leaves gaps."
}
],
"php/03-functions": [
{
"q": "Can a function read a variable defined outside it, without anything extra?",
"options": [
"Yes",
"No: it sees only its parameters and its own variables"
],
"answer": 1,
"why": "PHP functions have their own scope. Pass values in, or capture them in a closure."
},
{
"q": "What does the type ?string accept?",
"options": [
"Any string",
"A string or null",
"An optional parameter",
"A string or false"
],
"answer": 1,
"why": "The question mark makes the type nullable."
},
{
"q": "How does an arrow function fn() => ... differ from function () { }?",
"options": [
"It is slower",
"It sees outside variables automatically",
"It cannot return",
"It needs use"
],
"answer": 1,
"why": "Arrow functions capture outside variables by value, without use."
},
{
"q": "What happens when no arm of a match fits and there is no default?",
"options": [
"It returns null",
"An error is thrown",
"The first arm runs",
"Nothing"
],
"answer": 1,
"why": "match throws UnhandledMatchError, so a forgotten case is noticed."
}
],
"php/04-classes": [
{
"q": "Which keyword makes a property reachable only inside its class?",
"options": [
"public",
"protected",
"private",
"static"
],
"answer": 2,
"why": "private limits access to the class itself."
},
{
"q": "After `$b = $a;` where $a is an object, and a change through $b, is $a affected?",
"options": [
"Yes: both name the same object",
"No: objects are copied"
],
"answer": 0,
"why": "Objects are handles. Use clone for a copy."
},
{
"q": "What must a class do to `implement` an interface?",
"options": [
"Extend it",
"Have all the methods the interface lists",
"Be abstract",
"Nothing"
],
"answer": 1,
"why": "The interface is a contract: every listed method must exist."
},
{
"q": "Which folder created by Composer should NOT be committed to Git?",
"options": [
"src",
"vendor",
"tests",
"public"
],
"answer": 1,
"why": "vendor/ is rebuilt from composer.lock with composer install."
}
],
"php/05-web": [
{
"q": "What happens to a PHP script's variables when the request is finished?",
"options": [
"They are kept for the next request",
"They are gone: every request starts from zero",
"They are saved to disk",
"They move to the session automatically"
],
"answer": 1,
"why": "One request, one run. Lasting data goes into a database, file, cache or session."
},
{
"q": "Which function must user input pass through before it is printed into HTML?",
"options": [
"trim",
"htmlspecialchars",
"json_encode",
"strtolower"
],
"answer": 1,
"why": "It escapes < > & and quotes, which prevents cross-site scripting."
},
{
"q": "Where is the body of a JSON request read from?",
"options": [
"$_POST",
"$_GET",
"php://input",
"$_JSON"
],
"answer": 2,
"why": "$_POST only holds HTML form fields. The raw body is read from php://input."
},
{
"q": "What does json_decode return for text that is not valid JSON?",
"options": [
"false",
"null",
"An empty array",
"It throws by default"
],
"answer": 1,
"why": "By default it returns null, so check the result."
}
],
"php/06-databases": [
{
"q": "How do you safely put a user's value into a query?",
"options": [
"Join it into the SQL string",
"Escape quotes by hand",
"Use a prepared statement with a placeholder",
"Check its length"
],
"answer": 2,
"why": "Prepared statements send SQL and values separately, so a value can never be run as SQL."
},
{
"q": "What does $statement->fetch() return when no row matches?",
"options": [
"null",
"false",
"An empty array",
"It throws"
],
"answer": 1,
"why": "fetch returns false when there are no more rows."
},
{
"q": "How should passwords be stored?",
"options": [
"As plain text",
"With md5",
"With password_hash",
"Encrypted with a key in the code"
],
"answer": 2,
"why": "password_hash is slow and salted on purpose. Verify with password_verify."
},
{
"q": "A transaction has two updates and the second fails. What should happen?",
"options": [
"Keep the first update",
"Roll back so neither is applied",
"Retry forever",
"Ignore the error"
],
"answer": 1,
"why": "A transaction is all or nothing: rollBack undoes the first update."
}
]
};
