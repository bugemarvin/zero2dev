echo "version 2" >> app.txt
git add app.txt
git commit -qm "Bump version"
printf '*.log\nbuild/\n' > .gitignore
git add .gitignore
git commit -qm "Ignore logs and build output"
