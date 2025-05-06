from typing import Annotated

from fastapi import APIRouter, Header, Response, status, Query
from tortoise.exceptions import DoesNotExist

from models import Flower, Order, User, Comment
from api_pydantic_schemas import FlowerSchema, OrderSchema, OrderCreate, OrderCreateResponse, OrderGetResponse, FlowersGetResponse, CommentGetResponse, CommentSchema, CommentCreateResponse, CommentCreate

router = APIRouter()

@router.get("/flowers", response_model=FlowersGetResponse, status_code=status.HTTP_200_OK)
async def flowers(category: str | None = Query(default=None)):
    if category:
        flowers = await Flower.filter(category=category).values()
    else:
        flowers = await Flower.all().values()
    
    return {
        "success": True,
        "data": [FlowerSchema.model_validate(f) for f in flowers],
        "message": ""
    }


@router.get("/orders", response_model=OrderGetResponse, status_code=status.HTTP_200_OK)
async def user_orders(token: Annotated[str | None, Header()], response: Response):
    try:
        user = await User.get(token=token)
        orders = await Order.filter(user=user).prefetch_related("flower")  # to fetch flower data, without it flower will be as queryset
        order_list = [
            OrderSchema(
                id=order.id,
                status=order.status,
                flower=FlowerSchema(
                    id=order.flower.id,
                    name=order.flower.name,
                    price=order.flower.price,
                    type=order.flower.type,
                    category=order.flower.category,
                    img_link=order.flower.img_link
                ),
                quantity=order.quantity
            ) for order in orders
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
            await Order.create(
                user=user,
                flower=flower,
                quantity=order_data.quantity
            )
            return {"success": True, "message": ""}
        except DoesNotExist:
            response.status_code = status.HTTP_403_FORBIDDEN
            return {"success": False, "message": "Error. There is no that flower."}
    except DoesNotExist:
            response.status_code = status.HTTP_403_FORBIDDEN
            return {"success": False, "message": "Error. Incorrect token."}



@router.get("/comments", response_model=CommentGetResponse, status_code=status.HTTP_200_OK)
async def get_comments(response: Response):
    try:
        comments = await Comment.all().prefetch_related("user")
        comments_list = [
            CommentSchema(
                id=comment.id,
                text=comment.text,
                username=comment.user.username
            ) for comment in comments
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
