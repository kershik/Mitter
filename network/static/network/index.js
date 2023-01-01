document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelector('#all-posts').addEventListener('click', () => showPosts('all'));
    const following_posts = document.querySelector('#following-posts')
    if (document.contains(following_posts)) {
        following_posts.addEventListener('click', () => showPosts('following'));
    }

    const user_home = document.querySelector('#user-home')
    if (document.contains(user_home)) {
        user_home.addEventListener('click', () => loadUser(user_home.innerHTML));
    }

    showPosts('all');
    
})

function showPosts(type) {
    // Show form and posts view and hide other 
    document.querySelector('#form-view').style.display = 'block';
    const posts_view = document.querySelector('#posts-view')
    posts_view.style.display = 'block';
    document.querySelector('#user-view').style.display = 'none';

    document.querySelector('#posts-view').innerHTML = '';

    // Tweet form
    const post_form = document.querySelector('#post-form');

    if (type === 'following') {
        post_form.style.display = 'none';
    }

    if (document.contains(post_form)) {

        // Clear out content field
        const post_content = document.getElementById('post-content');
        post_content.value = ''; 
        post_content.setAttribute('class', 'content');

        // Make textarea autoresize
        post_content.oninput = function () {
            this.style.height = "";
            this.style.height = this.scrollHeight + "px";
        };

        // Disable submit button by default:
        const submit = document.querySelector('#submit-tweet');
        submit.disabled = true;

        // Listen for tweet to be typed into the input field
        post_content.onkeyup = () => {
            if (post_content.value.length > 0) {
                submit.disabled = false;
            }
            else {
                submit.disabled = true;
            }
        };

        // Listen for submission of tweet form
        post_form.onsubmit = () => {
            fetch('/posts', {
                method: 'POST',
                body: JSON.stringify({
                    content: post_content.value
                })
            })
            .then(response => response.json())
            .then(result => {
                    // Print result
                    console.log(result);
                });
        };
    }
    
    // Create container with posts and pagination
    createContainerforPosts(type, viewName='posts-view');

}

