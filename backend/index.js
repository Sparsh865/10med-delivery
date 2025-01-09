/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

mongoose.connect('mongodb://localhost:27017/10med-endTerm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));


const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  phone: String,
});

const User = mongoose.model('User', userSchema);


const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  salt: { type: String, required: true },
  manufacturing: { type: Date, required: true },
  expiry: { type: Date, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: true },
  category: String,
});

const Medicine = mongoose.model('Medicine', medicineSchema);


const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    quantity: Number
  }],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    nearbyLocation: String
  }
});

const Cart = mongoose.model('Cart', cartSchema);

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: { type: String, default: 'Pending' },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    nearbyLocation: String
  },
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);


const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, age, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, age, phone });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ _id: user._id }, 'your_jwt_secret',{ expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});


app.post('/api/medicines', verifyToken, async (req, res) => {
  try {
    const { name, company, salt, manufacturing, expiry, price, stock, image, category } = req.body;

    
    if (!name || !company || !salt || !manufacturing || !expiry || !price || !stock || !image) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newMedicine = new Medicine({
      name,
      company,
      salt,
      manufacturing: new Date(manufacturing),
      expiry: new Date(expiry),
      price: parseFloat(price),
      stock: parseInt(stock),
      image,
      category
    });

    const savedMedicine = await newMedicine.save();
    res.status(201).json(savedMedicine);
  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(500).json({ error: 'Error adding medicine', details: error.message });
  }
});


app.put('/api/medicines/:id', verifyToken, async (req, res) => {
  try {
    const { name, company, salt, manufacturing, expiry, price, stock, image, category } = req.body;

    
    if (!name || !company || !salt || !manufacturing || !expiry || !price || !stock || !image) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        name,
        company,
        salt,
        manufacturing: new Date(manufacturing),
        expiry: new Date(expiry),
        price: parseFloat(price),
        stock: parseInt(stock),
        image,
        category
      },
      { new: true, runValidators: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.json(updatedMedicine);
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({ error: 'Error updating medicine', details: error.message });
  }
});


app.delete('/api/medicines/:id', verifyToken, async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!deletedMedicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({ error: 'Error deleting medicine', details: error.message });
  }
});


app.get('/api/medicines', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Error fetching medicines', details: error.message });
  }
});



app.post('/api/cart', verifyToken, async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => item.medicine.toString() === medicineId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ medicine: medicineId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error adding to cart' });
  }
});


app.get('/api/cart', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.medicine');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cart' });
  }
});
app.delete('/api/cart/item/:id', verifyToken, async (req, res) => {
  try {
    const medicineId = req.params.id;
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.medicine.toString() !== medicineId);
    await cart.save();
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Error removing item from cart' });
  }
});


app.put('/api/cart/address', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { address: req.body },
      { new: true }
    );
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error updating cart address' });
  }
});


app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.medicine');
    if (!cart) return res.status(400).json({ error: 'Cart not found' });

    const order = new Order({
      user: req.user._id,
      items: cart.items.map(item => ({
        medicine: item.medicine._id,
        quantity: item.quantity,
        price: item.medicine.price
      })),
      totalAmount: cart.items.reduce((total, item) => total + item.quantity * item.medicine.price, 0),
      address: cart.address
    });

    await order.save();
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error creating order' });
  }
});


app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('items.medicine');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});


app.put('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order status' });
  }
});


app.delete('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Error deleting order' });
  }
});

app.get('/api/orders/user', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.medicine')
      .sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Error fetching user orders' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));