docker run --rm alpine:3 cat /etc/os-release > os.txt
docker run --rm alpine:3 echo hello from a container > hello.txt
docker run --rm alpine:3 sh -c 'echo $((6 * 7))' > answer.txt
