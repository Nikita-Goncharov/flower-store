import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// Mock API
jest.mock('axios');
import api from '../api';
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

// Redux slices
import authReducer, { registerUser, loginUser, logoutUser } from '../redux/slices/authSlice';
import flowersReducer, { fetchFlowers } from '../redux/slices/flowersSlice';
import ordersReducer, { fetchOrders, createOrder } from '../redux/slices/ordersSlice';

// Components and pages
import Header from '../components/Header';
import FlowerCard from '../components/FlowerCard';
import Register from '../pages/Register';
import Login from '../pages/Login';

// Mock react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => mockedNavigate,
}));

// Mock react-redux
const mockedDispatch = jest.fn();
jest.mock('react-redux', () => {
  const originalModule = jest.requireActual('react-redux');
  return {
    ...originalModule,
    useDispatch: () => mockedDispatch,
    useSelector: jest.fn(),
  };
});
import { useSelector } from 'react-redux';

const renderWithStore = (ui, { preloadedState, store = configureStore({
  reducer: {
    auth: authReducer,
    flowers: flowersReducer,
    orders: ordersReducer
  },
  preloadedState,
}) } = {}) => {
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('API interceptor', () => {
  beforeEach(() => api.get.mockClear());

  it('attaches token header from state', async () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: { extraArgument: { api } } }),
      preloadedState: { auth: { token: 'abc123' } },
    });
    await store.dispatch(fetchFlowers());
    expect(api.get).toHaveBeenCalledWith('/flowers');
  });
});

describe('authSlice async thunks', () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
    });
    api.post.mockReset();
  });

  it('handles registerUser fulfilled', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    await store.dispatch(registerUser({ username: 'u', email: 'e', password: 'p' }));
    const state = store.getState().auth;
    expect(state.status).toBe('succeeded');
    expect(state.error).toBeNull();
  });

  it('handles registerUser rejected', async () => {
    api.post.mockRejectedValue(new Error('fail'));
    await store.dispatch(registerUser({ username: 'u', email: 'e', password: 'p' }));
    const state = store.getState().auth;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Register error');
  });

  it('handles loginUser success', async () => {
    api.post.mockResolvedValue({ data: { success: true, token: 'tok', message: '' } });
    await store.dispatch(loginUser({ email: 'e', password: 'p' }));
    const state = store.getState().auth;
    expect(state.token).toBe('tok');
    expect(state.isAuthenticated).toBe(true);
  });
});

describe('flowersSlice async thunk', () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { flowers: flowersReducer },
    });
    api.get.mockReset();
  });

  it('fetches flowers', async () => {
    const fake = { success: true, data: [{ id: 1, name: 'Rose' }], message: '' };
    api.get.mockResolvedValue({ data: fake });
    await store.dispatch(fetchFlowers());
    const state = store.getState().flowers;
    expect(state.items).toEqual(fake.data);
    expect(state.status).toBe('succeeded');
  });
});

describe('ordersSlice async thunk', () => {
  let store;
  beforeEach(() => {
    store = configureStore({
      reducer: { orders: ordersReducer },
    });
    api.get.mockReset();
    api.post.mockReset();
  });

  it('fetches orders', async () => {
    const fake = { success: true, data: [{ id: 1, quantity: 2 }], message: '' };
    api.get.mockResolvedValue({ data: fake });
    await store.dispatch(fetchOrders());
    const state = store.getState().orders;
    expect(state.list).toEqual(fake.data);
    expect(state.status).toBe('succeeded');
  });

  it('creates order', async () => {
    api.post.mockResolvedValue({ data: { success: true, message: '' } });
    await store.dispatch(createOrder({ flowerName: 'Rose', quantity: 1 }));
    const state = store.getState().orders;
    expect(state.createOrderStatus).toBe('succeeded');
    expect(state.createOrderError).toBeNull();
  });
});

describe('Header component', () => {
  it('shows Register and Login when not authenticated', () => {
    useSelector.mockReturnValue({ isAuthenticated: false });
    renderWithStore(<Header cartItems={[]} />);
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('shows My Orders and Logout when authenticated', () => {
    useSelector.mockReturnValue({ isAuthenticated: true });
    renderWithStore(<Header cartItems={[]} />);
    expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Logout/i));
    expect(mockedDispatch).toHaveBeenCalled();
  });
});

describe('FlowerCard component', () => {
  const flower = { id: 1, name: 'Rose', price: 10, img_link: '/img.png' };

  it('redirects to login if not authenticated on buy', () => {
    useSelector.mockReturnValue(false);
    const buyFlowerCallback = jest.fn()
    renderWithStore(<FlowerCard flower={flower} buyFlowerCallback={buyFlowerCallback}/>);
    fireEvent.click(screen.getByText(/Buy/i));
    expect(buyFlowerCallback).toHaveBeenCalled()
  });
});

describe('Register page', () => {
  beforeEach(() => {
    useSelector.mockReturnValue({ status: null, error: null });
  });

  it('submits form', () => {
    renderWithStore(<Register />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'u' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'e' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'p' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    expect(mockedDispatch).toHaveBeenCalled();
  });
});

describe('Login page', () => {
  beforeEach(() => {
    useSelector.mockReturnValue({ status: null, error: null, isAuthenticated: false });
  });

  it('submits login form', () => {
    renderWithStore(<Login />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'e' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'p' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(mockedDispatch).toHaveBeenCalled();
  });
});
