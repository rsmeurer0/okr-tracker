import pytest


def test_login_page_loads(client):
    response = client.get("/auth/login")
    assert response.status_code == 200
    assert b"Sign in" in response.data


def test_register_page_loads(client):
    response = client.get("/auth/register")
    assert response.status_code == 200
    assert b"Create account" in response.data


def test_register_creates_user(client, db):
    response = client.post("/auth/register", data={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b"Welcome" in response.data


def test_register_duplicate_email(client, db, org_member):
    response = client.post("/auth/register", data={
        "name": "Other User",
        "email": org_member.email,
        "password": "password123",
    }, follow_redirects=True)
    assert b"already registered" in response.data


def test_register_short_password(client, db):
    response = client.post("/auth/register", data={
        "name": "Test User",
        "email": "short@example.com",
        "password": "abc",
    }, follow_redirects=True)
    assert b"at least 8 characters" in response.data


def test_login_valid_credentials(client, db, org_member):
    response = client.post("/auth/login", data={
        "email": org_member.email,
        "password": "password",
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b"Objectives" in response.data


def test_login_invalid_password(client, db, org_member):
    response = client.post("/auth/login", data={
        "email": org_member.email,
        "password": "wrongpass",
    }, follow_redirects=True)
    assert b"Invalid email or password" in response.data


def test_login_unknown_email(client, db):
    response = client.post("/auth/login", data={
        "email": "nobody@example.com",
        "password": "password123",
    }, follow_redirects=True)
    assert b"Invalid email or password" in response.data


def test_logout(client, db, org_member):
    client.post("/auth/login", data={
        "email": org_member.email,
        "password": "password",
    })
    response = client.get("/auth/logout", follow_redirects=True)
    assert b"Sign in" in response.data


def test_unauthenticated_redirects_to_login(client):
    response = client.get("/", follow_redirects=True)
    assert b"Sign in" in response.data
