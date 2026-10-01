git clone -q remote.git project
cd project
git switch -q -c fix/typo
sed -i.bak 's/teh/the/' README.md && rm README.md.bak
git add README.md
git commit -qm "Fix typo in README"
git push -q -u origin fix/typo
