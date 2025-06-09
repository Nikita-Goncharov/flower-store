from typing import Annotated

from fastapi import APIRouter, Header, Query, Response, status
from tortoise.exceptions import DoesNotExist

from api_pydantic_schemas import (
    CommentCreate,
    CommentCreateResponse,
    CommentGetResponse,
    CommentSchema,
    FlowerSchema,
    FlowersGetResponse,
    OrderCreate,
    OrderCreateResponse,
    OrderDeleteResponse,
    OrderGetResponse,
    OrderSchema,
    OrderUpdateData,
)
from models import Comment, Flower, Order, User

router = APIRouter()


@router.get("/flowers", response_model=FlowersGetResponse, status_code=status.HTTP_200_OK)
async def flowers(category: str | None = Query(default=None)):
    if category:
        flowers = await Flower.filter(category=category).values()
    else:
        flowers = await Flower.all().values()

    return {"success": True, "data": [FlowerSchema.model_validate(f) for f in flowers], "message": ""}


@router.get("/orders", response_model=OrderGetResponse, status_code=status.HTTP_200_OK)
async def user_orders(token: Annotated[str | None, Header()], response: Response):
    try:
        user = await User.get(token=token)
        orders = await Order.filter(user=user).prefetch_related(
            "flower"
        )  # to fetch flower data, without it flower will be as queryset
        order_list = [
            OrderSchema(
                id=order.id,
                status=order.status,
                amount=float(order.amount),
                flower=FlowerSchema(
                    id=order.flower.id,
                    name=order.flower.name,
                    price=order.flower.price,
                    type=order.flower.type,
                    category=order.flower.category,
                    img_link=order.flower.img_link,
                ),
                quantity=order.quantity,
            )
            for order in orders
        ]

        return {"success": True, "data": order_list, "message": ""}
    except DoesNotExist:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"success": False, "data": [], "message": "Error. Incorrect token."}


@router.post("/orders", response_model=OrderCreateResponse, status_code=status.HTTP_200_OK)
async def create_order(order_data: OrderCreate, token: Annotated[str | None, Header()], response: Response):
    try:
        user = await User.get(token=token)
        try:
            flower = await Flower.get(name=order_data.flower_name)
            user_old_orders = await Order.filter(user=user, flower=flower)
            if user_old_orders:
                user_old_order = user_old_orders[0]
                user_old_order.quantity += 1
                user_old_order.amount = user_old_order.quantity * flower.price
                await user_old_order.save()
            else:
                await Order.create(
                    user=user, flower=flower, quantity=order_data.quantity, amount=order_data.quantity * flower.price
                )
            return {"success": True, "message": ""}
        except DoesNotExist:
            response.status_code = status.HTTP_403_FORBIDDEN
            return {"success": False, "message": "Error. There is no that flower."}
    except DoesNotExist:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"success": False, "message": "Error. Incorrect token."}


@router.put("/orders/{order_id}", response_model=OrderCreateResponse, status_code=status.HTTP_200_OK)
async def update_orders(
    order_id: int,
    update_data: OrderUpdateData,
    token: Annotated[str | None, Header()] = None,
    response: Response = None,
):
    try:
        user = await User.get(token=token)
        orders = await Order.filter(user=user, id=order_id)

        if not orders:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {"success": False, "message": "Orders not found."}

        for order in orders:
            if update_data.status:
                if update_data.status not in [s.value for s in Order.STATUSES]:
                    response.status_code = status.HTTP_400_BAD_REQUEST
                    return {"success": False, "message": "Invalid status value."}
                order.status = update_data.status

            if update_data.quantity is not None:
                if update_data.quantity <= 0:
                    response.status_code = status.HTTP_400_BAD_REQUEST
                    return {"success": False, "message": "Quantity must be greater than 0."}
                flower = await order.flower.first()
                order.quantity = update_data.quantity
                order.amount = update_data.quantity * flower.price

            await order.save()

        return {"success": True, "message": ""}
    except DoesNotExist:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"success": False, "message": "Error. Incorrect token."}


@router.delete("/orders/{order_id}", response_model=OrderDeleteResponse, status_code=status.HTTP_200_OK)
async def delete_order(order_id: int, token: Annotated[str | None, Header()] = None, response: Response = None):
    try:
        user = await User.get(token=token)
        orders = await Order.filter(user=user, id=order_id)

        if not orders:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {"success": False, "message": "No orders found for given IDs."}

        await Order.filter(user=user, id=order_id).delete()

        return {"success": True, "message": ""}

    except DoesNotExist:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"success": False, "message": "Error. Incorrect token."}


@router.get("/comments", response_model=CommentGetResponse, status_code=status.HTTP_200_OK)
async def get_comments(response: Response):
    try:
        comments = await Comment.all().prefetch_related("user")
        comments_list = [
            CommentSchema(id=comment.id, text=comment.text, username=comment.user.username) for comment in comments
        ]
        return {"success": True, "data": comments_list, "message": ""}
    except Exception as ex:
        print(ex)
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"success": False, "data": [], "message": "Error. Internal server error."}


@router.post("/comments", response_model=CommentCreateResponse, status_code=status.HTTP_200_OK)
async def create_comment(comment_data: CommentCreate, token: Annotated[str | None, Header()], response: Response):
    try:
        user = await User.get(token=token)
        await Comment.create(
            text=comment_data.text,
            user=user,
        )
        return {"success": True, "message": ""}
    except DoesNotExist:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"success": False, "message": "Error. Incorrect token."}
