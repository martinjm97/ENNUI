# Build
npm run build

# Create the folder if it doesn't exist
folder="prod"
if [ ! -d "$folder" ]; then
  mkdir $folder
fi

# Copy index.html
cp ./index.html $folder
# Fix the paths to style.css and bundle.js 
sed -i 's/src\/ui\///' $folder/index.html
sed -i 's/dist\///' $folder/index.html

# Copy style.css
uglifycss ./src/ui/style.css > $folder/style.css

# Copy favicon
cp ./favicon.ico $folder

# Uglify and copy bundle.js
uglifyjs --compress --mangle --wrap -- dist/bundle.js > $folder/bundle.js