function showUser(user) {

    // Show user view and hide other 
    document.querySelector('#form-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'none';
    const user_view = document.querySelector('#user-view');
    user_view.style.display = 'block';

    // Fill in user data
    document.querySelector('#user-name').innerHTML = user.username;
    followers = document.querySelector('#followers')
    followers.innerHTML = user.followers.length;
    following = document.querySelector('#following')
    following.innerHTML = user.following.length;

    // Make follow button
    follow_button = document.querySelector('#follow-button');

    // Hide follow button if user is current user
    const user_home = document.getElementById('user-home')
    if (user_home === null || user_home.innerHTML === user.username) {
        follow_button.style.display = 'none';
    }

    // Fill button according to follow/unfollow state
    if (user_home != null && user.followers.includes(user_home.innerHTML)) {
        follow_button.innerHTML = 'Unfollow';
      } else {
        follow_button.innerHTML = 'Follow';
      }

    follow_button.onclick = () => {
        fetch('/user/' + user.username, {
            method: 'PUT',
            body: JSON.stringify({
                follow: follow_button.innerHTML === 'Follow'
            })
        })
        .then(response => response.json())
        .then(result => {
                // Print result
                console.log(result);
                followers.innerHTML = result.followers;
                following.innerHTML = result.following;
            });
        if (follow_button.innerHTML === 'Follow') {
            follow_button.innerHTML = 'Unfollow';
        } else {
            follow_button.innerHTML = 'Follow';
        }
    };

    // Container for user posts
    createContainerforPosts('all', 'user-view', user.username);

}

function createPostDiv(post, containerName) {

    const user_home = document.getElementById('user-home');
    const post_div = document.createElement('div');
    post_div.setAttribute('class', 'post-div')

    const post_user = document.createElement('div');
    post_user.innerHTML = `<strong>${post.user}</strong>`;
    post_user.setAttribute('class', 'post-user');

    // Add eventlistener for click on user
    post_user.addEventListener('click', () => loadUser(post.user));
    
    const post_timestamp = document.createElement('div');
    post_timestamp.setAttribute('class', 'post-timestamp');
    post_timestamp.innerHTML = post.timestamp;

    const post_content = document.createElement('div');
    post_content.innerHTML = post.content;
    
    // Like button
    const post_likes = document.createElement('button');
    if (user_home != null && post.likes.includes(user_home.innerHTML)) {
        likeIn(post_likes, post.likes.length);
    } else {
        likeOut(post_likes, post.likes.length);
    }
    post_likes.setAttribute('class', 'like-button');

    // Disable like button if user is not authentificated
    if (user_home === null) {
        post_likes.disabled = true;
    }

    // Toggle between like/unlike on click
    post_likes.onclick = () => {
        fetch('/like', {
            method: 'POST',
            body: JSON.stringify({
                post: post.id
            })
        })
        .then(response => response.json())
        .then(result => {
                // Print result
                console.log(result);
                // Change button filling 
                if (result.message === "Like deleted successfully.") {
                    likeOut(post_likes, result.post.likes.length);
                } else if (result.message === "Like added successfully.") {
                    likeIn(post_likes, result.post.likes.length);
                }
        });
    }

    // Add all made components to post div
    post_div.append(post_user, post_timestamp, post_content, post_likes);

    // Edit button
    if (user_home != null && post.user === user_home.innerHTML) {
        // Create edit button
        const edit_button = document.createElement('button');
        edit_button.innerHTML = "Edit";
        edit_button.setAttribute('class', 'btn btn-link');
        edit_button.setAttribute('id', 'edit-button');
        post_div.append(edit_button);
        edit_button.addEventListener('click', () => {
            // Replace post content with textarea
            post_content.innerHTML = `<textarea id='new-content'>${post_content.innerHTML}</textarea>`;
            new_content = document.getElementById('new-content');
            // Make textarea resizable
            new_content.oninput = function () {
                this.style.height = "";
                this.style.height = this.scrollHeight + "px";
            };
            new_content.setAttribute('class', 'content');

            // Hide likes and edit button 
            edit_button.style.display = 'none';
            post_likes.style.display = 'none';

            // Create save button and add PUT on click
            const save_button = document.createElement('button');
            save_button.innerHTML = "Save";
            save_button.setAttribute('class', 'btn btn-outline-info');
            save_button.setAttribute('id', 'save-button');
            post_div.append(save_button);
            save_button.addEventListener('click', () => {
                fetch('/edit/' + post.id, {
                    method: 'PUT',
                    body: JSON.stringify({
                        content:  new_content.value
                    })
                });
                // Show likes and edit button again and hide save button
                post_likes.style.display = 'inline-block';
                edit_button.style.display = 'inline-block';
                save_button.style.display = 'none';
                // Replace post content to new one
                post_content.innerHTML = document.getElementById('new-content').value;
            });
        });
    }

    // Add post to document
    document.getElementById(containerName).append(post_div);
}

function loadPosts(type, page, containerName, userName) {
    let url = `/posts/${type}?page=${page}`;
    if (userName != '') {
        url += `&user=${userName}`;
    }
    fetch(url)
    .then(response => response.json())
    .then(posts => {
        // Print posts
        console.log(posts);

        // Make div for each post
        posts.forEach((post) => {
            createPostDiv(post, containerName);           
        }); 

        // Hide Next button if it's the last page
        if (posts.length < 10) {
            document.getElementById('next-item'+containerName).style.display = 'none';
        } else {
            document.getElementById('next-item'+containerName).style.display = 'block';
        }
    });

}

function loadUser(username) {
    fetch("/user/" + username)
        .then(response => response.json())
        .then(user => {
            // Print user
            console.log(user);

            // Show user 
            showUser(user);
        });
}

function createContainerforPosts(type, viewName, userName='') {

    const view = document.getElementById(viewName);

    // Container for posts
    const container = document.createElement('div');
    const containerName = viewName+'-container';
    container.setAttribute('id', containerName);
    view.append(container);
    
    // Load first page
    let page = 1;
    loadPosts(type, page, containerName, userName);

    // Create pagination
    const pages_nav = document.createElement('nav');
    pages_nav.setAttribute('id', 'nav-bar');
    view.append(pages_nav);

    const pages_ul = document.createElement('ul');
    pages_ul.setAttribute('class', 'pagination');
    pages_nav.append(pages_ul);

    const page_li_next = document.createElement('li');
    page_li_next.setAttribute('class', 'page-item');
    page_li_next.setAttribute('id', 'next-item'+containerName);
    pages_ul.append(page_li_next);

    const page_link_next = document.createElement('a');
    page_link_next.setAttribute('class', 'page-link');
    page_link_next.innerHTML = 'Next';
    page_li_next.append(page_link_next);

    page_link_next.onclick = () => {
        page++;
        container.innerHTML = '';
        loadPosts(type, page, containerName, userName);
        // Add Previous if it is not the first page
        if (page == 2) {
            const page_li_prev = document.createElement('li');
            page_li_prev.setAttribute('class', 'page-item');
            pages_ul.append(page_li_prev);

            const page_link_prev = document.createElement('a');
            page_link_prev.setAttribute('class', 'page-link');
            page_link_prev.innerHTML = 'Previous';
            page_li_prev.append(page_link_prev);

            page_link_prev.onclick = () => {
                page--;
                container.innerHTML = '';
                loadPosts(type, page, containerName, userName);
                if (page == 1) {
                    page_li_prev.style.display = 'none';
                }
            };
        } 
    };

}

function likeOut(button, post_likes) {
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"></path>
        </svg> ${post_likes}`;
}

function likeIn(button, post_likes) {
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"></path></svg> ${post_likes}`;
}

