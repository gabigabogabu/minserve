#!/bin/bash

# echo
echo 'echo'
curl -v "localhost:3000/echo" \
-d '{"message": "Hello, World!"}' \
-H "Test-Header: test-value"

# todo
echo ''
echo 'create todo'
curl -v "localhost:3000/todos" -d '{"item": "Buy milk"}'

echo ''
echo 'list todos'
curl "localhost:3000/todos"
ID=$(curl -s "localhost:3000/todos" | jq -r '.[0].id')
echo $ID

echo ''
echo 'mark todo as done'
curl -X PUT "localhost:3000/todos/$ID/done"

echo ''
echo 'list todos'
curl "localhost:3000/todos"

echo ''
echo 'mark todo as undone'
curl -X PUT "localhost:3000/todos/$ID/undone"

echo ''
echo 'list todos'
curl "localhost:3000/todos"

echo ''
echo 'delete todo'
curl -X DELETE "localhost:3000/todos/$ID"

echo ''
echo 'list todos'
curl "localhost:3000/todos"