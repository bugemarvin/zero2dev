window.Z2D_CURRICULUM = {
 "tracks": [
  {
   "id": "start",
   "title": "Start here",
   "blurb": "What a program is, the terminal, files, pipes and your first scripts.",
   "lessons": [
    {
     "id": "start/01-how-programs-run",
     "title": "How programs run",
     "summary": "What a program actually is, and what happens between typing code and seeing a result.",
     "exercises": []
    },
    {
     "id": "start/02-install",
     "title": "Install your tools",
     "summary": "Get a Linux terminal, a compiler, Git and Python, with one script.",
     "exercises": []
    },
    {
     "id": "start/03-terminal",
     "title": "The terminal",
     "summary": "Type commands instead of clicking. Move around, look at files, and make folders.",
     "exercises": [
      {
       "id": "start/01-folders",
       "title": "Build a project folder"
      }
     ]
    },
    {
     "id": "start/04-files-and-paths",
     "title": "Files and paths",
     "summary": "How to name any file on the machine, read it, match many files at once, and make a script runnable.",
     "exercises": [
      {
       "id": "start/02-tidy-up",
       "title": "Tidy a messy folder"
      }
     ]
    },
    {
     "id": "start/05-pipes-and-redirection",
     "title": "Pipes and redirection",
     "summary": "Send output into files, and chain small commands together to answer real questions about data.",
     "exercises": [
      {
       "id": "start/03-log-pipes",
       "title": "Answer questions about a log"
      }
     ]
    },
    {
     "id": "start/06-shell-scripts",
     "title": "Shell scripts",
     "summary": "Put commands in a file and you have a program. Variables, arguments, decisions and loops in Bash.",
     "exercises": [
      {
       "id": "start/04-greet",
       "title": "Greet by name"
      },
      {
       "id": "start/05-sum",
       "title": "Add up numbers"
      }
     ]
    },
    {
     "id": "start/07-editor",
     "title": "Your editor and the work loop",
     "summary": "Set up VS Code, and learn the edit, run, check loop you will repeat for every exercise.",
     "exercises": []
    }
   ]
  },
  {
   "id": "git",
   "title": "Git",
   "blurb": "Save every step of your work, go back in time, and work with other people.",
   "lessons": [
    {
     "id": "git/01-first-commit",
     "title": "Your first commit",
     "summary": "Git takes snapshots of your project so you can always go back. Make a repository and save your first snapshot.",
     "exercises": [
      {
       "id": "git/01-first-commit",
       "title": "Make a repository and commit"
      }
     ]
    },
    {
     "id": "git/02-history-and-diff",
     "title": "History and diff",
     "summary": "Read the history, see exactly what changed, and keep junk files out of the repository.",
     "exercises": [
      {
       "id": "git/02-ignore-and-commit",
       "title": "Commit a change and ignore the junk"
      }
     ]
    },
    {
     "id": "git/03-branches",
     "title": "Branches",
     "summary": "Work on something new without touching the version that works.",
     "exercises": [
      {
       "id": "git/03-branches",
       "title": "Work on a branch"
      }
     ]
    },
    {
     "id": "git/04-merge",
     "title": "Merging",
     "summary": "Bring the work from one branch into another.",
     "exercises": [
      {
       "id": "git/04-merge",
       "title": "Merge two diverged branches"
      }
     ]
    },
    {
     "id": "git/05-conflicts",
     "title": "Merge conflicts",
     "summary": "When two branches change the same lines, Git asks you to decide. It looks alarming and is routine.",
     "exercises": [
      {
       "id": "git/05-conflict",
       "title": "Resolve a merge conflict"
      }
     ]
    },
    {
     "id": "git/06-remotes",
     "title": "Remotes and GitHub",
     "summary": "A remote is another copy of the repository. Clone it, push your commits to it, pull other people's commits from it.",
     "exercises": [
      {
       "id": "git/06-remotes",
       "title": "Clone, commit, push"
      }
     ]
    },
    {
     "id": "git/07-undoing",
     "title": "Undoing things",
     "summary": "Throw away an edit, unstage a file, fix the last commit, or reverse an old one. Pick the right tool for where the mistake is.",
     "exercises": [
      {
       "id": "git/07-undo",
       "title": "Three kinds of undo"
      }
     ]
    },
    {
     "id": "git/08-rebase",
     "title": "Rebase",
     "summary": "Replay your commits on top of the latest work to keep history in a straight line.",
     "exercises": [
      {
       "id": "git/08-rebase",
       "title": "Rebase a branch"
      }
     ]
    },
    {
     "id": "git/09-pull-requests",
     "title": "The pull request workflow",
     "summary": "How teams actually use Git. A branch per change, a review, then a merge.",
     "exercises": [
      {
       "id": "git/09-feature-flow",
       "title": "A full feature-branch round trip"
      }
     ]
    }
   ]
  },
  {
   "id": "c",
   "title": "C",
   "blurb": "How the machine really works: memory, pointers, and building programs from several files.",
   "lessons": [
    {
     "id": "c/01-hello",
     "title": "Hello, C",
     "summary": "Write, compile and run your first C program, and learn to read what the compiler tells you.",
     "exercises": [
      {
       "id": "c/01-hello",
       "title": "Hello, C"
      }
     ]
    },
    {
     "id": "c/02-types-and-variables",
     "title": "Types and variables",
     "summary": "Store numbers and characters, do arithmetic, and read input and print output with the right format.",
     "exercises": [
      {
       "id": "c/02-rectangle",
       "title": "Area and perimeter"
      },
      {
       "id": "c/03-average",
       "title": "Average of three"
      }
     ]
    },
    {
     "id": "c/03-control-flow",
     "title": "Control flow",
     "summary": "Make decisions with if and switch, and repeat work with while and for.",
     "exercises": [
      {
       "id": "c/04-fizzbuzz",
       "title": "FizzBuzz"
      },
      {
       "id": "c/05-collatz",
       "title": "Collatz steps"
      }
     ]
    },
    {
     "id": "c/04-functions",
     "title": "Functions",
     "summary": "Give a piece of code a name, inputs and a result, so you can use it again and test it on its own.",
     "exercises": [
      {
       "id": "c/06-functions",
       "title": "A small maths library"
      }
     ]
    },
    {
     "id": "c/05-arrays",
     "title": "Arrays",
     "summary": "Hold many values of the same type side by side, and pass them to functions.",
     "exercises": [
      {
       "id": "c/07-arrays",
       "title": "Array functions"
      }
     ]
    },
    {
     "id": "c/06-strings",
     "title": "Strings",
     "summary": "In C a string is an array of characters with a zero at the end. Everything about strings follows from that.",
     "exercises": [
      {
       "id": "c/08-strings",
       "title": "String functions"
      }
     ]
    },
    {
     "id": "c/07-pointers",
     "title": "Pointers",
     "summary": "A pointer holds the address of another variable. It is how C shares and changes data across functions.",
     "exercises": [
      {
       "id": "c/09-pointers",
       "title": "Pointer functions"
      }
     ]
    },
    {
     "id": "c/08-memory",
     "title": "Memory, malloc and free",
     "summary": "Ask for memory while the program runs, and give it back. This is where C asks the most of you.",
     "exercises": [
      {
       "id": "c/10-heap",
       "title": "Functions that allocate"
      }
     ]
    },
    {
     "id": "c/09-structs",
     "title": "Structs",
     "summary": "Group related values into one type of your own.",
     "exercises": [
      {
       "id": "c/11-structs",
       "title": "Points and students"
      }
     ]
    },
    {
     "id": "c/10-files",
     "title": "Files and command-line arguments",
     "summary": "Read and write files, take arguments from the command line, and report errors properly.",
     "exercises": [
      {
       "id": "c/12-wc",
       "title": "Count lines, words and characters"
      }
     ]
    },
    {
     "id": "c/11-make-and-headers",
     "title": "Headers and Makefiles",
     "summary": "Split a program across several files, and let make rebuild only what changed.",
     "exercises": [
      {
       "id": "c/13-makefile",
       "title": "Write a Makefile"
      }
     ]
    },
    {
     "id": "c/12-debugging",
     "title": "Debugging",
     "summary": "Find bugs on purpose, with a method and with tools, in place of staring at the code and hoping.",
     "exercises": [
      {
       "id": "c/14-fix-the-bugs",
       "title": "Fix the bugs"
      }
     ]
    }
   ]
  },
  {
   "id": "python",
   "title": "Python",
   "blurb": "The fastest way to get things done: from first functions to classes, generators, tests and type hints.",
   "lessons": [
    {
     "id": "python/01-basics",
     "title": "Python basics",
     "summary": "Values, variables, text, decisions, and your first functions.",
     "exercises": [
      {
       "id": "python/01-first-functions",
       "title": "First functions"
      },
      {
       "id": "python/02-leap-year",
       "title": "Leap years and grades"
      }
     ]
    },
    {
     "id": "python/02-loops-and-collections",
     "title": "Loops and collections",
     "summary": "Lists, tuples, dictionaries and sets, and the loops that walk through them.",
     "exercises": [
      {
       "id": "python/03-list-tools",
       "title": "List tools"
      },
      {
       "id": "python/04-word-count",
       "title": "Count words"
      }
     ]
    },
    {
     "id": "python/03-functions",
     "title": "Functions in depth",
     "summary": "Default values, keyword arguments, several return values, scope, and passing functions around.",
     "exercises": [
      {
       "id": "python/05-functions",
       "title": "Flexible functions"
      }
     ]
    },
    {
     "id": "python/04-files",
     "title": "Files",
     "summary": "Read and write text files safely, and work with paths, CSV and JSON.",
     "exercises": [
      {
       "id": "python/06-files",
       "title": "Read and write score files"
      }
     ]
    },
    {
     "id": "python/05-errors",
     "title": "Errors and exceptions",
     "summary": "Read a traceback, catch the errors you can handle, and raise your own when input is wrong.",
     "exercises": [
      {
       "id": "python/07-errors",
       "title": "Handle and raise errors"
      }
     ]
    },
    {
     "id": "python/06-modules-and-venv",
     "title": "Modules, packages and virtual environments",
     "summary": "Use the standard library, split your code into files, and install other people's code without making a mess.",
     "exercises": [
      {
       "id": "python/08-stdlib",
       "title": "Use the standard library"
      }
     ]
    },
    {
     "id": "python/07-classes",
     "title": "Classes",
     "summary": "Bundle data with the functions that work on it, and make your own types behave like built-in ones.",
     "exercises": [
      {
       "id": "python/09-classes",
       "title": "A bank account and a vector"
      }
     ]
    },
    {
     "id": "python/08-iterators-and-generators",
     "title": "Iterators and generators",
     "summary": "Produce values one at a time, only when they are asked for.",
     "exercises": [
      {
       "id": "python/10-generators",
       "title": "Write generators"
      }
     ]
    },
    {
     "id": "python/09-testing",
     "title": "Testing",
     "summary": "Write code that checks your code, so you can change things without fear.",
     "exercises": [
      {
       "id": "python/11-testing",
       "title": "Write tests that catch bugs"
      }
     ]
    },
    {
     "id": "python/10-typing",
     "title": "Type hints",
     "summary": "Say what types your functions expect and return, so that tools catch mistakes before the program runs.",
     "exercises": [
      {
       "id": "python/12-typing",
       "title": "Annotated functions and a dataclass"
      }
     ]
    }
   ]
  },
  {
   "id": "dsa",
   "title": "Data structures and algorithms",
   "blurb": "From Big-O to graphs, dynamic programming and segment trees. Solve the exercises in any language.",
   "lessons": [
    {
     "id": "dsa/01-big-o",
     "title": "Big-O and how to measure code",
     "summary": "A way to say how the running time of code grows as its input grows, without a stopwatch.",
     "exercises": [
      {
       "id": "dsa/01-max-of-list",
       "title": "Largest number"
      }
     ]
    },
    {
     "id": "dsa/02-arrays-and-two-pointers",
     "title": "Arrays and two pointers",
     "summary": "How arrays work underneath, and a technique that turns many O(n²) searches into O(n).",
     "exercises": [
      {
       "id": "dsa/02-pair-with-sum",
       "title": "Pair with a given sum"
      }
     ]
    },
    {
     "id": "dsa/03-linked-lists",
     "title": "Linked lists",
     "summary": "A chain of nodes, each pointing to the next. Cheap to insert into, slow to index.",
     "exercises": [
      {
       "id": "dsa/03-linked-list",
       "title": "Build a linked list"
      }
     ]
    },
    {
     "id": "dsa/04-stacks-and-queues",
     "title": "Stacks and queues",
     "summary": "Two restricted lists that turn up everywhere. One serves the newest item first, the other the oldest.",
     "exercises": [
      {
       "id": "dsa/04-balanced-brackets",
       "title": "Balanced brackets"
      },
      {
       "id": "dsa/05-rpn",
       "title": "Evaluate postfix expressions"
      }
     ]
    },
    {
     "id": "dsa/05-hashing",
     "title": "Hash tables",
     "summary": "The structure behind dictionaries and sets. Lookup, insert and delete in constant time on average.",
     "exercises": [
      {
       "id": "dsa/06-two-sum",
       "title": "Two sum"
      },
      {
       "id": "dsa/07-anagram-groups",
       "title": "Group anagrams"
      }
     ]
    },
    {
     "id": "dsa/06-recursion-and-backtracking",
     "title": "Recursion and backtracking",
     "summary": "Solve a problem by solving smaller copies of it, and explore every possibility in an organised way.",
     "exercises": [
      {
       "id": "dsa/08-permutations",
       "title": "All permutations"
      },
      {
       "id": "dsa/09-n-queens",
       "title": "Count the N queens solutions"
      }
     ]
    },
    {
     "id": "dsa/07-sorting",
     "title": "Sorting",
     "summary": "Simple sorts that are easy to write, fast sorts that scale, and how to choose.",
     "exercises": [
      {
       "id": "dsa/10-sort-by-score",
       "title": "Rank the students"
      },
      {
       "id": "dsa/11-count-inversions",
       "title": "Count inversions"
      }
     ]
    },
    {
     "id": "dsa/08-binary-search",
     "title": "Binary search",
     "summary": "Halve the search space at every step. Simple in idea, famously easy to get subtly wrong.",
     "exercises": [
      {
       "id": "dsa/12-lower-bound",
       "title": "First position not less than x"
      },
      {
       "id": "dsa/13-ship-capacity",
       "title": "Smallest ship that is fast enough"
      }
     ]
    },
    {
     "id": "dsa/09-trees-and-bst",
     "title": "Trees and binary search trees",
     "summary": "Data arranged in levels, and a tree that keeps its values in order for fast search.",
     "exercises": [
      {
       "id": "dsa/14-bst",
       "title": "Build a binary search tree"
      }
     ]
    },
    {
     "id": "dsa/10-heaps",
     "title": "Heaps and priority queues",
     "summary": "Always know the smallest item, with cheap inserts and removals.",
     "exercises": [
      {
       "id": "dsa/15-priority-queue",
       "title": "Build a min-heap"
      }
     ]
    },
    {
     "id": "dsa/11-graphs-bfs-dfs",
     "title": "Graphs, BFS and DFS",
     "summary": "Model anything that has connections, and explore it systematically in two ways.",
     "exercises": [
      {
       "id": "dsa/16-grid-path",
       "title": "Shortest path in a grid"
      },
      {
       "id": "dsa/17-components",
       "title": "Count connected components"
      }
     ]
    },
    {
     "id": "dsa/12-shortest-paths",
     "title": "Shortest paths with weights",
     "summary": "When edges have different costs, BFS is not enough. Dijkstra's algorithm, and what to use when it does not apply.",
     "exercises": [
      {
       "id": "dsa/18-dijkstra",
       "title": "Cheapest routes from node 1"
      }
     ]
    },
    {
     "id": "dsa/13-dynamic-programming",
     "title": "Dynamic programming",
     "summary": "When a recursive solution keeps solving the same subproblems, solve each one once and remember the answer.",
     "exercises": [
      {
       "id": "dsa/19-coin-change",
       "title": "Fewest coins"
      },
      {
       "id": "dsa/20-lcs",
       "title": "Longest common subsequence"
      }
     ]
    },
    {
     "id": "dsa/14-greedy",
     "title": "Greedy algorithms",
     "summary": "Take the choice that looks best right now and never look back. Fast and simple, when it is correct.",
     "exercises": [
      {
       "id": "dsa/21-meetings",
       "title": "Most meetings in one room"
      }
     ]
    },
    {
     "id": "dsa/15-tries",
     "title": "Tries",
     "summary": "A tree of characters that makes prefix questions fast. The structure behind autocomplete.",
     "exercises": [
      {
       "id": "dsa/22-prefix-count",
       "title": "Count words by prefix"
      }
     ]
    },
    {
     "id": "dsa/16-union-find",
     "title": "Union-find",
     "summary": "Keep track of which items belong to the same group while groups keep merging.",
     "exercises": [
      {
       "id": "dsa/23-union-find",
       "title": "Merge groups"
      }
     ]
    },
    {
     "id": "dsa/17-segment-trees",
     "title": "Segment trees",
     "summary": "Answer range questions and change single values, both in O(log n).",
     "exercises": [
      {
       "id": "dsa/24-range-sum",
       "title": "Range sums with updates"
      }
     ]
    }
   ]
  },
  {
   "id": "sql",
   "title": "SQL and PostgreSQL",
   "blurb": "Ask a database questions, design tables that reject bad data, and keep queries fast.",
   "lessons": [
    {
     "id": "sql/01-select",
     "title": "Tables and SELECT",
     "summary": "What a relational database is, and how to ask it for exactly the rows and columns you want.",
     "exercises": [
      {
       "id": "sql/01-select-where",
       "title": "Cheap fiction"
      }
     ]
    },
    {
     "id": "sql/02-sort-and-limit",
     "title": "Sorting, limiting and computed columns",
     "summary": "Put rows in order, take the first few, remove duplicates, and calculate new columns.",
     "exercises": [
      {
       "id": "sql/02-top-three",
       "title": "The three most expensive books"
      }
     ]
    },
    {
     "id": "sql/03-aggregates",
     "title": "Aggregates and GROUP BY",
     "summary": "Count, sum and average, for the whole table or for each group of rows.",
     "exercises": [
      {
       "id": "sql/03-genre-stats",
       "title": "Statistics per genre"
      }
     ]
    },
    {
     "id": "sql/04-joins",
     "title": "Joins",
     "summary": "Combine rows from several tables. The feature that makes a relational database relational.",
     "exercises": [
      {
       "id": "sql/04-books-with-authors",
       "title": "Recent books and their authors"
      },
      {
       "id": "sql/05-books-per-author",
       "title": "How many books per author"
      }
     ]
    },
    {
     "id": "sql/05-subqueries-and-ctes",
     "title": "Subqueries and CTEs",
     "summary": "Use the result of one query inside another, and name the steps of a long query.",
     "exercises": [
      {
       "id": "sql/06-above-average",
       "title": "Books above the average price"
      },
      {
       "id": "sql/07-never-ordered",
       "title": "Books nobody has ordered"
      },
      {
       "id": "sql/08-customer-spending",
       "title": "Who spent the most"
      }
     ]
    },
    {
     "id": "sql/06-changing-data",
     "title": "Changing data",
     "summary": "Add rows, change them and remove them, without wrecking the table by accident.",
     "exercises": [
      {
       "id": "sql/09-change-data",
       "title": "Insert, update, delete"
      }
     ]
    },
    {
     "id": "sql/07-schema-and-constraints",
     "title": "Designing tables",
     "summary": "Create tables with types and constraints, so that the database itself rejects bad data.",
     "exercises": [
      {
       "id": "sql/10-create-tables",
       "title": "Design two tables"
      }
     ]
    },
    {
     "id": "sql/08-indexes-and-explain",
     "title": "Indexes and EXPLAIN",
     "summary": "Why a query is slow, how an index fixes it, and how to see what the database is really doing.",
     "exercises": [
      {
       "id": "sql/11-indexes",
       "title": "Add the right indexes"
      }
     ]
    },
    {
     "id": "sql/09-transactions",
     "title": "Transactions",
     "summary": "Group several changes so that they all happen or none of them do.",
     "exercises": [
      {
       "id": "sql/12-transactions",
       "title": "Transfer money safely"
      }
     ]
    },
    {
     "id": "sql/10-window-functions-and-json",
     "title": "Window functions and JSON",
     "summary": "Rank and compare rows without collapsing them, and query flexible JSON data in PostgreSQL.",
     "exercises": [
      {
       "id": "sql/13-rank-in-genre",
       "title": "Rank books within their genre"
      },
      {
       "id": "sql/14-jsonb-logins",
       "title": "Count logins from JSON events"
      }
     ]
    }
   ]
  },
  {
   "id": "java",
   "title": "Java",
   "blurb": "A strictly typed, object-oriented language: classes, interfaces, collections, generics and streams.",
   "lessons": [
    {
     "id": "java/01-hello-jvm",
     "title": "Hello, Java",
     "summary": "How Java code becomes a running program, and the shape every Java program has.",
     "exercises": [
      {
       "id": "java/01-hello",
       "title": "Hello, Java"
      }
     ]
    },
    {
     "id": "java/02-types-and-control-flow",
     "title": "Types and control flow",
     "summary": "Variables with fixed types, text, input, and the statements that decide and repeat.",
     "exercises": [
      {
       "id": "java/02-number-stats",
       "title": "Statistics of the input"
      }
     ]
    },
    {
     "id": "java/03-methods",
     "title": "Methods",
     "summary": "Name a piece of work, give it typed inputs and a typed result, and call it from anywhere.",
     "exercises": [
      {
       "id": "java/03-methods",
       "title": "A class of static methods"
      }
     ]
    },
    {
     "id": "java/04-arrays-and-strings",
     "title": "Arrays and strings",
     "summary": "Fixed-size arrays, the loops that go with them, and efficient work with text.",
     "exercises": [
      {
       "id": "java/04-arrays-strings",
       "title": "Arrays and text"
      }
     ]
    },
    {
     "id": "java/05-classes-and-objects",
     "title": "Classes and objects",
     "summary": "Define your own types that keep data together with the methods that work on it, and protect their own rules.",
     "exercises": [
      {
       "id": "java/05-bank-account",
       "title": "A bank account class"
      }
     ]
    },
    {
     "id": "java/06-interfaces-and-inheritance",
     "title": "Interfaces and inheritance",
     "summary": "Write code that works with many kinds of object through what they have in common.",
     "exercises": [
      {
       "id": "java/06-shapes",
       "title": "Shapes behind an interface"
      }
     ]
    },
    {
     "id": "java/07-collections",
     "title": "Collections",
     "summary": "Lists that grow, maps from keys to values, and sets of unique items.",
     "exercises": [
      {
       "id": "java/07-word-count",
       "title": "Word frequencies"
      }
     ]
    },
    {
     "id": "java/08-generics",
     "title": "Generics",
     "summary": "Write a class or method once and use it safely with any type.",
     "exercises": [
      {
       "id": "java/08-generics",
       "title": "A generic stack"
      }
     ]
    },
    {
     "id": "java/09-exceptions",
     "title": "Exceptions",
     "summary": "Signal that something went wrong, handle what you can, and never lose a resource.",
     "exercises": [
      {
       "id": "java/09-exceptions",
       "title": "Parse with your own exception"
      }
     ]
    },
    {
     "id": "java/10-files-and-streams",
     "title": "Files, lambdas and streams",
     "summary": "Read and write files in a few lines, and process collections by describing what you want.",
     "exercises": [
      {
       "id": "java/10-streams",
       "title": "Streams, Optional and a file"
      }
     ]
    }
   ]
  }
 ]
};
