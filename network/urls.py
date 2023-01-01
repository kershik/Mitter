
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts", views.create, name="create"),
    path("edit/<int:post_id>", views.edit, name="edit"),
    path("posts/<str:type>", views.posts, name="posts"),
    path("user/<str:username>", views.user, name="user"),
    path("like", views.like, name="like")
]
