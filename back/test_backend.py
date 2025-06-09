import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from tortoise import Tortoise

from main import app
from models import Flower, Order


@pytest_asyncio.fixture(scope="module", autouse=True)
async def initialize_db():
    await Tortoise.init(db_url="sqlite://:memory:", modules={"models": ["models"]})
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
        "/api/register",
        json={"username": "testuser", "email": "test@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True

    # Test duplicate registration
    dup = await client.post(
        "/api/register",
        json={"username": "testuser", "email": "test@example.com", "password": "secret123"},
    )
    assert dup.status_code == 409

    # Test login
    login = await client.post(
        "/api/login",
        json={"email": "test@example.com", "password": "secret123"},
    )
    assert login.status_code == 200
    login_data = login.json()
    assert login_data["success"] is True
    token = login_data["token"]
    assert token

    # Test logout
    logout = await client.post("/api/logout", headers={"token": token})
    assert logout.status_code == 200
    assert logout.json()["success"] is True


@pytest.mark.asyncio
async def test_flowers_and_orders_endpoints(client):
    await Flower.create(
        name="Rose",
        price=10.50,
        type=Flower.FlowerType.red,
        category=Flower.FlowerCategory.birthday,
        img_link="/img/rose.png",
    )
    await Flower.create(
        name="Tulip",
        price=8.00,
        type=Flower.FlowerType.yellow,
        category=Flower.FlowerCategory.kids,
        img_link="/img/tulip.png",
    )

    # Test GET /flowers
    resp = await client.get("/api/flowers")
    assert resp.status_code == 200
    flowers_data = resp.json()
    assert flowers_data["success"] is True
    assert len(flowers_data["data"]) == 2
    assert {f["name"] for f in flowers_data["data"]} == {"Rose", "Tulip"}

    # Register and login user
    await client.post(
        "/api/register",
        json={"username": "buyer", "email": "buyer@example.com", "password": "buy12345"},
    )
    login_resp = await client.post(
        "/api/login",
        json={"email": "buyer@example.com", "password": "buy12345"},
    )
    token = login_resp.json()["token"]
    headers = {"token": token}

    # Unauthorized access to /orders
    no_auth = await client.get("/api/orders", headers={"token": "invalid token"})
    assert no_auth.status_code == 403

    # Empty orders list
    empty_orders = await client.get("/api/orders", headers=headers)
    assert empty_orders.status_code == 200
    assert empty_orders.json()["data"] == []

    # Create order
    create_order = await client.post(
        "/api/orders",
        headers=headers,
        json={"flower_name": "Rose", "quantity": 3},
    )
    assert create_order.status_code == 200
    assert create_order.json()["success"] is True

    # Get orders
    orders_list = await client.get("/api/orders", headers=headers)
    assert orders_list.status_code == 200
    orders = orders_list.json()["data"]
    assert len(orders) == 1
    assert orders[0]["flower"]["name"] == "Rose"
    assert orders[0]["quantity"] == 3

    # Invalid flower order
    bad_order = await client.post(
        "/api/orders",
        headers=headers,
        json={"flower_name": "NonexistentFlower", "quantity": 1},
    )
    assert bad_order.status_code == 403


@pytest.mark.asyncio
async def test_update_and_delete_order(client):
    # Зареєструвати й увійти
    await client.post(
        "/api/register", json={"username": "deleter", "email": "deleter@example.com", "password": "passdel123"}
    )
    login_resp = await client.post("/api/login", json={"email": "deleter@example.com", "password": "passdel123"})
    token = login_resp.json()["token"]
    headers = {"token": token}

    # Створити квітку
    await Flower.create(
        name="Daisy",
        price=5.50,
        type=Flower.FlowerType.white,
        category=Flower.FlowerCategory.love,
        img_link="/img/daisy.png",
    )

    # Створити замовлення
    create_order = await client.post(
        "/api/orders",
        headers=headers,
        json={"flower_name": "Daisy", "quantity": 2},
    )
    assert create_order.status_code == 200
    order = await Order.all().order_by("-id").first()
    order_id = order.id

    # Оновити замовлення — тільки кількість
    update_quantity = await client.put(f"/api/orders/{order_id}", headers=headers, json={"quantity": 5})
    assert update_quantity.status_code == 200
    updated_order = await Order.get(id=order_id)
    assert updated_order.quantity == 5

    # Оновити замовлення — тільки статус
    update_status = await client.put(f"/api/orders/{order_id}", headers=headers, json={"status": "Completed"})
    assert update_status.status_code == 200
    updated_order = await Order.get(id=order_id)
    assert updated_order.status.value == "Completed"

    # Оновити замовлення — кількість + статус
    update_both = await client.put(f"/api/orders/{order_id}", headers=headers, json={"quantity": 1, "status": "Failed"})
    assert update_both.status_code == 200
    updated_order = await Order.get(id=order_id)
    assert updated_order.quantity == 1
    assert updated_order.status.value == "Failed"

    # Оновити неіснуюче замовлення
    update_fail = await client.put("/api/orders/9999", headers=headers, json={"quantity": 3})
    assert update_fail.status_code == 404

    # Видалити замовлення
    delete_resp = await client.delete(f"/api/orders/{order_id}", headers=headers)
    assert delete_resp.status_code == 200
    assert delete_resp.json()["success"] is True

    # Спроба видалити знову — не знайде
    delete_again = await client.delete(
        f"/api/orders/{order_id}",
        headers=headers,
    )
    assert delete_again.status_code == 404
    assert delete_again.json()["success"] is False
