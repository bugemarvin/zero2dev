db.tasks.insertMany([
  { _id: 1, title: "Write report", done: false, priority: 2 },
  { _id: 2, title: "Buy milk", done: true, priority: 3 },
  { _id: 3, title: "Call Sam", done: false, priority: 1 },
]);

db.tasks.updateOne({ _id: 3 }, { $set: { done: true } });

db.tasks.deleteOne({ _id: 2 });

const result = db.tasks.find({}, { title: 1, done: 1, _id: 0 }).sort({ title: 1 });
