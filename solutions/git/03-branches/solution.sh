git switch -q -c feature/greeting
echo hello > greeting.txt
git add greeting.txt
git commit -qm "Add greeting"
git switch -q main
