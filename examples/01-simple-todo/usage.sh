#!/bin/bash

# echo
echo 'echo'
curl -v "localhost:3000/echo" \
-d '{"message": "Hello, World!"}' \
-H "Test-Header: test-value"

# todo
echo ''
echo 'create todo'
curl -X POST "localhost:3000/todos" -d '{"item": "Buy milk"}'

echo ''
echo 'list todos'
curl "localhost:3000/todos"

echo ''
echo 'mark todo as done'
curl -X PUT "localhost:3000/todos/1/done"

echo ''
echo 'list todos'
curl "localhost:3000/todos"

echo ''
echo 'mark todo as undone'
curl -X PUT "localhost:3000/todos/1/undone"

echo ''
echo 'list todos'
curl "localhost:3000/todos"

echo ''
echo 'delete todo'
curl -X DELETE "localhost:3000/todos/1"

echo ''
echo 'list todos'
curl "localhost:3000/todos"