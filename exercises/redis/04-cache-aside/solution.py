import json


def get_user(cache, db, user_id):
    return db.load_user(user_id)


def update_user(cache, db, user_id, fields):
    db.save_user(user_id, fields)
