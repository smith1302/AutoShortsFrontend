echo "Deploy starting..."

git stash

git pull

npm install || exit

BUILD_DIR=temp npm run build || exit

if [ ! -d "temp" ]; then
  echo '\033[31m temp Directory not exists!\033[0m'  
  exit 1;
fi


rm -rf .next

mv temp .next

pm2 restart Frontend --update-env

echo "Deploy done."