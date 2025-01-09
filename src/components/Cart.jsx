/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Trash2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const navigate = useNavigate()
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    nearbyLocation: ''
  })

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/cart', {
        headers: { Authorization: token }
      })
      if (response.data && response.data.items) {
        setCartItems(response.data.items.filter(item => item && item.medicine))
      } else {
        setCartItems([])
      }
      setAddress(response.data.address || {})
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Failed to fetch cart items')
      setCartItems([])
    }
  }

  const updateQuantity = async (id, change) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:3000/api/cart', {
        medicineId: id,
        quantity: change
      }, {
        headers: { Authorization: token }
      })
      fetchCart()
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }

  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:3000/api/cart/item/${id}`, {
        headers: { Authorization: token }
      })
      fetchCart()
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item from cart')
    }
  }

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === '10med') {
      setDiscount(10)
      toast.success('Coupon applied successfully!')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    if (item && item.medicine && item.medicine.price && item.quantity) {
      return sum + (item.medicine.price * item.quantity)
    }
    return sum
  }, 0)
  const shipping = 0.0
  const total = subtotal + shipping - discount

  const handleCheckout = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill in all address fields')
      return
    }
    try {
      const token = localStorage.getItem('token')
      await axios.put('http://localhost:3000/api/cart/address', address, {
        headers: { Authorization: token }
      })
      navigate('/payment', { 
        state: { 
          totalCost: total.toFixed(2),
        } 
      })
    } catch (error) {
      console.error('Error updating address:', error)
      toast.error('Failed to update address')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-xl">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <AnimatePresence>
              {cartItems.map((item) => (
                item && item.medicine && (
                  <motion.div
                    key={item.medicine._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between border-b py-4"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.medicine.image || "/placeholder.svg?height=100&width=100"}
                        alt={item.medicine.name}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <h2 className="text-lg font-semibold">{item.medicine.name}</h2>
                        <p className="text-gray-600">	₹{item.medicine.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(item.medicine._id, -1)}
                        className="bg-gray-200 rounded-full p-1"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.medicine._id, 1)}
                        className="bg-gray-200 rounded-full p-1"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeItem(item.medicine._id)}
                        className="ml-4 text-red-500"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
          <div className="md:w-1/3">
            <div className="bg-gray-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                  <span>
                    ₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                  <span>
                    ₹{shipping.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg mt-4">
                <span>Total</span>
                  <span>
                    ₹{total.toFixed(2)}</span>
              </div>
              <div className="mt-6">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  className="w-full p-2 border rounded-md mb-2"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  onClick={applyCoupon}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300"
                >
                  Apply Coupon
                </button>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <input
                type="text"
                placeholder="House Number"
                className="w-full p-2 border rounded-md mb-2"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                className="w-full p-2 border rounded-md mb-2"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="State"
                className="w-full p-2 border rounded-md mb-2"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
              <input
                type="text"
                placeholder="Pincode"
                className="w-full p-2 border rounded-md mb-2"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              />
              <input
                type="text"
                placeholder="Nearby Location"
                className="w-full p-2 border rounded-md mb-4"
                value={address.nearbyLocation}
                onChange={(e) => setAddress({ ...address, nearbyLocation: e.target.value })}
              />
              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center"
              >
                Proceed to Checkout
                <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

