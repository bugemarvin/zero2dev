#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node {
    int value;
    struct Node *left;
    struct Node *right;
} Node;

static Node *insert(Node *node, int value) {
    if (node == NULL) {
        Node *created = malloc(sizeof(Node));
        if (created == NULL) {
            exit(1);
        }
        created->value = value;
        created->left = created->right = NULL;
        return created;
    }
    if (value < node->value) {
        node->left = insert(node->left, value);
    } else if (value > node->value) {
        node->right = insert(node->right, value);
    }
    return node;
}

static int contains(const Node *node, int value) {
    while (node != NULL) {
        if (value == node->value) {
            return 1;
        }
        node = value < node->value ? node->left : node->right;
    }
    return 0;
}

static int height(const Node *node) {
    if (node == NULL) {
        return 0;
    }
    int l = height(node->left);
    int r = height(node->right);
    return 1 + (l > r ? l : r);
}

static void in_order(const Node *node, int *first) {
    if (node == NULL) {
        return;
    }
    in_order(node->left, first);
    printf(*first ? "%d" : " %d", node->value);
    *first = 0;
    in_order(node->right, first);
}

static void destroy(Node *node) {
    if (node == NULL) {
        return;
    }
    destroy(node->left);
    destroy(node->right);
    free(node);
}

int main(void) {
    int q;
    if (scanf("%d", &q) != 1) {
        return 1;
    }
    Node *root = NULL;
    char command[32];
    for (int i = 0; i < q; i++) {
        if (scanf("%31s", command) != 1) {
            break;
        }
        if (strcmp(command, "insert") == 0 || strcmp(command, "contains") == 0) {
            int x;
            if (scanf("%d", &x) != 1) {
                break;
            }
            if (command[0] == 'i') {
                root = insert(root, x);
            } else {
                printf(contains(root, x) ? "yes\n" : "no\n");
            }
        } else if (strcmp(command, "min") == 0 || strcmp(command, "max") == 0) {
            if (root == NULL) {
                printf("empty\n");
            } else {
                const Node *node = root;
                if (command[1] == 'i') {
                    while (node->left != NULL) {
                        node = node->left;
                    }
                } else {
                    while (node->right != NULL) {
                        node = node->right;
                    }
                }
                printf("%d\n", node->value);
            }
        } else if (strcmp(command, "height") == 0) {
            printf("%d\n", height(root));
        } else if (strcmp(command, "inorder") == 0) {
            if (root == NULL) {
                printf("empty\n");
            } else {
                int first = 1;
                in_order(root, &first);
                printf("\n");
            }
        }
    }
    destroy(root);
    return 0;
}
