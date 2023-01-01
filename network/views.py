from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
import json

from .models import User, Post, Like


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def create(request):

    # Composing a new tweet must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # Create new post 
    data = json.loads(request.body)
    post = Post(
        user=request.user,
        content=data.get("content", "")
    )
    post.save()
    return JsonResponse({"message": "Tweet posted successfully."}, status=201)

@csrf_exempt
@login_required
def edit(request, post_id):
    if request.method != 'PUT':
        JsonResponse({"error": "Type of request should be PUT"})
    post = Post.objects.get(id=post_id)
    data = json.loads(request.body)
    post.content = data.get("content")
    post.save()
    return HttpResponse(status=204)


def posts(request, type):
    
    # Filter posts returned based on type
    if type == "all":
        posts = Post.objects.all()
    elif type == "following":
        posts = Post.objects.filter(
            user__in=request.user.following.all()
        )       
    else:
        JsonResponse({"error": "Invalid type of posts"})
    
    if request.method == "GET":
        # find user posts if user is in request
        if 'user' in request.GET:
            user = User.objects.get(username=request.GET.get('user'))
            posts = Post.objects.filter(user=user)

        # Return posts of page in reverse chronological order  
        posts = posts.order_by("-timestamp").all()
        page = request.GET.get("page")
        p = Paginator(posts, 10)
        return JsonResponse([post.serialize() for post in p.page(page).object_list], safe=False)
    else:
        return JsonResponse({
            "error": "GET request required."
        }, status=400)

@csrf_exempt
def user(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({
                "error": f"User with  {username} does not exist."
            }, status=400)

    # Return user content
    if request.method == "GET":
        return JsonResponse(user.serialize(), safe=False)

    # Follow/unfollow
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("follow"):
            user.followers.add(request.user)
            request.user.following.add(user)
        else:
            user.followers.remove(request.user)
            request.user.following.remove(user)
        user.save()
        return JsonResponse({
            'followers': user.followers.count(), 
            'following': user.following.count()
            })
    
    # User must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

@csrf_exempt
def like(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # Create new post 
    data = json.loads(request.body)
    post = Post.objects.get(id=data.get("post"))
    try:
        like = Like.objects.get(user=request.user, post=post)
        like.delete()
        return JsonResponse({"message": "Like deleted successfully.", "post": post.serialize()}, status=201)
    except: 
        like = Like(
            user=request.user,
            post=post
        )
        like.save()
        return JsonResponse({"message": "Like added successfully.", "post": post.serialize()}, status=202)