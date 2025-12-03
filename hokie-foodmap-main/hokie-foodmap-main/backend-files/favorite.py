import json
import os

class FavoriteEventManager:
    def __init__(self, fileName="favorite.json"):

        self.fileName = fileName
        self.data = self.load_data()

    def load_data(self):

        if not os.path.exists(self.fileName):
            return {}
        try:
            with open(self.fileName, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}

    def saving_data(self):

        with open(self.fileName, "w") as f:
            json.dump(self.data, f, indent=4)

    def toggle_favorite(self, email, event):
        user_favs = self.data.setdefault(email, [])
        urls = [fav.get("url") for fav in user_favs]

        if event["url"] in urls:
            # Remove favorite
            self.data[email] = [fav for fav in user_favs if fav.get("url") != event["url"]]
            self.saving_data()
            return "removed"
        else:
            # Add favorite
            user_favs.append(event)
            self.saving_data()
            return "added"

    def get_favorites(self, email):
        return self.data.get(email, [])
