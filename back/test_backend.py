import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from tortoise import Tortoise
from models import Flower
from main import app


@pytest_asyncio.fixture(scope="module", autouse=True)
async def initialize_db():
    await Tortoise.init(
        db_url="sqlite://:memory:",
        modules={"models": ["models"]}
    )
    await Tortoise.generate_schemas()
    yield
    await Tortoise._drop_databases()


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_register_login_and_logout(client):
    # Test user registration
    resp = await client.post(
        "/register",
        json={"username": "testuser", "email": "test@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True

    # Test duplicate registration
    dup = await client.post(
        "/register",
        json={"username": "testuser", "email": "test@example.com", "password": "secret123"},
    )
    assert dup.status_code == 409

    # Test login
    login = await client.post(
        "/login",
        json={"email": "test@example.com", "password": "secret123"},
    )
    assert login.status_code == 200
    login_data = login.json()
    assert login_data["success"] is True
    token = login_data["token"]
    assert token

    # Test logout
    logout = await client.post("/logout", headers={"token": token})
    assert logout.status_code == 200
    assert logout.json()["success"] is True


@pytest.mark.asyncio
async def test_flowers_and_orders_endpoints(client):
    await Flower.create(name="Rose", price=10.50, type="red", img_link="/img/rose.png")
    await Flower.create(name="Tulip", price=8.00, type="yellow", img_link="/img/tulip.png")

    # Test GET /flowers
    resp = await client.get("/flowers")
    assert resp.status_code == 200
    flowers_data = resp.json()
    assert flowers_data["success"] is True
    assert len(flowers_data["data"]) == 2
    assert {f["name"] for f in flowers_data["data"]} == {"Rose", "Tulip"}

    # Register and login user
    await client.post(
        "/register",
        json={"username": "buyer", "email": "buyer@example.com", "password": "buy12345"},
    )
    login_resp = await client.post(
        "/login",
        json={"email": "buyer@example.com", "password": "buy12345"},
    )
    token = login_resp.json()["token"]
    headers = {"token": token}

    # Unauthorized access to /orders
    no_auth = await client.get("/orders", headers={"token": "invalid token"})
    assert no_auth.status_code == 403

    # Empty orders list
    empty_orders = await client.get("/orders", headers=headers)
    assert empty_orders.status_code == 200
    assert empty_orders.json()["data"] == []

    # Create order
    create_order = await client.post(
        "/orders",
        headers=headers,
        json={"flower_name": "Rose", "quantity": 3},
    )
    assert create_order.status_code == 200
    assert create_order.json()["success"] is True

    # Get orders
    orders_list = await client.get("/orders", headers=headers)
    assert orders_list.status_code == 200
    orders = orders_list.json()["data"]
    assert len(orders) == 1
    assert orders[0]["flower"]["name"] == "Rose"
    assert orders[0]["quantity"] == 3

    # Invalid flower order
    bad_order = await client.post(
        "/orders",
        headers=headers,
        json={"flower_name": "NonexistentFlower", "quantity": 1},
    )
    assert bad_order.status_code == 403
