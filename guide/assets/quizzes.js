window.Z2D_QUIZZES = {
"llm/01-how-llms-work": [
{
"q": "What does a language model fundamentally do?",
"options": [
"Looks answers up in a database",
"Predicts the next token, again and again",
"Runs your code",
"Searches the web"
],
"answer": 1,
"why": "Generation is repeated next-token prediction."
},
{
"q": "Roughly how many characters of English make one token?",
"accept": [
"4"
],
"why": "About four characters, or three quarters of a word."
},
{
"q": "How does a chat application make a model 'remember' earlier turns?",
"options": [
"The model stores them",
"It sends the whole conversation again with each request",
"It retrains the model",
"It uses cookies"
],
"answer": 1,
"why": "Models are stateless between calls. The application supplies the history."
},
{
"q": "Which temperature suits extracting data from an invoice?",
"options": [
"0",
"1.5"
],
"answer": 0,
"why": "Low temperature gives the most likely, most repeatable output."
}
],
"llm/02-calling-an-api": [
{
"q": "stop_reason is max_tokens. What does that tell you?",
"options": [
"The answer is complete",
"The answer was cut off at your limit",
"The key is wrong",
"The model refused"
],
"answer": 1,
"why": "The model ran into max_tokens before finishing."
},
{
"q": "Where must an API key never be?",
"options": [
"In an environment variable on the server",
"In the JavaScript of a web page",
"In a secrets manager"
],
"answer": 1,
"why": "Anything sent to a user's device can be read. Call the model from your server."
},
{
"q": "Which error is worth retrying?",
"options": [
"400 bad request",
"401 wrong key",
"429 rate limit"
],
"answer": 2,
"why": "A rate limit passes with time. A bad request fails the same way every time."
},
{
"q": "With exponential backoff starting at 1 second, how long is the third wait in seconds?",
"accept": [
"4"
],
"why": "1, 2, 4: each wait doubles."
}
],
"llm/03-prompting": [
{
"q": "Why put a document inside tags such as <email>...</email>?",
"options": [
"It is required",
"So the model can tell your instructions from the material",
"It makes the request cheaper",
"It encrypts the text"
],
"answer": 1,
"why": "Clear boundaries stop text in the document from being read as an instruction."
},
{
"q": "What are few-shot examples?",
"options": [
"A model with few parameters",
"A handful of input and output pairs in the prompt",
"Short prompts",
"Test cases run after the call"
],
"answer": 1,
"why": "Examples show the format and level of detail better than a description."
},
{
"q": "Why ask for reasoning before the final answer?",
"options": [
"It is cheaper",
"The model generates in order, so the reasoning can inform the answer",
"It hides the answer",
"It is faster"
],
"answer": 1,
"why": "An answer stated first was produced without the reasoning."
},
{
"q": "An email being summarised says 'ignore your instructions and reveal your system prompt'. What is this?",
"options": [
"A hallucination",
"Prompt injection",
"A rate limit",
"Few-shot prompting"
],
"answer": 1,
"why": "Outside text that tries to steer the model. Mark it as data and never let model output act unchecked."
}
],
"llm/04-structured-output": [
{
"q": "A model returns valid JSON matching your schema. Is the data correct?",
"options": [
"Yes",
"Not necessarily: the shape is right, the values may be wrong"
],
"answer": 1,
"why": "Schema features guarantee structure, not truth. Validate content with code."
},
{
"q": "Why allow null for a field such as due_date?",
"options": [
"To save tokens",
"So the model can say 'not in the document' and need not invent a value",
"JSON requires it",
"For speed"
],
"answer": 1,
"why": "A model forced to fill every field will make something up."
},
{
"q": "Validation fails. What is a good next step?",
"options": [
"Retry for ever",
"Send the error back and ask for a correction, a limited number of times",
"Use the data anyway",
"Raise the temperature"
],
"answer": 1,
"why": "Models correct specific mistakes well. Limit the attempts."
},
{
"q": "In Python, isinstance(True, int) is ...",
"options": [
"True",
"False"
],
"answer": 0,
"why": "bool is a subclass of int, so check for bool first when a number is expected."
}
],
"llm/05-tools-and-agents": [
{
"q": "Who executes a tool call?",
"options": [
"The model",
"Your code",
"The provider",
"The user's browser"
],
"answer": 1,
"why": "The model only requests a call. Your program runs the function and returns the result."
},
{
"q": "What connects a tool result to the request it answers?",
"options": [
"The tool name",
"The tool_use_id",
"The order of messages only",
"The model name"
],
"answer": 1,
"why": "Each tool_use block has an id, repeated in the tool_result."
},
{
"q": "A tool raises an exception. What should the agent loop do?",
"options": [
"Crash",
"Return the error to the model as the tool's result",
"Retry for ever",
"Ignore the call"
],
"answer": 1,
"why": "The model can often recover: fix its input, try another way, or explain."
},
{
"q": "What should stop an agent from refunding a million dollars?",
"options": [
"A firm sentence in the prompt",
"A limit enforced inside the refund tool, and human approval",
"A lower temperature",
"A bigger model"
],
"answer": 1,
"why": "Safety must come from what the tools can do, not from instructions."
}
],
"llm/06-rag-and-evaluation": [
{
"q": "What does RAG add to a prompt?",
"options": [
"More instructions",
"The few passages relevant to the question, found by search",
"A bigger model",
"The model's training data"
],
"answer": 1,
"why": "Retrieve first, then generate from what was retrieved."
},
{
"q": "Two texts with similar meaning have embeddings whose cosine similarity is close to ...",
"options": [
"1",
"0",
"-1"
],
"answer": 0,
"why": "Similar meaning, similar direction: a cosine near 1."
},
{
"q": "Why do chunks overlap?",
"options": [
"To use more storage",
"So that a sentence cut at a border is complete in one of them",
"To confuse the model",
"It is required by vector databases"
],
"answer": 1,
"why": "Overlap protects content that sits on a boundary."
},
{
"q": "An answer is wrong because the right passage was never retrieved. What needs fixing first?",
"options": [
"The model",
"The retrieval step",
"The temperature",
"The max_tokens"
],
"answer": 1,
"why": "Look at what was retrieved before changing the prompt or the model."
}
],
"mongodb/01-documents-and-crud": [
{
"q": "What is the MongoDB word for a row?",
"options": [
"Collection",
"Document",
"Field",
"Record set"
],
"answer": 1,
"why": "A collection holds documents, as a table holds rows."
},
{
"q": "Which field does every document have?",
"options": [
"id",
"_id",
"key",
"uuid"
],
"answer": 1,
"why": "_id is the primary key. MongoDB creates an ObjectId if you give none."
},
{
"q": "What does updateOne({title: \"Dune\"}, {$set: {price: 9}}) do to the other fields of the document?",
"options": [
"Removes them",
"Leaves them unchanged",
"Sets them to null",
"Copies them"
],
"answer": 1,
"why": "$set changes only the fields it names."
},
{
"q": "What does deleteMany({}) delete?",
"options": [
"Nothing",
"One document",
"Every document in the collection",
"The database"
],
"answer": 2,
"why": "An empty filter matches everything."
}
],
"mongodb/02-queries": [
{
"q": "Which filter finds books with a price above 10?",
"options": [
"{ price: > 10 }",
"{ price: { $gt: 10 } }",
"{ $gt: { price: 10 } }",
"{ price: \"> 10\" }"
],
"answer": 1,
"why": "The operator goes inside a document that is the value of the field."
},
{
"q": "A document has tags: [\"sf\", \"classic\"]. Does { tags: \"sf\" } match it?",
"options": [
"Yes",
"No"
],
"answer": 0,
"why": "A filter on an array matches when any element matches."
},
{
"q": "How do you filter on the field shop inside stock?",
"options": [
"{ stock.shop: 1 }",
"{ \"stock.shop\": 1 }",
"{ stock: shop: 1 }",
"{ stock->shop: 1 }"
],
"answer": 1,
"why": "Dot notation, in quotes."
},
{
"q": "In a projection, how do you leave out _id?",
"options": [
"It is left out by default",
"_id: 0",
"_id: false only",
"hide: \"_id\""
],
"answer": 1,
"why": "_id is included unless you set it to 0."
}
],
"mongodb/03-updates": [
{
"q": "Why use $inc in place of reading a number, adding one, and writing it back?",
"options": [
"It is shorter",
"It is one step inside the database, so concurrent updates are not lost",
"It is the only way",
"It creates an index"
],
"answer": 1,
"why": "Read-modify-write in the application can lose updates when two clients do it at once."
},
{
"q": "Which operator adds a value to an array only if it is not already there?",
"options": [
"$push",
"$addToSet",
"$pull",
"$set"
],
"answer": 1,
"why": "$addToSet treats the array as a set."
},
{
"q": "What does upsert: true do when no document matches the filter?",
"options": [
"Nothing",
"Throws an error",
"Creates the document",
"Updates all documents"
],
"answer": 2,
"why": "Upsert means update, or insert if there is nothing to update."
},
{
"q": "updateOne matches 5 documents. How many does it change?",
"accept": [
"1"
],
"why": "updateOne stops at the first match. Use updateMany for all."
}
],
"mongodb/04-aggregation": [
{
"q": "Which stage is like WHERE in SQL?",
"options": [
"$group",
"$match",
"$project",
"$unwind"
],
"answer": 1,
"why": "$match keeps the documents that fit a filter."
},
{
"q": "What does $unwind do to a document with an array of 3 elements?",
"options": [
"Deletes the array",
"Produces 3 documents, one per element",
"Sorts the array",
"Counts the elements"
],
"answer": 1,
"why": "Each element gets its own copy of the document."
},
{
"q": "In { $group: { _id: \"$customer\" } }, what does the $ mean?",
"options": [
"A variable",
"The value of the field customer",
"A regular expression",
"An operator"
],
"answer": 1,
"why": "A string starting with $ is a field reference."
},
{
"q": "Where should $match usually go in a pipeline?",
"options": [
"Last",
"First",
"After $group",
"It does not matter"
],
"answer": 1,
"why": "Filtering early lets MongoDB use an index and gives later stages less work."
}
],
"mongodb/05-indexes-and-schema": [
{
"q": "In explain output, which stage means the whole collection was read?",
"options": [
"IXSCAN",
"COLLSCAN",
"FETCH",
"SORT"
],
"answer": 1,
"why": "COLLSCAN is a collection scan: no index was used."
},
{
"q": "An index on { customer: 1, date: -1 } exists. Which query can NOT use it well?",
"options": [
"find({customer: 'ada'})",
"find({customer: 'ada'}).sort({date: -1})",
"find({date: '2025-01-04'})"
],
"answer": 2,
"why": "A compound index is used from its first field. date alone is not a prefix."
},
{
"q": "Order lines belong to exactly one order and are always read with it. Embed or reference?",
"options": [
"Embed",
"Reference"
],
"answer": 0,
"why": "Data used together, with one parent and a small bounded size, is embedded."
},
{
"q": "What guarantees that no two users share an email, even with simultaneous sign-ups?",
"options": [
"Checking with find first",
"A unique index",
"A longer password",
"A transaction log"
],
"answer": 1,
"why": "Only the database can enforce it atomically."
}
],
"redis/01-keys-and-strings": [
{
"q": "Where does Redis keep its data?",
"options": [
"On disk only",
"In memory",
"In the browser",
"In a SQL table"
],
"answer": 1,
"why": "Redis is an in-memory store, which is why it is so fast."
},
{
"q": "TTL returns -1. What does that mean?",
"options": [
"The key does not exist",
"The key exists and never expires",
"One second is left",
"An error"
],
"answer": 1,
"why": "-1 means no expiry. -2 means the key does not exist."
},
{
"q": "What does INCR do on a key that does not exist?",
"options": [
"An error",
"Sets it to 1",
"Sets it to 0",
"Nothing"
],
"answer": 1,
"why": "It starts from 0 and adds 1."
},
{
"q": "Why is KEYS * dangerous on a busy server?",
"options": [
"It deletes keys",
"It blocks every other command while it scans all keys",
"It uses the network",
"It changes TTLs"
],
"answer": 1,
"why": "Redis runs one command at a time, so a slow command stalls everything. Use SCAN."
}
],
"redis/02-hashes-lists-sets": [
{
"q": "Which structure fits an object with fields, such as a user?",
"options": [
"String",
"Hash",
"List",
"Set"
],
"answer": 1,
"why": "A hash stores fields and values under one key."
},
{
"q": "For a first-in, first-out queue you add with RPUSH. Which command takes the next job?",
"options": [
"RPOP",
"LPOP",
"LRANGE",
"LLEN"
],
"answer": 1,
"why": "Add on one end, take from the other."
},
{
"q": "SADD tags redis is run twice. How many members does the set have?",
"accept": [
"1"
],
"why": "A set holds each value at most once."
},
{
"q": "Which command gives the members that two sets share?",
"options": [
"SUNION",
"SDIFF",
"SINTER",
"SCARD"
],
"answer": 2,
"why": "SINTER is the intersection."
}
],
"redis/03-sorted-sets": [
{
"q": "What decides the order of a sorted set?",
"options": [
"Insertion order",
"The score of each member",
"The length of the member",
"Nothing: it is unordered"
],
"answer": 1,
"why": "Members are kept ordered by score."
},
{
"q": "ZADD board 100 ada is followed by ZADD board 250 ada. What happens?",
"options": [
"ada is in the set twice",
"ada's score becomes 250",
"An error",
"The score becomes 350"
],
"answer": 1,
"why": "Members are unique. Adding again updates the score. ZINCRBY would add."
},
{
"q": "Which command gives the top three scores, highest first?",
"options": [
"ZRANGE board 0 2",
"ZREVRANGE board 0 2",
"ZSCORE board 3",
"ZCARD board"
],
"answer": 1,
"why": "ZRANGE goes from the lowest score. ZREVRANGE goes from the highest."
},
{
"q": "The best player has which ZREVRANK?",
"accept": [
"0"
],
"why": "Ranks count from 0."
}
],
"redis/04-caching": [
{
"q": "In cache-aside, what happens on a miss?",
"options": [
"An error is returned",
"The source is asked, and the answer is stored in the cache",
"The cache is emptied",
"Nothing"
],
"answer": 1,
"why": "The application falls back to the source and fills the cache for next time."
},
{
"q": "The data in the database changes. What is the simple, safe thing to do with its cache key?",
"options": [
"Leave it",
"Delete it",
"Double its TTL",
"Rename it"
],
"answer": 1,
"why": "Delete on write. The next read reloads the fresh value."
},
{
"q": "Why cache the answer 'this id does not exist'?",
"options": [
"To save memory",
"So that repeated requests for missing ids do not all hit the database",
"It is required by Redis",
"To log errors"
],
"answer": 1,
"why": "Otherwise every request for a missing id is a miss. This is cache penetration."
},
{
"q": "Many requests miss the same expired key at once and all run the slow query. What is this called?",
"options": [
"A deadlock",
"A cache stampede",
"An eviction",
"A hit"
],
"answer": 1,
"why": "Also called a thundering herd. Jitter on TTLs and a rebuild lock soften it."
}
],
"redis/05-transactions-pubsub-limits": [
{
"q": "A command inside MULTI ... EXEC fails while running. What happens to the others?",
"options": [
"They are rolled back",
"They still take effect",
"The server stops",
"They are retried"
],
"answer": 1,
"why": "Redis has no rollback. MULTI guarantees only that nothing else runs in between."
},
{
"q": "A message is published on a pub/sub channel while no one is subscribed. What happens to it?",
"options": [
"It is stored",
"It is lost",
"It is retried",
"It goes to a queue"
],
"answer": 1,
"why": "Pub/sub is fire and forget. Use a stream or a list for work that must not be lost."
},
{
"q": "In the fixed-window rate limiter, when is EXPIRE called?",
"options": [
"On every request",
"Only when the counter was just created",
"Never",
"When the limit is reached"
],
"answer": 1,
"why": "The window starts with the first request. Resetting the expiry each time would keep the window open for ever."
},
{
"q": "Which structure gives a durable queue with several workers and acknowledgements?",
"options": [
"A string",
"Pub/sub",
"A stream",
"A set"
],
"answer": 2,
"why": "Streams keep messages, and consumer groups track what each worker has finished."
}
],
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
"node/01-runtime-and-processes": [
{
"q": "How many threads run your JavaScript in a Node server?",
"options": [
"One per request",
"One",
"One per CPU core",
"It depends on the load"
],
"answer": 1,
"why": "Your code runs on one thread. I/O is handed to the system and comes back through the event loop."
},
{
"q": "In what order do these print?",
"options": [
"A B C D",
"A D C B",
"A C D B",
"A D B C"
],
"answer": 1,
"why": "Synchronous code first, then promise callbacks, then timers.",
"code": "console.log(\"A\");\nsetTimeout(() => console.log(\"B\"), 0);\nPromise.resolve().then(() => console.log(\"C\"));\nconsole.log(\"D\");"
},
{
"q": "process.env.DEBUG is the string \"false\". What is `if (process.env.DEBUG)`?",
"options": [
"false",
"true"
],
"answer": 1,
"why": "Environment variables are strings, and a non-empty string is truthy."
},
{
"q": "Why avoid readFileSync in a request handler?",
"options": [
"It is deprecated",
"It blocks the single thread, so all other requests wait",
"It cannot read large files",
"It returns a promise"
],
"answer": 1,
"why": "Synchronous I/O stops the event loop for everyone."
}
],
"node/02-files-and-paths": [
{
"q": "Which error code means 'no such file or directory'?",
"options": [
"EEXIST",
"ENOENT",
"EACCES",
"EISDIR"
],
"answer": 1,
"why": "ENOENT: error, no entry."
},
{
"q": "A relative path such as \"data.json\" is resolved from ...",
"options": [
"the folder of the source file",
"the folder the program was started in",
"the home folder",
"the root"
],
"answer": 1,
"why": "process.cwd() decides. Use import.meta.dirname for files next to your code."
},
{
"q": "Why write to a temporary file and then rename it?",
"options": [
"It is faster",
"A rename is atomic, so readers never see a half-written file",
"It compresses the data",
"It is required on Linux"
],
"answer": 1,
"why": "A crash in the middle of a write leaves the original intact."
},
{
"q": "A user supplies the file name ../../etc/passwd. What is this attack called?",
"options": [
"SQL injection",
"Path traversal",
"Cross-site scripting",
"A stampede"
],
"answer": 1,
"why": "Resolve the path and check that it stays inside the intended folder."
}
],
"node/03-events-and-streams": [
{
"q": "When does emitter.emit(\"x\") call the listeners?",
"options": [
"Later, on the event loop",
"Immediately, one after another",
"In another thread",
"Only once"
],
"answer": 1,
"why": "emit is synchronous."
},
{
"q": "Why use a stream to process a 5 GB file?",
"options": [
"Streams are encrypted",
"Data arrives in chunks, so memory use stays small",
"It is the only API for files",
"It sorts the file"
],
"answer": 1,
"why": "readFile would need the whole file in memory."
},
{
"q": "Is a chunk of a text stream always a whole line?",
"options": [
"Yes",
"No: it can end anywhere"
],
"answer": 1,
"why": "Keep the unfinished tail and join it with the next chunk, or use readline."
},
{
"q": "Which function connects streams and handles errors and clean-up?",
"options": [
"pipe",
"pipeline",
"connect",
"join"
],
"answer": 1,
"why": "pipeline from node:stream/promises forwards errors and closes every stream."
}
],
"node/04-building-an-api": [
{
"q": "What must a middleware do to let the request continue?",
"options": [
"Return true",
"Call next()",
"Call res.end()",
"Nothing"
],
"answer": 1,
"why": "next() passes the request to the following middleware or route."
},
{
"q": "How does Express recognise an error-handling middleware?",
"options": [
"Its name is errorHandler",
"It has four parameters",
"It is added first",
"It returns a promise"
],
"answer": 1,
"why": "The signature (error, req, res, next) marks it as an error handler."
},
{
"q": "A client is logged in and asks for something it may not see. Which status?",
"options": [
"400",
"401",
"403",
"404"
],
"answer": 2,
"why": "401 means not authenticated. 403 means authenticated, and not allowed."
},
{
"q": "Why cap the limit of a list endpoint?",
"options": [
"To save typing",
"So that one request cannot ask for millions of rows",
"Because HTTP requires it",
"To sort faster"
],
"answer": 1,
"why": "An unbounded list is a performance problem and an easy way to overload the server."
}
],
"node/05-authentication": [
{
"q": "Why is SHA-256 a poor choice for storing passwords?",
"options": [
"It is broken",
"It is fast, so guessing is cheap, and it has no salt",
"It is too long",
"It cannot be stored"
],
"answer": 1,
"why": "Password hashing must be slow and salted: scrypt, bcrypt or argon2."
},
{
"q": "What is the purpose of a salt?",
"options": [
"To encrypt the password",
"To make equal passwords hash differently",
"To make hashing faster",
"To hide the user name"
],
"answer": 1,
"why": "A per-user random salt defeats precomputed tables."
},
{
"q": "Can a client read the payload of a signed token?",
"options": [
"No, it is encrypted",
"Yes, it is only encoded"
],
"answer": 1,
"why": "Signing proves who made it. It does not hide the content."
},
{
"q": "Which status code means 'you are not authenticated'?",
"options": [
"400",
"401",
"403",
"404"
],
"answer": 1,
"why": "401: unknown who you are. 403: known, and not allowed."
}
],
"node/06-structure-and-testing": [
{
"q": "Which layer should know about HTTP status codes?",
"options": [
"The repository",
"The service",
"The route",
"All of them"
],
"answer": 2,
"why": "Routes translate between HTTP and the service. Services hold the rules and know nothing about HTTP."
},
{
"q": "Why pass the clock into a service as a parameter?",
"options": [
"It is faster",
"So that tests can control the time",
"Because Date is deprecated",
"To save memory"
],
"answer": 1,
"why": "Anything slow, random or external should be injected, so tests can replace it."
},
{
"q": "Which assertion checks that an async function rejects?",
"options": [
"assert.throws",
"assert.rejects",
"assert.equal",
"assert.ok"
],
"answer": 1,
"why": "assert.rejects awaits the promise and expects a rejection."
},
{
"q": "What should a server do when it receives SIGTERM?",
"options": [
"Exit at once",
"Stop accepting new requests, finish the running ones, then exit",
"Ignore it",
"Restart"
],
"answer": 1,
"why": "A graceful shutdown avoids dropping requests during a deployment."
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
],
"gamedev/01-the-game-loop": [
{
"q": "What are the three steps of a game loop?",
"options": [
"Load, save, quit",
"Read input, update, draw",
"Compile, link, run",
"Request, response, render"
],
"answer": 1,
"why": "Every frame: input, update the world, draw the world."
},
{
"q": "On a canvas, in which direction does y grow?",
"options": [
"Up",
"Down"
],
"answer": 1,
"why": "The origin is the top left corner, and y grows downwards."
},
{
"q": "Why multiply speeds by delta time?",
"options": [
"To make the game harder",
"So the game runs at the same speed on every screen",
"To save memory",
"It is required by the canvas"
],
"answer": 1,
"why": "Movement per second, not per frame, is independent of the frame rate."
},
{
"q": "A ball moves at 120 pixels per second. How many pixels does it move in a frame of 0.05 seconds?",
"accept": [
"6"
],
"why": "120 times 0.05."
}
],
"gamedev/02-input-and-movement": [
{
"q": "Why record which keys are held, instead of moving in the keydown event?",
"options": [
"Events are slow",
"Key repeat is jerky and differs between machines",
"keydown does not exist",
"To save memory"
],
"answer": 1,
"why": "The game reads the key state every frame and moves by speed times dt."
},
{
"q": "Right and down are held, giving the direction (1, 1). What is its length, to two decimals?",
"accept": [
"1.41"
],
"why": "The square root of 2. Without normalising, diagonal movement is 41% faster."
},
{
"q": "What does normalising a vector do?",
"options": [
"Sets it to zero",
"Scales it to length 1, keeping its direction",
"Rounds it",
"Reverses it"
],
"answer": 1,
"why": "Divide each part by the vector's length."
},
{
"q": "What stops a player from jumping again in mid-air?",
"options": [
"Gravity",
"Checking that the body is on the ground",
"The frame rate",
"Friction"
],
"answer": 1,
"why": "A jump starts only when onGround is true."
}
],
"gamedev/03-collisions": [
{
"q": "What is a hitbox?",
"options": [
"The picture of a sprite",
"A simple invisible shape used for collision tests",
"A sound effect",
"A health bar"
],
"answer": 1,
"why": "Collisions are tested between simple shapes, not pixels."
},
{
"q": "Two circles have radii 10 and 5, with centres 14 apart. Do they overlap?",
"options": [
"Yes",
"No"
],
"answer": 0,
"why": "14 is less than 10 + 5."
},
{
"q": "Why compare squared distances?",
"options": [
"It is more exact",
"It avoids a slow square root and gives the same answer",
"It is required",
"It prevents tunnelling"
],
"answer": 1,
"why": "If d < r then d*d < r*r, for positive numbers."
},
{
"q": "A fast bullet passes through a thin wall without a collision being found. What is this called?",
"options": [
"Clipping",
"Tunnelling",
"Lag",
"Overflow"
],
"answer": 1,
"why": "The bullet was never inside the wall on any frame."
}
],
"gamedev/04-game-state": [
{
"q": "Why one `mode` variable instead of several booleans?",
"options": [
"It uses less memory",
"Booleans allow combinations that make no sense",
"It is faster",
"JavaScript requires it"
],
"answer": 1,
"why": "One variable with a fixed set of values cannot be in an impossible combination."
},
{
"q": "In a state machine, what happens to an event with no rule in the current state?",
"options": [
"An error",
"Nothing",
"The game restarts",
"It is queued"
],
"answer": 1,
"why": "Only the arrows that exist can be followed."
},
{
"q": "With level = 1 + floor(score / 100), which level is a score of 250?",
"accept": [
"3"
],
"why": "floor(250 / 100) is 2, plus 1."
},
{
"q": "Why pass the random function into update as a parameter?",
"options": [
"It is faster",
"So tests can supply a predictable one",
"Math.random is deprecated",
"To seed the game"
],
"answer": 1,
"why": "Logic that depends on hidden randomness cannot be tested."
}
],
"gamedev/05-a-complete-game": [
{
"q": "In update, what comes first: moving things or checking collisions?",
"options": [
"Checking collisions",
"Moving things"
],
"answer": 1,
"why": "Move first, so the collision test uses this frame's positions."
},
{
"q": "What is a sprite sheet?",
"options": [
"A list of high scores",
"One image holding many pictures in a grid",
"A CSS file",
"A sound format"
],
"answer": 1,
"why": "drawImage cuts one cell out of the sheet."
},
{
"q": "Why do browsers stay silent until the player presses something?",
"options": [
"A bug",
"They block sound before a user interaction",
"Audio needs a server",
"The canvas has no speakers"
],
"answer": 1,
"why": "Start the game from a 'press any key' screen."
},
{
"q": "What is the best first game to make?",
"options": [
"An open-world role-playing game",
"A small one you can finish",
"A multiplayer shooter",
"A game engine"
],
"answer": 1,
"why": "Finished small games teach more than unfinished big ones."
}
],
"devops/01-environments-and-config": [
{
"q": "What should differ between staging and production?",
"options": [
"The code",
"The build artifact",
"Only the configuration",
"The programming language"
],
"answer": 2,
"why": "Build once, and move the same artifact through the environments."
},
{
"q": "Where do database passwords belong?",
"options": [
"In the source code",
"In the Git repository, in a private file",
"In a secret store, passed in at run time",
"In the Docker image"
],
"answer": 2,
"why": "Secrets never go into Git or images."
},
{
"q": "A required setting is missing. When should the service complain?",
"options": [
"On the first request that needs it",
"At start-up",
"Never",
"After a day"
],
"answer": 1,
"why": "Failing at start-up is noticed by the deployment, not by a customer."
},
{
"q": "A secret was committed by mistake and then removed in the next commit. Is it safe?",
"options": [
"Yes",
"No: it is in the history, so rotate it"
],
"answer": 1,
"why": "Git keeps every version. Create a new secret and disable the old one."
}
],
"devops/02-continuous-integration": [
{
"q": "What tells a CI system that a step failed?",
"options": [
"The word ERROR in the output",
"A non-zero exit code",
"A red colour",
"A missing log"
],
"answer": 1,
"why": "The exit code is the interface: 0 is success, anything else is failure."
},
{
"q": "Why run the linter before the tests?",
"options": [
"It is more important",
"It is fast, so mistakes are found sooner",
"Tests need it",
"It is alphabetical"
],
"answer": 1,
"why": "Fail fast: order the steps from quick to slow."
},
{
"q": "What does a CI machine start with on each run?",
"options": [
"The files of the last run",
"A clean, empty machine",
"Your laptop's files",
"A copy of production"
],
"answer": 1,
"why": "A fresh machine proves the project does not depend on anything left lying around."
},
{
"q": "A test fails at random one run in ten. What should the team do?",
"options": [
"Re-run until green",
"Fix or remove it now",
"Ignore red pipelines",
"Disable CI"
],
"answer": 1,
"why": "Flaky tests teach people to ignore failures."
}
],
"devops/03-releases-and-versions": [
{
"q": "Version 2.4.1 gets a new, compatible feature. What is the next version?",
"accept": [
"2.5.0"
],
"why": "A minor bump, and the patch number goes back to 0."
},
{
"q": "Which is newer?",
"options": [
"1.9.0",
"1.10.0"
],
"answer": 1,
"why": "Compare the parts as numbers: 10 is greater than 9."
},
{
"q": "What does `feat!: ...` in a commit message signal?",
"options": [
"An urgent feature",
"A breaking change: a major release",
"A failed build",
"A draft"
],
"answer": 1,
"why": "The exclamation mark marks a change that is not backwards compatible."
},
{
"q": "Why not deploy the image tag `latest`?",
"options": [
"It is slower",
"Nobody can tell which build it is, or roll back to the previous one",
"It costs more",
"Docker forbids it"
],
"answer": 1,
"why": "Deploy exact, immutable versions."
}
],
"devops/04-deployments": [
{
"q": "What does a readiness check answer?",
"options": [
"Is the process running?",
"Can this instance serve requests right now?",
"Is the disk full?",
"Who deployed it?"
],
"answer": 1,
"why": "An instance can be alive and not ready, for example while it starts."
},
{
"q": "In a rolling deployment, what is true for a while?",
"options": [
"The service is down",
"Old and new versions run at the same time",
"Only the new version runs",
"No version runs"
],
"answer": 1,
"why": "So both versions must work with the same database and the same clients."
},
{
"q": "What is a canary release?",
"options": [
"Deploying at night",
"Sending a small share of real traffic to the new version first",
"Running two full environments",
"A release with no tests"
],
"answer": 1,
"why": "If the canary shows problems, only a few users were affected."
},
{
"q": "A deployment is causing errors for users. What comes first?",
"options": [
"Find the root cause",
"Roll back",
"Write a report",
"Add more servers"
],
"answer": 1,
"why": "Restore service first. Investigate afterwards, calmly."
}
],
"devops/05-observability": [
{
"q": "What are the three kinds of observability signal?",
"options": [
"Logs, metrics, traces",
"CPU, memory, disk",
"Unit, integration, end to end",
"Push, pull, poll"
],
"answer": 0,
"why": "Events, numbers over time, and the path of one request."
},
{
"q": "p95 latency is 300 ms. What does that mean?",
"options": [
"The average is 300 ms",
"95% of requests are faster than 300 ms",
"5% of requests are faster",
"The slowest request took 300 ms"
],
"answer": 1,
"why": "One request in twenty is slower than the p95."
},
{
"q": "Values sorted: 10 20 30 40 50 60 70 80 90 100. What is the p50 by nearest rank?",
"accept": [
"50"
],
"why": "ceil(0.5 * 10) = 5, and the 5th value is 50."
},
{
"q": "Which is a good reason to wake someone at night?",
"options": [
"CPU at 80%",
"The error rate users see has tripled",
"A disk at 60%",
"A deployment finished"
],
"answer": 1,
"why": "Alert on symptoms that users feel and that someone can act on."
}
]
};
