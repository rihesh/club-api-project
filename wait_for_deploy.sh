for i in {1..15}; do
  status=$(curl -s -o /dev/null -w "%{http_code}" https://club-api-project.vercel.app/api/debug-env)
  if [ "$status" == "200" ]; then
    echo "Endpoint live!"
    curl -s https://club-api-project.vercel.app/api/debug-env | jq
    exit 0
  fi
  echo "Waiting for deployment... HTTP $status"
  sleep 5
done
