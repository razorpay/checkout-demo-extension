remove() {
  echo "Removing $1"
  rm -r $1 || true
}

remove "./app/dist"
remove "./app/css/generated/*.styl"
remove "./app/css/generated/*.map"
remove "./app/js/generated"
