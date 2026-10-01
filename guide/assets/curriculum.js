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
  }
 ]
};
