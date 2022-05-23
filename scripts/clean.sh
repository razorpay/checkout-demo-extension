remove() {
  echo "Removing $1"
  rm -r $1 || true
}

remove "./app/dist"