cat > Makefile <<'MK'
CC = gcc
CFLAGS = -Wall -Wextra -g

all: app

app: main.o greet.o
	$(CC) $(CFLAGS) main.o greet.o -o app

main.o: main.c greet.h
	$(CC) $(CFLAGS) -c main.c

greet.o: greet.c greet.h
	$(CC) $(CFLAGS) -c greet.c

clean:
	rm -f app *.o

.PHONY: all clean
MK
