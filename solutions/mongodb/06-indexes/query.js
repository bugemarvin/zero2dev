db.users.createIndex({ email: 1 }, { unique: true });

db.orders.createIndex({ customer: 1, date: -1 });

const result = db.orders.find({ customer: "ada" }, { date: 1, total: 1, _id: 0 }).sort({ date: -1 });
