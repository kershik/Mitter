# Mitter
Twitter-like social network website for making posts and following users

## Getting started

1. Clone the repo

```
git clone git@github.com:kershik/Mitter.git
```

2. Go to Mitter directory.

```
cd Mitter
```

2. Make migrations for network app.

```
python manage.py makemigrations network
```

3. Apply migrations to your database.

```
python manage.py migrate
```

4. Run server

```
python manage.py runserver
```

