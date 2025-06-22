import unittest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport
from tortoise import Tortoise
from main import app  # або де саме в тебе FastAPI app
from models import Flower, Order

class BaseTestCase(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        await Tortoise.init(
            db_url="sqlite://:memory:",
            modules={"models": ["models"]}
        )
        await Tortoise.generate_schemas()
        self.transport = ASGITransport(app=app)
        self.client = AsyncClient(transport=self.transport, base_url="http://test")

    async def asyncTearDown(self):
        await self.client.aclose()
        await Tortoise._drop_databases()


class TestAuth(BaseTestCase):

    async def test_register_login_and_logout(self):
        # Register
        resp = await self.client.post(
            "/api/register",
            json={"username": "testuser", "email": "test@example.com", "password": "secret123"},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["success"])

        # Duplicate register
        dup = await self.client.post(
            "/api/register",
            json={"username": "testuser", "email": "test@example.com", "password": "secret123"},
        )
        self.assertEqual(dup.status_code, 409)

        # Login
        login = await self.client.post(
            "/api/login",
            json={"email": "test@example.com", "password": "secret123"},
        )
        self.assertEqual(login.status_code, 200)
        token = login.json().get("token")
        self.assertTrue(token)

        # Logout
        logout = await self.client.post("/api/logout", headers={"token": token})
        self.assertEqual(logout.status_code, 200)
        self.assertTrue(logout.json()["success"])


class TestFlowersAndOrders(BaseTestCase):

    async def test_flowers_and_orders_endpoints(self):
        await Flower.create(name="Rose", price=10.50, type=Flower.FlowerType.red, category=Flower.FlowerCategory.birthday, img_link="/img/rose.png")
        await Flower.create(name="Tulip", price=8.00, type=Flower.FlowerType.yellow, category=Flower.FlowerCategory.kids, img_link="/img/tulip.png")

        # Get flowers
        resp = await self.client.get("/api/flowers")
        self.assertEqual(resp.status_code, 200)
        flowers = resp.json()["data"]
        self.assertEqual(len(flowers), 2)
        self.assertSetEqual({f["name"] for f in flowers}, {"Rose", "Tulip"})

        # Register & login
        await self.client.post("/api/register", json={
            "username": "buyer", "email": "buyer@example.com", "password": "buy12345"
        })
        login = await self.client.post("/api/login", json={
            "email": "buyer@example.com", "password": "buy12345"
        })
        token = login.json()["token"]
        headers = {"token": token}

        # Unauthorized access
        bad = await self.client.get("/api/orders", headers={"token": "badtoken"})
        self.assertEqual(bad.status_code, 403)

        # Empty orders
        empty = await self.client.get("/api/orders", headers=headers)
        self.assertEqual(empty.status_code, 200)
        self.assertEqual(empty.json()["data"], [])

        # Create order
        create = await self.client.post("/api/orders", headers=headers, json={
            "flower_name": "Rose", "quantity": 3
        })
        self.assertEqual(create.status_code, 200)
        self.assertTrue(create.json()["success"])

        # Get orders
        orders = await self.client.get("/api/orders", headers=headers)
        data = orders.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["flower"]["name"], "Rose")
        self.assertEqual(data[0]["quantity"], 3)

        # Invalid flower order
        bad_order = await self.client.post("/api/orders", headers=headers, json={
            "flower_name": "NonexistentFlower", "quantity": 1
        })
        self.assertEqual(bad_order.status_code, 403)


class TestOrderUpdateDelete(BaseTestCase):

    async def test_update_and_delete_order(self):
        await self.client.post("/api/register", json={
            "username": "deleter",
            "email": "deleter@example.com",
            "password": "passdel123"
        })
        login = await self.client.post("/api/login", json={
            "email": "deleter@example.com",
            "password": "passdel123"
        })
        token = login.json()["token"]
        headers = {"token": token}

        await Flower.create(
            name="Daisy", price=5.50, type=Flower.FlowerType.white,
            category=Flower.FlowerCategory.love, img_link="/img/daisy.png"
        )

        # Create order
        await self.client.post("/api/orders", headers=headers, json={
            "flower_name": "Daisy", "quantity": 2
        })
        order = await Order.all().order_by("-id").first()
        order_id = order.id

        # Update quantity
        res1 = await self.client.put(f"/api/orders/{order_id}", headers=headers, json={"quantity": 5})
        self.assertEqual(res1.status_code, 200)
        self.assertEqual((await Order.get(id=order_id)).quantity, 5)

        # Update status
        res2 = await self.client.put(f"/api/orders/{order_id}", headers=headers, json={"status": "Completed"})
        self.assertEqual(res2.status_code, 200)
        self.assertEqual((await Order.get(id=order_id)).status.value, "Completed")

        # Update both
        res3 = await self.client.put(f"/api/orders/{order_id}", headers=headers, json={"quantity": 1, "status": "Failed"})
        self.assertEqual(res3.status_code, 200)
        updated = await Order.get(id=order_id)
        self.assertEqual(updated.quantity, 1)
        self.assertEqual(updated.status.value, "Failed")

        # Update non-existent
        res4 = await self.client.put("/api/orders/9999", headers=headers, json={"quantity": 3})
        self.assertEqual(res4.status_code, 404)

        # Delete
        res5 = await self.client.delete(f"/api/orders/{order_id}", headers=headers)
        self.assertEqual(res5.status_code, 200)
        self.assertTrue(res5.json()["success"])

        # Delete again
        res6 = await self.client.delete(f"/api/orders/{order_id}", headers=headers)
        self.assertEqual(res6.status_code, 404)
        self.assertFalse(res6.json()["success"])


if __name__ == "__main__":
    unittest.main()
