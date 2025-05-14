from pydantic import BaseModel, Field

from models import Flower, Order


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    email: str = Field(max_length=50)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: str = Field()
    password: str = Field()


class UserLoginResponse(BaseModel):
    success: bool
    token: str = Field()
    message: str

class OrderCreate(BaseModel):
    flower_name: str
    quantity: int

class OrderCreateResponse(BaseModel):
    success: bool
    message: str
    
UserLogoutResponse = OrderCreateResponse
CommentCreateResponse = OrderCreateResponse
OrdersUpdateStatusResponse = OrderCreateResponse

class UserRegisterResponse(BaseModel):
    success: bool
    message: str

class FlowerSchema(BaseModel):
    id: int
    name: str
    price: float
    type: Flower.FlowerType
    category: Flower.FlowerCategory
    img_link: str
    

class OrderSchema(BaseModel):
    id: int
    status: Order.STATUSES
    flower: FlowerSchema
    quantity: int
    
    
class OrderGetResponse(BaseModel):
    success: bool
    data: list[OrderSchema]
    message: str
    

class FlowersGetResponse(BaseModel):
    success: bool
    data: list[FlowerSchema]
    message: str


class CommentSchema(BaseModel):
    id: int
    text: str
    username: str

class CommentGetResponse(BaseModel):
    success: bool
    data: list[CommentSchema]
    message: str


class CommentCreate(BaseModel):
    text: str


class OrdersUpdateStatus(BaseModel):
    order_ids: list[int]
    new_status: str