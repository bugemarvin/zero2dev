#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

static Node *head = NULL;
static Node *tail = NULL;

static Node *new_node(int value, Node *next) {
    Node *node = malloc(sizeof(Node));
    if (node == NULL) {
        exit(1);
    }
    node->value = value;
    node->next = next;
    return node;
}

static void push_front(int value) {
    head = new_node(value, head);
    if (tail == NULL) {
        tail = head;
    }
}

static void push_back(int value) {
    Node *node = new_node(value, NULL);
    if (tail == NULL) {
        head = tail = node;
    } else {
        tail->next = node;
        tail = node;
    }
}

static void reverse(void) {
    Node *prev = NULL;
    Node *node = head;
    tail = head;
    while (node != NULL) {
        Node *following = node->next;
        node->next = prev;
        prev = node;
        node = following;
    }
    head = prev;
}

int main(void) {
    int q;
    if (scanf("%d", &q) != 1) {
        return 1;
    }
    char command[32];
    for (int i = 0; i < q; i++) {
        if (scanf("%31s", command) != 1) {
            break;
        }
        if (strcmp(command, "push_front") == 0 || strcmp(command, "push_back") == 0) {
            int x;
            if (scanf("%d", &x) != 1) {
                break;
            }
            if (command[5] == 'f') {
                push_front(x);
            } else {
                push_back(x);
            }
        } else if (strcmp(command, "pop_front") == 0) {
            if (head == NULL) {
                printf("empty\n");
            } else {
                Node *old = head;
                printf("%d\n", old->value);
                head = old->next;
                if (head == NULL) {
                    tail = NULL;
                }
                free(old);
            }
        } else if (strcmp(command, "reverse") == 0) {
            reverse();
        } else if (strcmp(command, "print") == 0) {
            if (head == NULL) {
                printf("empty\n");
            } else {
                for (Node *node = head; node != NULL; node = node->next) {
                    printf(node == head ? "%d" : " %d", node->value);
                }
                printf("\n");
            }
        }
    }
    while (head != NULL) {
        Node *old = head;
        head = head->next;
        free(old);
    }
    return 0;
}
