from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField(
    'self', 
    related_name='following', 
    symmetrical=False
    )

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "followers": [user.username for user in self.followers.all()],
            "following": [user.username for user in self.following.all()]
        }

class Post(models.Model):
    '''attrs: username, content, datetime'''
    user = models.ForeignKey("User", related_name='posts', on_delete=models.CASCADE)
    content = models.CharField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": [like.user.username for like in self.likes.all()]
        }

class Like(models.Model):
    '''attrs: user and post'''
    user = models.ForeignKey("User", related_name='likes', on_delete=models.CASCADE)
    post = models.ForeignKey("Post", related_name="likes", on_delete=models.CASCADE)
