git merge -q feature/blue || true
printf 'Colors we like\nfavorite: blue-green\n' > colors.txt
git add colors.txt
git commit -q --no-edit
