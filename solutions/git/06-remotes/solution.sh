git clone -q remote.git mycopy
cd mycopy
echo "first note" > notes.txt
git add notes.txt
git commit -qm "Add notes"
git push -q
